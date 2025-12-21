export type PriceCondition = "BELOW" | "ABOVE";

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;

  condition: PriceCondition;
  targetPrice: number;

  currentPrice?: number;

  createdAt: string;
  triggeredAt?: string;
  lastNotifiedAt?: string;
}
