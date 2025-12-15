import type { ISODateString, RegionMode } from "./http";

export interface SearchResultItem {
  productId: string;
  title: string;
  imageUrl?: string;
  minTotalPriceKrw: number;
  maxTotalPriceKrw: number;
  priceChangePct7d?: number; // optional
  lastUpdatedAt?: ISODateString;
}

export interface SearchResponse {
  query: string;
  region: RegionMode;
  results: SearchResultItem[];
}

