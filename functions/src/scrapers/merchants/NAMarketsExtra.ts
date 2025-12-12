import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';

/**
 * eBay US Marketplace Adapter
 * Uses eBay Partner Network (EPN)
 */
export class eBayAdapter extends BaseMerchantAdapter {
    readonly name = 'eBay';
    readonly region: Region = 'NA';
    readonly currency = 'USD';
    readonly countryCode = 'US';

    private readonly campaignId: string;

    constructor() {
        super();
        this.campaignId = process.env.EBAY_CAMPAIGN_ID || '';
    }

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'EBAY001',
            title: `${query} - eBay`,
            price: 269.99,
            currency: 'USD',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.ebay.com/itm/EBAY001',
            inStock: true,
            rating: 4.6,
            reviewCount: 1543
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
            priceKRW: 359000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        if (!this.campaignId) return productUrl;

        // eBay Partner Network link
        return `https://rover.ebay.com/rover/1/${this.campaignId}/${productUrl}`;
    }
}

/**
 * Target Marketplace Adapter
 */
export class TargetAdapter extends BaseMerchantAdapter {
    readonly name = 'Target';
    readonly region: Region = 'NA';
    readonly currency = 'USD';
    readonly countryCode = 'US';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'TGT001',
            title: `${query} - Target`,
            price: 289.99,
            currency: 'USD',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.target.com/p/TGT001',
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
            price: 289.99,
            currency: this.currency,
            priceKRW: 385000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.TARGET_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('afid', affiliateId);
            return url.toString();
        } catch {
            return productUrl;
        }
    }
}

/**
 * Best Buy Marketplace Adapter
 */
export class BestBuyAdapter extends BaseMerchantAdapter {
    readonly name = 'Best Buy';
    readonly region: Region = 'NA';
    readonly currency = 'USD';
    readonly countryCode = 'US';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'BB001',
            title: `${query} - Best Buy`,
            price: 299.99,
            currency: 'USD',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.bestbuy.com/site/BB001',
            inStock: true,
            rating: 4.7,
            reviewCount: 2134
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 299.99,
            currency: this.currency,
            priceKRW: 399000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.BESTBUY_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        return `${productUrl}?irclickid=${affiliateId}`;
    }
}
