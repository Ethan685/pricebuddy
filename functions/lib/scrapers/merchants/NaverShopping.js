"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaverShoppingAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const MerchantAdapter_1 = require("../MerchantAdapter");
const ApiClient_1 = require("../../utils/ApiClient");
const PriceValidator_1 = require("../../utils/PriceValidator");
/**
 * Naver Shopping API Adapter
 * Uses official Naver Search API for shopping
 */
class NaverShoppingAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = '네이버쇼핑';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
        this.clientId = process.env.NAVER_CLIENT_ID || '';
        this.clientSecret = process.env.NAVER_CLIENT_SECRET || '';
    }
    async search(query, limit = 10) {
        if (!this.clientId || !this.clientSecret) {
            console.warn('Naver API credentials not configured, using fallback');
            return this.getFallbackData(query, limit);
        }
        const cacheKey = `naver:search:${query}:${limit}`;
        try {
            return await ApiClient_1.apiClient.fetchWithCache(cacheKey, async () => {
                const response = await axios_1.default.get('https://openapi.naver.com/v1/search/shop.json', {
                    params: {
                        query,
                        display: Math.min(limit, 100),
                        sort: 'sim' // similarity
                    },
                    headers: {
                        'X-Naver-Client-Id': this.clientId,
                        'X-Naver-Client-Secret': this.clientSecret
                    },
                    timeout: 10000
                });
                return this.parseNaverResponse(response.data);
            }, 1800000, // 30 minutes cache
            'naver-api');
        }
        catch (error) {
            console.error('Naver API search failed:', error.message);
            // Return fallback data on error
            return this.getFallbackData(query, limit);
        }
    }
    parseNaverResponse(data) {
        if (!data.items || !Array.isArray(data.items)) {
            return [];
        }
        return data.items
            .map((item) => {
            // Parse and validate price
            const price = PriceValidator_1.priceValidator.sanitizePrice(item.lprice);
            if (!price || !PriceValidator_1.priceValidator.validate(price, 'KRW')) {
                return null;
            }
            return {
                id: item.productId || this.extractProductId(item.link),
                title: this.cleanHtml(item.title),
                price,
                currency: 'KRW',
                merchantName: this.name,
                region: this.region,
                productUrl: item.link,
                image: item.image, // Changed from imageUrl to image
                inStock: true,
                affiliateUrl: this.getAffiliateLink(item.link, item.productId),
                brand: item.brand,
                category: item.category1,
                mall: item.mallName,
                // Mock review data for UI demonstration since API doesn't return it
                rating: 4.0 + (parseInt(item.productId || '0', 10) % 10) / 10, // 4.0 ~ 4.9
                reviewCount: Math.floor(Math.random() * 2000) + 50 // 50 ~ 2050
            };
        })
            .filter((p) => p !== null);
    }
    async getPrice(productId) {
        // Naver doesn't have direct product lookup API
        // Would need to search by product name or use web scraping
        throw new Error('Direct price lookup not supported - use search instead');
    }
    cleanHtml(html) {
        return html
            .replace(/<\/?b>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .trim();
    }
    getAffiliateLink(productUrl, productId) {
        const partnerId = process.env.NAVER_PARTNER_ID;
        if (!partnerId)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('NaPm', partnerId);
            return url.toString();
        }
        catch {
            return `${productUrl}?NaPm=${partnerId}`;
        }
    }
    getFallbackData(query, limit) {
        // Fallback to mock data if API fails
        console.log('Using fallback data for Naver');
        return [{
                id: 'NAVER_FALLBACK_001',
                title: `${query} - 네이버쇼핑 (샘플)`,
                price: 299000,
                currency: 'KRW',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://shopping.naver.com',
                inStock: true,
                affiliateUrl: 'https://shopping.naver.com',
                mall: '네이버쇼핑'
            }];
    }
}
exports.NaverShoppingAdapter = NaverShoppingAdapter;
