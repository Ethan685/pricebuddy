import type { Marketplace } from "@pricebuddy/core";

export interface ScrapeRequest {
  marketplace: Marketplace;
  url: string;
}

export interface ScrapeResultRaw {
  marketplace: Marketplace;
  url: string;
  fetchedAt: string;
  html: string;
}

export interface ParsedOfferOutput {
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  shippingFee?: number;
  attributes: Record<string, string>;
}

