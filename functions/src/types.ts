export interface Product {
    id: string;
    title: string;
    brand?: string;
    category?: string;
    images: string[];
    description?: string;
    minPrice: number;
    currency: string;
    createdAt?: string; // ISO Date for "Newest" boosting
    score?: number; // For debugging personalization
}

export interface Offer {
    id: string;
    productId: string;
    merchantName: string;
    merchantLogo?: string;
    url: string;
    basePrice: number;
    shipping: number;
    tax: number;
    duty: number;
    totalPrice: number;
    currency: string;
}

export interface CommunityPost {
    id: string;
    title: string;
    author: string;
    price: number;
    currency: string;
    votes: number;
    comments: number;
    url: string;
    imageUrl?: string;
    createdAt: any; // Firestore Timestamp
    isHot?: boolean;
}

export interface PriceHistory {
    productId: string;
    merchant: string;
    timestamp: string; // ISO Date
    price: number;
}
