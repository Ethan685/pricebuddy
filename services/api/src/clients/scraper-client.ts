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
    // TODO: 실제 검색 구현
    return [];
  },
};

