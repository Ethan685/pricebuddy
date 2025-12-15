import type { Marketplace } from "../domain/product";

export type ISODateString = string;

export type RegionMode = "kr" | "global";
export type CurrencyCode = "KRW" | "USD" | "JPY" | "EUR";

// Re-export Marketplace from domain for API types
export type { Marketplace };

