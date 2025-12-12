import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';

/**
 * Shopee Adapter (Southeast Asia)
 */
export class ShopeeAdapter extends BaseMerchantAdapter {
    readonly name = 'Shopee';
    readonly region: Region = 'SEA';
    readonly currency = 'USD';
    readonly countryCode = 'SG';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'SP001',
            title: `${query} - Shopee`,
            price: 259.99,
            currency: 'USD',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://shopee.sg/product/SP001',
            inStock: true,
            rating: 4.8,
            reviewCount: 3214
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 259.99,
            currency: this.currency,
            priceKRW: 346000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.SHOPEE_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        return `${productUrl}?af_siteid=${affiliateId}`;
    }
}

/**
 * Tokopedia Adapter (Indonesia)
 */
export class TokopediaAdapter extends BaseMerchantAdapter {
    readonly name = 'Tokopedia';
    readonly region: Region = 'SEA';
    readonly currency = 'USD';
    readonly countryCode = 'ID';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'TKP001',
            title: `${query} - Tokopedia`,
            price: 249.99,
            currency: 'USD',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.tokopedia.com/product/TKP001',
            inStock: true,
            rating: 4.7,
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
            priceKRW: 333000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        // Tokopedia affiliate
        const affiliateId = process.env.TOKOPEDIA_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        return `${productUrl}?whid=${affiliateId}`;
    }
}

/**
 * Bukalapak Adapter (Indonesia)
 */
export class BukalapakAdapter extends BaseMerchantAdapter {
    readonly name = 'Bukalapak';
    readonly region: Region = 'SEA';
    readonly currency = 'USD';
    readonly countryCode = 'ID';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'BL001',
            title: `${query} - Bukalapak`,
            price: 239.99,
            currency: 'USD',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.bukalapak.com/p/BL001',
            inStock: true,
            rating: 4.6,
            reviewCount: 1432
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
            priceKRW: 319000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        return productUrl;
    }
}

/**
 * Tiki Adapter (Vietnam)
 */
export class TikiAdapter extends BaseMerchantAdapter {
    readonly name = 'Tiki';
    readonly region: Region = 'SEA';
    readonly currency = 'USD';
    readonly countryCode = 'VN';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'TIKI001',
            title: `${query} - Tiki`,
            price: 229.99,
            currency: 'USD',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://tiki.vn/product/TIKI001',
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
            price: 229.99,
            currency: this.currency,
            priceKRW: 306000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.TIKI_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        return `${productUrl}?spid=${affiliateId}`;
    }
}
