import type { Marketplace } from "@pricebuddy/core";

export interface ParsedOfferOutput {
  title: string;
  price?: number;
  basePrice?: number; // 호환성을 위해
  currency: string;
  imageUrl?: string;
  shippingFee?: number;
  weightKg?: number;
  externalId?: string;
  attributes: Record<string, string>;
}

import * as functions from "firebase-functions";

const config = functions.config();
const SCRAPER_BASE_URL =
  process.env.SCRAPER_BASE_URL ||
  config.scraper?.url ||
  "http://scraper:8080";

export const scraperClient = {
  async scrapeSingle(marketplace: Marketplace, url: string): Promise<ParsedOfferOutput> {
    const res = await fetch(`${SCRAPER_BASE_URL}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marketplace, url }),
    });

    if (!res.ok) {
      throw new Error(`Scraper error: ${res.status}`);
    }

    return res.json();
  },
  async search(query: string, region: string) {
    // region이 'kr'인 경우 네이버 검색 API 사용
    if (region.toLowerCase() === "kr") {
      try {
        const { naverShoppingSearch } = await import("../providers/naverShoppingSearch");
        const naverItems = await naverShoppingSearch(query);

        return naverItems.map((item) => ({
          productId: item.productId || `naver_${Math.random().toString(36).substr(2, 9)}`,
          title: item.title,
          imageUrl: item.image,
          minPriceKrw: item.lprice || 0,
          maxPriceKrw: item.lprice || 0,
          priceChangePct: 0,
          itemUrl: item.link,
          marketplace: "Naver"
        }));
      } catch (error: any) {
        console.error("Naver search error:", error);
        // 키가 없거나 에러 발생 시 빈 배열 반환 (또는 Firestore 폴백으로 이어질지 결정 필요)
        if (error.message === "NAVER_OPENAPI_KEYS_MISSING") {
          console.warn("Skipping Naver search due to missing keys.");
        }
        // 에러 발생 시 Firestore 검색으로 폴백하지 않고 빈 배열 반환 (사용자 의도: 실제 API 사용)
        return [];
      }
    }

    // 그 외(Global) 또는 에러 시 기존 Firestore 검색 유지 (현재 글로벌 스크래퍼 미연동 상태이므로)
    // 그 외(Global) 지역 처리
    // Scraper Service의 /search 엔드포인트를 호출하여 실제 데이터(SerpApi)를 가져옴
    // 실제 글로벌 검색 (Scraper Service -> SerpApi)
    const targetRegion = region === "global" ? "us" : region;

    console.log(`Calling Scraper: ${SCRAPER_BASE_URL}/search with query=${query}, region=${targetRegion}`);

    const response = await fetch(`${SCRAPER_BASE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, region: targetRegion })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Scraper failed (${response.status}): ${errorText}`);
    }

    const globalItems = await response.json();

    return globalItems.map((item: any) => {
      const estimatedKrw = this.convertToKrw(item.price, item.currency || "USD");

      let productId = "";

      // Strategy: 
      // 1. If we have a token, use it for rich details (global_ID__token__TOKEN).
      // 2. If token is missing, encode basic info into the ID (global_lite_BASE64).
      // This guarantees we can at least show the basic page without "Product Not Found".

      if (item.token) {
        const idPart = item.externalId || Math.random().toString(36).substr(2, 9);
        productId = `global_${idPart}__token__${item.token}`;
      } else {
        // Fallback: Lite Mode (Stateless)
        const liteData = JSON.stringify({
          title: item.title,
          price: item.price,
          currency: item.currency,
          image: item.imageUrl,
          url: item.itemUrl,
          marketplace: item.marketplace
        });
        const encoded = Buffer.from(liteData).toString("base64");
        productId = `global_lite_${encoded}`;
      }

      return {
        productId,
        title: item.title,
        imageUrl: item.imageUrl,
        minPriceKrw: estimatedKrw,
        price: item.price,
        currency: item.currency || "USD",
        minTotalPriceKrw: estimatedKrw,
        minPriceKrw_estimated: estimatedKrw,
        marketplace: item.marketplace,
        itemUrl: item.itemUrl
      };
    });
  },

  async getProduct(productId: string) {
    // Check for "Lite Mode" (Stateless) ID
    if (productId.startsWith("global_lite_")) {
      try {
        const encoded = productId.replace("global_lite_", "");
        const decoded = Buffer.from(encoded, "base64").toString("utf-8");
        const data = JSON.parse(decoded);

        // Reconstruct a basic product object
        const estimatedKrw = this.convertToKrw(data.price, data.currency || "USD");
        return {
          productId,
          title: data.title,
          description: `Product from ${data.marketplace}. See original site for details.`,
          imageUrl: data.image,
          rating: 0,
          reviews: 0,
          specs: {},
          offers: [{
            price: data.price,
            currency: data.currency,
            merchant: data.marketplace,
            url: data.url
          }],
          minPriceKrw: estimatedKrw,
          minTotalPriceKrw: estimatedKrw
        };
      } catch (e) {
        console.error("Failed to decode global_lite ID", e);
        throw new Error("Invalid product ID");
      }
    }

    // Normal "Rich" Mode (Token-based)
    // Remove "global_" prefix
    let externalId = productId.replace("global_", "");
    let pageToken = "";

    // Extract token if present
    if (externalId.includes("__token__")) {
      const parts = externalId.split("__token__");
      externalId = parts[0];
      pageToken = parts[1];
    }

    // Call Scraper /product endpoint
    const response = await fetch(`${SCRAPER_BASE_URL}/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: externalId, pageToken })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Scraper product fetch failed: ${response.status} ${errorText}`);
    }

    return response.json();
  },

  convertToKrw(price: number, currency: string): number {
    if (!price) return 0;
    const rates: Record<string, number> = {
      USD: 1400, EUR: 1500, GBP: 1750, JPY: 9.2, CNY: 195,
      CAD: 1000, AUD: 900, SGD: 1050, MXN: 70, INR: 16,
      KRW: 1
    };
    // Basic normalization: remove non-numeric chars if string (though type is number)
    const rate = rates[currency.toUpperCase()] ?? 1400;
    return Math.round(price * rate);
  },
};
