/**
 * Base interface for all marketplace adapters
 * Allows seamless integration of new marketplaces
 */

export type Region = 'KR' | 'NA' | 'EU' | 'ASIA' | 'CN' | 'JP' | 'SEA';

export interface Product {
    id: string;
    title: string;
    price: number;
    currency: string;
    merchantName: string;
    region: Region;
    productUrl: string;
    imageUrl?: string;
    inStock: boolean;
    affiliateUrl?: string;
    rating?: number;
    reviewCount?: number;
    brand?: string;
    category?: string;
    mall?: string;
    priceKRW?: number; // Converted price
    originalPrice?: number;
    discount?: number;
    // Coupang specific
    isRocket?: boolean;
    isFreeShipping?: boolean;
}

export interface PriceInfo {
    productId: string;
    price: number;
    currency: string;
    priceKRW: number;
    lastUpdated: Date;
    inStock: boolean;
}

export interface ShippingInfo {
    cost: number;
    currency: string;
    costKRW: number;
    estimatedDays: number;
    carrier?: string;
}

/**
 * Merchant Adapter Interface
 * All marketplace integrations must implement this
 */
export interface MerchantAdapter {
    // Metadata
    readonly name: string;
    readonly region: Region;
    readonly currency: string;
    readonly countryCode: string;

    // Core methods
    search(query: string, limit?: number): Promise<Product[]>;
    getPrice(productId: string): Promise<PriceInfo>;
    getShipping?(destination: string, weight?: number): Promise<ShippingInfo>;

    // Affiliate
    getAffiliateLink(productUrl: string, productId?: string): string;

    // Utility
    isAvailable(): Promise<boolean>;
}

/**
 * Base adapter with common functionality
 */
export abstract class BaseMerchantAdapter implements MerchantAdapter {
    abstract readonly name: string;
    abstract readonly region: Region;
    abstract readonly currency: string;
    abstract readonly countryCode: string;

    abstract search(query: string, limit?: number): Promise<Product[]>;
    abstract getPrice(productId: string): Promise<PriceInfo>;
    abstract getAffiliateLink(productUrl: string, productId?: string): string;

    /**
     * Fetch with retry logic
     */
    protected async fetchWithRetry(
        url: string,
        options?: RequestInit,
        maxRetries: number = 3
    ): Promise<Response> {
        let lastError: Error | null = null;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'User-Agent': 'PriceBuddy/1.0',
                        ...options?.headers
                    }
                });

                if (response.ok) {
                    return response;
                }

                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            } catch (error) {
                lastError = error as Error;

                // Wait before retry (exponential backoff)
                if (i < maxRetries - 1) {
                    await this.sleep(Math.pow(2, i) * 1000);
                }
            }
        }

        throw lastError || new Error('Fetch failed');
    }

    /**
     * Parse price string to number
     */
    protected parsePrice(priceString: string): number {
        // Remove currency symbols and formatting
        const cleaned = priceString
            .replace(/[^0-9.,]/g, '')
            .replace(/,/g, '');

        return parseFloat(cleaned) || 0;
    }

    /**
     * Extract product ID from URL
     */
    protected extractProductId(url: string): string | null {
        // Override in specific adapters
        return null;
    }

    /**
     * Sleep utility
     */
    protected sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Default availability check
     */
    async isAvailable(): Promise<boolean> {
        return true;
    }
}

/**
 * Merchant Registry
 * Central registry for all marketplace adapters
 */
export class MerchantRegistry {
    private static merchants: Map<string, MerchantAdapter> = new Map();

    static register(adapter: MerchantAdapter): void {
        this.merchants.set(adapter.name, adapter);
    }

    static get(name: string): MerchantAdapter | undefined {
        return this.merchants.get(name);
    }

    static getAll(): MerchantAdapter[] {
        return Array.from(this.merchants.values());
    }

    static getByRegion(region: Region | 'ALL'): MerchantAdapter[] {
        if (region === 'ALL') {
            return this.getAll();
        }
        return this.getAll().filter(m => m.region === region);
    }

    static getAvailable(): Promise<MerchantAdapter[]> {
        return Promise.all(
            this.getAll().map(async m => ({
                merchant: m,
                available: await m.isAvailable()
            }))
        ).then(results =>
            results
                .filter(r => r.available)
                .map(r => r.merchant)
        );
    }
}
