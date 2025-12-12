export interface Product {
    id: string;
    title: string;
    description?: string;
    // Price info
    minPrice: number;
    currency: string;

    // Media
    images: string[];
    image?: string; // Optional main image helper

    // Metadata
    createdAt?: string;
    brand?: string;
    category?: string;
    url?: string;

    // Dynamic fields
    score?: number;

    // Compatibility fields (optional)
    price?: number; // Some legacy usage
}
