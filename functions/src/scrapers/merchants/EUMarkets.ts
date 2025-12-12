import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';

/**
 * Amazon UK Adapter
 */
export class AmazonUKAdapter extends BaseMerchantAdapter {
    readonly name = 'Amazon UK';
    readonly region: Region = 'EU';
    readonly currency = 'GBP';
    readonly countryCode = 'UK';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'AMZUK001',
            title: `${query} - Amazon UK`,
            price: 249.99,
            currency: 'GBP',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.amazon.co.uk/dp/AMZUK001',
            inStock: true,
            rating: 4.6,
            reviewCount: 1876
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 249.99,
            currency: this.currency,
            priceKRW: 420000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const tag = process.env.AMAZON_UK_TAG;
        if (!tag) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('tag', tag);
            return url.toString();
        } catch {
            return `${productUrl}?tag=${tag}`;
        }
    }
}

/**
 * Amazon DE (Germany) Adapter
 */
export class AmazonDEAdapter extends BaseMerchantAdapter {
    readonly name = 'Amazon DE';
    readonly region: Region = 'EU';
    readonly currency = 'EUR';
    readonly countryCode = 'DE';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'AMZDE001',
            title: `${query} - Amazon DE`,
            price: 269.99,
            currency: 'EUR',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.amazon.de/dp/AMZDE001',
            inStock: true,
            rating: 4.5,
            reviewCount: 1432
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 269.99,
            currency: this.currency,
            priceKRW: 390000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const tag = process.env.AMAZON_DE_TAG;
        if (!tag) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('tag', tag);
            return url.toString();
        } catch {
            return `${productUrl}?tag=${tag}`;
        }
    }
}

/**
 * Amazon FR (France) Adapter
 */
export class AmazonFRAdapter extends BaseMerchantAdapter {
    readonly name = 'Amazon FR';
    readonly region: Region = 'EU';
    readonly currency = 'EUR';
    readonly countryCode = 'FR';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'AMZFR001',
            title: `${query} - Amazon FR`,
            price: 279.99,
            currency: 'EUR',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.amazon.fr/dp/AMZFR001',
            inStock: true,
            rating: 4.4,
            reviewCount: 1198
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 279.99,
            currency: this.currency,
            priceKRW: 405000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const tag = process.env.AMAZON_FR_TAG;
        if (!tag) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('tag', tag);
            return url.toString();
        } catch {
            return `${productUrl}?tag=${tag}`;
        }
    }
}

/**
 * eBay UK Adapter
 */
export class eBayUKAdapter extends BaseMerchantAdapter {
    readonly name = 'eBay UK';
    readonly region: Region = 'EU';
    readonly currency = 'GBP';
    readonly countryCode = 'UK';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'EBAYUK001',
            title: `${query} - eBay UK`,
            price: 239.99,
            currency: 'GBP',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.ebay.co.uk/itm/EBAYUK001',
            inStock: true,
            rating: 4.5,
            reviewCount: 987
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 239.99,
            currency: this.currency,
            priceKRW: 403000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const campaignId = process.env.EBAY_UK_CAMPAIGN_ID;
        if (!campaignId) return productUrl;

        return `https://rover.ebay.com/rover/1/${campaignId}/${productUrl}`;
    }
}
