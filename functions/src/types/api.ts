import { Product } from '../types';

// === Generic API Response Wrapper ===
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

// === Feed API ===
// GET /api/feed
export interface GetFeedRequest {
    limit?: number; // Optional limit (default 12)
    category?: string; // Optional filtering
}

export interface GetFeedResponse {
    products: Product[];
    personalized: boolean;
    timestamp: number;
}

// === Search API ===
// GET /api/search
export interface SearchRequest {
    query: string;
    region?: string; // 'KR', 'US', 'JP', 'ALL'
    locale?: string; // e.g. 'ko-KR', 'en-US'
    limit?: number;
    sort?: 'relevance' | 'price_asc' | 'price_desc';
}

// === Alerts API ===
// POST /api/alert
export interface CreatePriceAlertRequest {
    productId: string;
    targetPrice: number;
    currentPrice: number;
    email?: string; // Optional if authenticated
    fcmToken?: string; // For mobile push
}

export interface CreatePriceAlertResponse {
    alertId: string;
    status: 'active' | 'pending' | 'triggered' | 'cancelled';
    message: string;
}
