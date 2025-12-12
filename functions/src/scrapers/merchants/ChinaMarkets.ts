import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';

/**
 * Taobao Adapter (China)
 */
export class TaobaoAdapter extends BaseMerchantAdapter {
    readonly name = 'Taobao';
    readonly region: Region = 'ASIA';
    readonly currency = 'CNY';
    readonly countryCode = 'CN';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'TB001',
            title: `${query} - 淘宝`,
            price: 1699,
            currency: 'CNY',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://item.taobao.com/item.htm?id=TB001',
            inStock: true,
            rating: 4.8,
            reviewCount: 5432
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 1699,
            currency: this.currency,
            priceKRW: 312000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        // Taobao Affiliate (淘宝客)
        const pid = process.env.TAOBAO_PID;
        if (!pid) return productUrl;

        return `https://s.click.taobao.com/t?e=${pid}&u=${encodeURIComponent(productUrl)}`;
    }
}

/**
 * JD.com Adapter (China)
 */
export class JDAdapter extends BaseMerchantAdapter {
    readonly name = 'JD.com';
    readonly region: Region = 'ASIA';
    readonly currency = 'CNY';
    readonly countryCode = 'CN';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'JD001',
            title: `${query} - 京东`,
            price: 1999,
            currency: 'CNY',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://item.jd.com/JD001.html',
            inStock: true,
            rating: 4.9,
            reviewCount: 3210
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 1999,
            currency: this.currency,
            priceKRW: 367000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const unionId = process.env.JD_UNION_ID;
        if (!unionId) return productUrl;

        return `https://u.jd.com/jda?t=${unionId}&to=${encodeURIComponent(productUrl)}`;
    }
}

/**
 * Tmall Adapter (China)
 */
export class TmallAdapter extends BaseMerchantAdapter {
    readonly name = 'Tmall';
    readonly region: Region = 'ASIA';
    readonly currency = 'CNY';
    readonly countryCode = 'CN';

    async search(query: string, limit: number = 10): Promise<Product[]> {
        return [{
            id: 'TM001',
            title: `${query} - 天猫`,
            price: 2199,
            currency: 'CNY',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://detail.tmall.com/item.htm?id=TM001',
            inStock: true,
            rating: 4.7,
            reviewCount: 2876
        }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        return {
            productId,
            price: 2199,
            currency: this.currency,
            priceKRW: 404000,
            lastUpdated: new Date(),
            inStock: true
        };
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const pid = process.env.TMALL_PID;
        if (!pid) return productUrl;

        return `https://s.click.tmall.com/t?e=${pid}&u=${encodeURIComponent(productUrl)}`;
    }
}
