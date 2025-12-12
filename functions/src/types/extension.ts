/**
 * Protocol for communication between Chrome Extension and Cloud Functions
 */

export interface CheckSkuRequest {
    title: string;
    productId?: string;
    currentPrice?: number;
    currency?: string;
    hostname: string;
    url?: string;
}

export interface CheckSkuResponse {
    bestMatch?: {
        source: string;
        title: string;
        price: number;
        currency: string;
        url: string;
        similarityScore?: number;
    };
    potentialSavings: number;
    matches: any[];
    coupons?: any[];
}
