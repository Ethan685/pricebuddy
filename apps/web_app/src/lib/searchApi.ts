import { apiGet } from "./apiClient";

export type SearchResult = {
  ok: boolean;
  q: string;
  region: string;
  results: Array<{
    id: string;
    title: string;
    image?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    offers?: Array<any>;
    offerCount?: number;
    priceHistory?: Array<any>;
  }>;
};

export async function apiSearchProducts(query: string, region: string) {
  return apiGet<SearchResult>("/apiSearchProducts", { query, region });
}
