export interface Product {
    id: string;
    title: string;
    brand?: string;
    category?: string;
    images: string[];
    minPrice: number;
    currency: string;
    createdAt?: string;
    score?: number;
    // Extended fields for Generic/Scraper usage
    price?: number;
    priceKRW?: number;
    mall?: string;
    image?: string;
    imageUrl?: string;
    productUrl?: string;
    affiliateUrl?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
    isInternational?: boolean;
    offers?: Offer[];
    offerCount?: number;
    priceHistory?: { date: string; price: number; merchant: string }[];
    priceChange?: number;
    priceChangePercent?: number;
    provider?: string;
    merchantName?: string;
    verified?: boolean;
    since?: string;
    rate?: number | string;
}

export interface GlobalSearchResult {
    query: string;
    region: string;
    totalResults: number;
    merchants: string[];
    products: Product[];
}

export interface CommunityPost {
    id: string;
    title: string;
    author: string;
    authorName?: string;
    price: number;
    currency: string;
    votes: number;
    comments: number;
    url: string;
    imageUrl?: string;
    createdAt: string;
    isHot?: boolean;
}

export interface Offer {
    id?: string;
    merchantName: string;
    totalPrice?: number; // Some use price
    price?: number;
    priceKRW?: number;
    currency?: string;
    url?: string;
    productUrl?: string;
    affiliateUrl?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
}

export interface CashbackOffer {
    id: string;
    merchantName: string;
    logo?: string;
    rate: string; // e.g. "5%" or "₩2,000"
    description: string;
    link: string;
}
