export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number; // KRW
  currentPrice: number; // KRW
  condition: "below" | "above" | "change";
  notificationEnabled: boolean;
  createdAt: string;
  triggeredAt?: string;
  isActive: boolean;
}

