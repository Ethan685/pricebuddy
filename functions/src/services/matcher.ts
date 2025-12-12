
export interface GroupedProduct {
    id: string;
    title: string;
    image: string;
    minPrice: number;
    maxPrice: number;
    currency: string;
    offers: any[];
    offerCount: number;
    priceHistory: any[];
    priceChange: number;
    priceChangePercent: number;
    // ... preserve other fields from the input products if needed
    category?: string;
    brand?: string;
}

export class MatcherService {
    /**
     * Group products by title similarity and create aggregate views.
     */
    static groupProducts(products: any[]): GroupedProduct[] {
        if (products.length === 0) return [];

        const groups: Map<string, any> = new Map();

        products.forEach(product => {
            const key = this.generateMatchKey(product);

            if (!groups.has(key)) {
                // Initialize new group
                groups.set(key, this.createGroupFromProduct(product));
            } else {
                // Add to existing group
                this.addProductToGroup(groups.get(key), product);
            }
        });

        const grouped = Array.from(groups.values());

        // Post-processing: Sort offers, history, etc.
        grouped.forEach(group => {
            this.finalizeGroup(group);
        });

        // Sort groups by price
        grouped.sort((a, b) => a.minPrice - b.minPrice);

        return grouped;
    }

    private static generateMatchKey(product: any): string {
        const id = product.id || '';
        const title = product.title || '';

        // If ID is strong (e.g. from same catalog), use it. 
        // For now, we rely on title similarity for cross-merchant matching.

        // Normalize title
        const normalized = title
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\sㄱ-ㅎ가-힣]/g, '')
            .trim();

        // Extract key terms (simple 5-word key for demo)
        return normalized.split(' ')
            .filter((w: string) => w.length > 1)
            .slice(0, 5)
            .sort()
            .join(' ');
    }

    private static createGroupFromProduct(product: any): any {
        return {
            id: product.id,
            title: product.title,
            image: product.image,
            category: product.category,
            minPrice: product.priceKRW || product.price,
            maxPrice: product.priceKRW || product.price,
            currency: 'KRW', // Normalized currency
            offers: [this.mapToOffer(product)],
            offerCount: 1,
            // History and change data will be solidified in finalizeGroup
        };
    }

    private static addProductToGroup(group: any, product: any): void {
        group.offers.push(this.mapToOffer(product));

        const price = product.priceKRW || product.price;
        group.minPrice = Math.min(group.minPrice, price);
        group.maxPrice = Math.max(group.maxPrice, price);
        group.offerCount++;
    }

    private static mapToOffer(product: any): any {
        return {
            merchantName: product.merchantName,
            price: product.price,
            priceKRW: product.priceKRW,
            currency: product.currency,
            productUrl: product.productUrl,
            affiliateUrl: product.affiliateUrl,
            rating: product.rating,
            reviewCount: product.reviewCount,
            inStock: product.inStock
        };
    }

    private static finalizeGroup(group: any): void {
        // Sort offers by price
        group.offers.sort((a: any, b: any) => (a.priceKRW || a.price) - (b.priceKRW || b.price));

        // Generate Price History (Mock logic moved here)
        group.priceHistory = this.generatePriceHistory(group.minPrice, 30);

        // Calculate price change stats
        const firstPrice = group.priceHistory[0].price;
        const priceChange = group.minPrice - firstPrice;
        const priceChangePercent = Math.round((priceChange / firstPrice) * 100);

        group.priceChange = priceChange;
        group.priceChangePercent = priceChangePercent;
    }

    private static generatePriceHistory(currentPrice: number, days: number = 30): any[] {
        const history = [];
        const today = new Date();
        let basePrice = currentPrice * 1.15; // Start 15% higher

        for (let i = days; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Random fluctuation ±5%
            const fluctuation = (Math.random() - 0.5) * 0.1;
            const dailyPrice = Math.round(basePrice * (1 + fluctuation));

            // Gradual decrease
            basePrice = basePrice * 0.995;

            history.push({
                date: date.toISOString().split('T')[0].slice(5),
                price: dailyPrice,
                merchant: 'Average'
            });
        }
        history[history.length - 1].price = currentPrice;
        return history;
    }
}
