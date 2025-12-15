import type { ISODateString, Marketplace, CurrencyCode } from "./http";

export interface ExtOfferDTO {
  marketplace: Marketplace;
  url: string;
  basePrice: number;
  currency: CurrencyCode;
  totalPriceKrw: number;
  lastFetchedAt?: ISODateString;
}

export interface ExtInspectResponse {
  product: { id: string; title: string };
  currentOffer: ExtOfferDTO;
  bestOffer: ExtOfferDTO;
  bestPriceKrw: number;
  baselinePriceKrw: number;
  savingKrw: number;
  savingPct: number; // 0.18 => 18%
}

