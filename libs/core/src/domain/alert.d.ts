export interface PriceAlert {
    id: string;
    userId: string;
    productId: string;
    targetPrice: number;
    currentPrice: number;
    condition: "below" | "above" | "change";
    notificationEnabled: boolean;
    createdAt: string;
    triggeredAt?: string;
    isActive: boolean;
}
//# sourceMappingURL=alert.d.ts.map