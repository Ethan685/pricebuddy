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

const SCRAPER_BASE_URL = process.env.SCRAPER_BASE_URL ?? "http://scraper:8080";

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
    // Scraper 서비스가 배포되기 전까지는 Firestore에서 검색
    try {
      const { firestore } = await import("../lib/firestore");
      const admin = await import("firebase-admin");
      
      const productsRef = firestore.collection("products");
      // 제목에 검색어가 포함된 제품 검색
      const snapshot = await productsRef
        .where("title", ">=", query)
        .where("title", "<=", query + "\uf8ff")
        .orderBy("title")
        .limit(20)
        .get();
      
      const results = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          productId: doc.id,
          title: data.title || "",
          imageUrl: data.imageUrl,
          minPriceKrw: data.minPriceKrw || 0,
          maxPriceKrw: data.maxPriceKrw || 0,
          priceChangePct: data.priceChangePct,
        };
      });
      
      return results;
    } catch (error) {
      console.error("Search error:", error);
      // 오류 발생 시 빈 배열 반환 (Scraper 서비스 배포 전까지는 정상)
      return [];
    }
  },
};

