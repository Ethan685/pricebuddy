"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionAdapter = exports.GmarketAdapter = exports.ElevenStreetAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
const ApiClient_1 = require("../../utils/ApiClient");
/**
 * 11번가 (11st) API Adapter
 * Ready for API integration
 */
class ElevenStreetAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = '11번가';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
        this.affiliateId = process.env.ELEVENST_AFFILIATE_ID || '';
    }
    async search(query, limit = 10) {
        const cacheKey = `11st:search:${query}:${limit}`;
        return await ApiClient_1.apiClient.fetchWithCache(cacheKey, async () => {
            // TODO: Implement 11번가 API when available
            // 11번가는 공식 API가 제한적이므로 파트너 문의 필요
            return this.getFallbackData(query, limit);
        }, 1800000, '11st-api');
    }
    async getPrice(productId) {
        throw new Error('Direct price lookup not supported - use search instead');
    }
    getAffiliateLink(productUrl, productId) {
        if (!this.affiliateId)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('affiliate_id', this.affiliateId);
            return url.toString();
        }
        catch (_a) {
            return `${productUrl}?affiliate_id=${this.affiliateId}`;
        }
    }
    getFallbackData(query, limit) {
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
exports.ElevenStreetAdapter = ElevenStreetAdapter;
/**
 * 지마켓 (Gmarket) API Adapter
 */
class GmarketAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = '지마켓';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
        this.affiliateId = process.env.GMARKET_AFFILIATE_ID || '';
    }
    async search(query, limit = 10) {
        const cacheKey = `gmarket:search:${query}:${limit}`;
        return await ApiClient_1.apiClient.fetchWithCache(cacheKey, async () => {
            // TODO: Implement Gmarket API (eBay Korea)
            return this.getFallbackData(query, limit);
        }, 1800000, 'gmarket-api');
    }
    async getPrice(productId) {
        throw new Error('Direct price lookup not supported - use search instead');
    }
    getAffiliateLink(productUrl, productId) {
        if (!this.affiliateId)
            return productUrl;
        return `${productUrl}&jaehuid=${this.affiliateId}`;
    }
    getFallbackData(query, limit) {
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
exports.GmarketAdapter = GmarketAdapter;
/**
 * 옥션 (Auction) API Adapter
 */
class AuctionAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = '옥션';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
        this.affiliateId = process.env.AUCTION_AFFILIATE_ID || '';
    }
    async search(query, limit = 10) {
        const cacheKey = `auction:search:${query}:${limit}`;
        return await ApiClient_1.apiClient.fetchWithCache(cacheKey, async () => {
            // TODO: Implement Auction API (eBay Korea)
            return this.getFallbackData(query, limit);
        }, 1800000, 'auction-api');
    }
    async getPrice(productId) {
        throw new Error('Direct price lookup not supported - use search instead');
    }
    getAffiliateLink(productUrl, productId) {
        if (!this.affiliateId)
            return productUrl;
        return `${productUrl}&jaehuid=${this.affiliateId}`;
    }
    getFallbackData(query, limit) {
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
exports.AuctionAdapter = AuctionAdapter;
//# sourceMappingURL=KoreaMarkets.js.map