export type WalletTransactionType =
  | "cashback"
  | "withdrawal"
  | "referral_bonus"
  | "subscription_payment"
  | "refund";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number; // KRW
  description: string;
  relatedOrderId?: string;
  relatedProductId?: string;
  createdAt: string;
  status: "pending" | "completed" | "failed";
}

export interface Wallet {
  userId: string;
  balance: number; // KRW (ledger에서 계산된 값)
  lastUpdatedAt: string;
}

