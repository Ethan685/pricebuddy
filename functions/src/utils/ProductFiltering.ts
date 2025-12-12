import { PriceValidator } from './PriceValidator';

export interface ProductFilter {
    minPrice?: number;
    maxPrice?: number;
    merchants?: string[];
    minRating?: number;
    freeShippingOnly?: boolean;
    inStockOnly?: boolean;
    excludeSuspicious?: boolean;
}

export type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'popular';

const priceValidator = new PriceValidator();

/**
 * Smart product filtering to remove suspicious/fake listings
 */
export class ProductFiltering {
    // Suspicious keywords that often indicate fake listings
    private static readonly SUSPICIOUS_KEYWORDS = [
        '미개봉',
        '새상품',
        '직수입',
        '해외직구',
        '병행수입',
        '리퍼',
        '중고',
        'B급',
        'C급'
    ];

    /**
     * Check if price is suspiciously low (likely fake)
     */
    static isSuspiciouslyLow(price: number, avgPrice: number): boolean {
        if (avgPrice === 0) return false;

        // If price is less than 50% of average, it's suspicious
        return price < avgPrice * 0.5;
    }

    /**
     * Check if product title contains suspicious keywords
     */
    static hasSuspiciousKeywords(title: string): boolean {
        const lowerTitle = title.toLowerCase();
        return this.SUSPICIOUS_KEYWORDS.some(keyword =>
            lowerTitle.includes(keyword.toLowerCase())
        );
    }

    /**
     * Remove outliers and suspicious products
     */
    static filterQuality(products: any[]): any[] {
        if (products.length < 3) return products;

        // Calculate average price (excluding extreme outliers)
        const prices = products.map(p => p.priceKRW || p.price).filter(p => p > 0);
        prices.sort((a, b) => a - b);

        // Remove top and bottom 10% for average calculation
        const trimCount = Math.floor(prices.length * 0.1);
        const trimmedPrices = prices.slice(trimCount, prices.length - trimCount);
        const avgPrice = trimmedPrices.reduce((a, b) => a + b, 0) / trimmedPrices.length;

        // Filter products
        return products.filter(product => {
            const price = product.priceKRW || product.price;

            // Remove if suspiciously low
            if (this.isSuspiciouslyLow(price, avgPrice)) {
                console.log(`Filtered suspicious price: ${product.title} - ₩${price.toLocaleString()}`);
                return false;
            }

            // Remove if has suspicious keywords
            if (this.hasSuspiciousKeywords(product.title)) {
                console.log(`Filtered suspicious keyword: ${product.title}`);
                return false;
            }

            return true;
        });
    }

    /**
     * Apply user-defined filters
     */
    static applyFilters(products: any[], filters: ProductFilter): any[] {
        return products.filter(product => {
            const price = product.priceKRW || product.price;

            // Price range filter
            if (filters.minPrice && price < filters.minPrice) return false;
            if (filters.maxPrice && price > filters.maxPrice) return false;

            // Merchant filter
            if (filters.merchants && filters.merchants.length > 0) {
                if (!filters.merchants.includes(product.merchantName)) return false;
            }

            // Rating filter
            if (filters.minRating && product.rating) {
                if (product.rating < filters.minRating) return false;
            }

            // Free shipping filter
            if (filters.freeShippingOnly && !product.isFreeShipping) {
                return false;
            }

            // In stock filter
            if (filters.inStockOnly && !product.inStock) {
                return false;
            }

            return true;
        });
    }

    /**
     * Sort products
     */
    static sortProducts(products: any[], sortBy: SortOption): any[] {
        const sorted = [...products];

        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => (a.priceKRW || a.price) - (b.priceKRW || b.price));
                break;

            case 'price-desc':
                sorted.sort((a, b) => (b.priceKRW || b.price) - (a.priceKRW || a.price));
                break;

            case 'rating':
                sorted.sort((a, b) => {
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    if (ratingB !== ratingA) return ratingB - ratingA;
                    // If same rating, sort by review count
                    return (b.reviewCount || 0) - (a.reviewCount || 0);
                });
                break;

            case 'popular':
                sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
                break;
        }

        return sorted;
    }

    /**
     * Complete filtering pipeline
     */
    static process(
        products: any[],
        filters: ProductFilter = {},
        sortBy: SortOption = 'price-asc'
    ): any[] {
        let result = [...products];

        // 1. Remove quality issues (if enabled)
        if (filters.excludeSuspicious !== false) {
            result = this.filterQuality(result);
        }

        // 2. Apply user filters
        result = this.applyFilters(result, filters);

        // 3. Sort
        result = this.sortProducts(result, sortBy);

        return result;
    }
}
