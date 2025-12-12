import { Marketplace } from "./product";

export interface Offer {
  id: string;
  productId: string;
  marketplace: Marketplace;
  externalId: string;
  url: string;
  basePrice: number;
  currency: string;   // "KRW" | "USD" | "JPY" ...
  shippingFee: number;
  taxFee: number;
  otherFee: number;
  totalPriceKrw: number; // pricing 엔진 결과
  lastFetchedAt: string; // ISO
}

