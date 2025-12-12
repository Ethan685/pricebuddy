export type Marketplace = "coupang" | "naver" | "amazon" | "aliexpress" | "ebay" | "yahoo_jp" | "rakuten" | "mercari";

export interface Product {
    id: string;            // Internal SKU
    title: string;
    brand?: string;
    categoryPath: string[];
    imageUrl?: string;
    attributes: Record<string, string>; // color, size, usage, etc.
}

export interface Offer {
    id: string;
    productId: string;
    marketplace: Marketplace;
    externalId: string;    // External Product ID
    url: string;
    basePrice: number;     // Original Currency Price
    currency: string;
    shippingFee: number;
    taxFee: number;
    otherFee: number;
    totalPriceKrw: number; // Final Calculated Price (KRW)
    lastFetchedAt: string; // ISO Date string
}

export interface PriceHistoryPoint {
    offerId: string;
    ts: string;     // ISO
    price: number;
    totalPriceKrw: number;
}

export interface UserAlert {
    id: string;
    userId: string;
    productId: string;
    targetPriceKrw: number;
    isActive: boolean;
}

export interface ReviewSummary {
    productId: string;
    pros: string[];
    cons: string[];
    riskFactors: string[];
    sentimentScore: number; // -1 to 1
}
