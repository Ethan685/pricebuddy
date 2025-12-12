import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';
import { apiClient } from '../../utils/ApiClient';

/**
 * 11번가 (11st) API Adapter
 * Ready for API integration
 */
export class ElevenStreetAdapter extends BaseMerchantAdapter {
    readonly name = '11번가';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    private affiliateId: string;

    constructor() {
        super();
        this.affiliateId = process.env.ELEVENST_AFFILIATE_ID || '';
    }

    async search(query: string, limit: number = 10): Promise<Product[]> {
        const cacheKey = `11st:search:${query}:${limit}`;

        return await apiClient.fetchWithCache(
            cacheKey,
            async () => {
                // TODO: Implement 11번가 API when available
                // 11번가는 공식 API가 제한적이므로 파트너 문의 필요
                return this.getFallbackData(query, limit);
            },
            1800000,
            '11st-api'
        );
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        throw new Error('Direct price lookup not supported - use search instead');
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        if (!this.affiliateId) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('affiliate_id', this.affiliateId);
            return url.toString();
        } catch {
            return `${productUrl}?affiliate_id=${this.affiliateId}`;
        }
    }

    private getFallbackData(query: string, limit: number): Product[] {
        return [{
            id: '11ST' + Date.now(),
            title: `${query} - 11번가 (샘플)`,
            price: 299000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.11st.co.kr',
            inStock: true,
            affiliateUrl: this.getAffiliateLink('https://www.11st.co.kr')
        }];
    }
}

/**
 * 지마켓 (Gmarket) API Adapter
 */
export class GmarketAdapter extends BaseMerchantAdapter {
    readonly name = '지마켓';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    private affiliateId: string;

    constructor() {
        super();
        this.affiliateId = process.env.GMARKET_AFFILIATE_ID || '';
    }

    async search(query: string, limit: number = 10): Promise<Product[]> {
        const cacheKey = `gmarket:search:${query}:${limit}`;

        return await apiClient.fetchWithCache(
            cacheKey,
            async () => {
                // TODO: Implement Gmarket API (eBay Korea)
                return this.getFallbackData(query, limit);
            },
            1800000,
            'gmarket-api'
        );
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        throw new Error('Direct price lookup not supported - use search instead');
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        if (!this.affiliateId) return productUrl;
        return `${productUrl}&jaehuid=${this.affiliateId}`;
    }

    private getFallbackData(query: string, limit: number): Product[] {
        return [{
            id: 'GM' + Date.now(),
            title: `${query} - 지마켓 (샘플)`,
            price: 285000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://item.gmarket.co.kr',
            inStock: true,
            affiliateUrl: this.getAffiliateLink('https://item.gmarket.co.kr')
        }];
    }
}

/**
 * 옥션 (Auction) API Adapter
 */
export class AuctionAdapter extends BaseMerchantAdapter {
    readonly name = '옥션';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    private affiliateId: string;

    constructor() {
        super();
        this.affiliateId = process.env.AUCTION_AFFILIATE_ID || '';
    }

    async search(query: string, limit: number = 10): Promise<Product[]> {
        const cacheKey = `auction:search:${query}:${limit}`;

        return await apiClient.fetchWithCache(
            cacheKey,
            async () => {
                // TODO: Implement Auction API (eBay Korea)
                return this.getFallbackData(query, limit);
            },
            1800000,
            'auction-api'
        );
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        throw new Error('Direct price lookup not supported - use search instead');
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        if (!this.affiliateId) return productUrl;
        return `${productUrl}&jaehuid=${this.affiliateId}`;
    }

    private getFallbackData(query: string, limit: number): Product[] {
        return [{
            id: 'AUC' + Date.now(),
            title: `${query} - 옥션 (샘플)`,
            price: 289000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.auction.co.kr',
            inStock: true,
            affiliateUrl: this.getAffiliateLink('https://www.auction.co.kr')
        }];
    }
}
