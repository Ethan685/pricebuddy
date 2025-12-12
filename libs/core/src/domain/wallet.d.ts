export type WalletTransactionType = "cashback" | "withdrawal" | "referral_bonus" | "subscription_payment" | "refund";
export interface WalletTransaction {
    id: string;
    userId: string;
    type: WalletTransactionType;
    amount: number;
    description: string;
    relatedOrderId?: string;
    relatedProductId?: string;
    createdAt: string;
    status: "pending" | "completed" | "failed";
}
export interface Wallet {
    userId: string;
    balance: number;
    lastUpdatedAt: string;
}
//# sourceMappingURL=wallet.d.ts.map