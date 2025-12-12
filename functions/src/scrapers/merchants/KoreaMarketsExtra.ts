import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';

/**
 * SSG.COM Adapter (신세계)
 */
export class SSGAdapter extends BaseMerchantAdapter {
    readonly name = 'SSG.COM';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'SSG001',
            title: `${query} - SSG.COM`,
            price: 295000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.ssg.com/item/SSG001',
            inStock: true,
            rating: 4.5,
            reviewCount: 678
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 295000,
            currency: this.currency,
            priceKRW: 295000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.SSG_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('ckwhere', affiliateId);
            return url.toString();
        } catch {
            return productUrl;
        }
    }
}

/**
 * 롯데온 (Lotte ON) Adapter
 */
export class LotteONAdapter extends BaseMerchantAdapter {
    readonly name = '롯데온';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'LOTTE001',
            title: `${query} - 롯데온`,
            price: 289000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.lotteon.com/p/product/LOTTE001',
            inStock: true,
            rating: 4.4,
            reviewCount: 543
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 289000,
            currency: this.currency,
            priceKRW: 289000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.LOTTEON_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        return `${productUrl}?affid=${affiliateId}`;
    }
}

/**
 * 위메프 (WeMakePrice) Adapter
 */
export class WemakePriceAdapter extends BaseMerchantAdapter {
    readonly name = '위메프';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'WMP001',
            title: `${query} - 위메프`,
            price: 279000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://front.wemakeprice.com/product/WMP001',
            inStock: true,
            rating: 4.3,
            reviewCount: 456
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 279000,
            currency: this.currency,
            priceKRW: 279000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.WEMAKEPRICE_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        return `${productUrl}?source=${affiliateId}`;
    }
}

/**
 * 티몬 (Tmon) Adapter
 */
export class TmonAdapter extends BaseMerchantAdapter {
    readonly name = '티몬';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'TMON001',
            title: `${query} - 티몬`,
            price: 275000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.tmon.co.kr/deal/TMON001',
            inStock: true,
            rating: 4.2,
            reviewCount: 389
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 275000,
            currency: this.currency,
            priceKRW: 275000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const affiliateId = process.env.TMON_AFFILIATE_ID;
        if (!affiliateId) return productUrl;

        return `${productUrl}?aff=${affiliateId}`;
    }
}
