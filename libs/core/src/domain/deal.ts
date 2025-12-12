import { Product } from "./product";

export interface Deal {
  id: string;
  productId: string;
  product: Product;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  marketplace: string;
  url: string;
  validUntil: string; // ISO timestamp
  isFlashDeal: boolean;
  stockCount?: number;
  createdAt: string;
}

