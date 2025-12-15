import type { ISODateString, Marketplace, CurrencyCode } from "./http";

export interface ProductDTO {
  id: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  categoryPath?: string[];
  attributes?: Record<string, string>;
}

export interface OfferDTO {
  id: string;
  productId: string;
  marketplace: Marketplace;
  url: string;
  externalId: string;

  basePrice: number;
  currency: CurrencyCode;

  // pricing engine result
  itemPriceKrw: number;
  shippingFeeKrw: number;
  taxFeeKrw: number;
  totalPriceKrw: number;

  lastFetchedAt: ISODateString;
}

export interface PriceHistoryPointDTO {
  ts: ISODateString;
  totalPriceKrw: number;
}

export interface AISignalDTO {
  label: "BUY" | "WAIT" | "NEUTRAL";
  confidence: number; // 0~1
  reason: string;
}

export interface ProductDetailResponse {
  product: ProductDTO;
  offers: OfferDTO[];
  historyDaily?: PriceHistoryPointDTO[];
  aiSignal?: AISignalDTO;
  reviewSummary?: {
    sentimentScore: number; // -1~1
    pros: string[];
    cons: string[];
    risks: string[];
  };
}

