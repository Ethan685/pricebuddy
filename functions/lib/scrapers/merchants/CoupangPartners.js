"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoupangPartnersAdapter = void 0;
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const MerchantAdapter_1 = require("../MerchantAdapter");
const ApiClient_1 = require("../../utils/ApiClient");
const PriceValidator_1 = require("../../utils/PriceValidator");
/**
 * Coupang Partners API Adapter
 * Requires Coupang Partners account and API credentials
 */
class CoupangPartnersAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = '쿠팡';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
        this.baseUrl = 'https://api-gateway.coupang.com';
        this.accessKey = process.env.COUPANG_ACCESS_KEY || '';
        this.secretKey = process.env.COUPANG_SECRET_KEY || '';
    }
    async search(query, limit = 10) {
        if (!this.accessKey || !this.secretKey) {
            console.warn('Coupang API credentials not configured, using fallback');
            return this.getFallbackData(query, limit);
        }
        const cacheKey = `coupang:search:${query}:${limit}`;
        try {
            return await ApiClient_1.apiClient.fetchWithCache(cacheKey, async () => {
                const path = '/v2/providers/affiliate_open_api/apis/openapi/v1/products/search';
                const datetime = new Date().toISOString();
                const response = await axios_1.default.get(`${this.baseUrl}${path}`, {
                    params: {
                        keyword: query,
                        limit: Math.min(limit, 100)
                    },
                    headers: {
                        'Authorization': this.generateHMAC('GET', path, datetime),
                        'X-Requested-Date': datetime
                    },
                    timeout: 15000
                });
                return this.parseCoupangResponse(response.data);
            }, 1800000, // 30 minutes cache
            'coupang-api');
        }
        catch (error) {
            console.error('Coupang API search failed:', error.message);
            return this.getFallbackData(query, limit);
        }
    }
    parseCoupangResponse(data) {
        if (!data.data || !Array.isArray(data.data)) {
            return [];
        }
        return data.data
            .map((item) => {
            const price = item.productPrice;
            if (!PriceValidator_1.priceValidator.validate(price, 'KRW')) {
                return null;
            }
            return {
                id: String(item.productId),
                title: item.productName,
                price,
                currency: 'KRW',
                merchantName: this.name,
                region: this.region,
                productUrl: item.productUrl,
                imageUrl: item.productImage,
                inStock: true,
                affiliateUrl: item.productUrl,
                isRocket: item.isRocket,
                isFreeShipping: item.isFreeShipping,
                rating: item.rating,
                reviewCount: item.reviewCount
            };
        })
            .filter((p) => p !== null);
    }
    async getPrice(productId) {
        // Coupang API doesn't support direct product lookup
        throw new Error('Direct price lookup not supported - use search instead');
    }
    generateHMAC(method, path, datetime) {
        const message = `${datetime}${method}${path}`;
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(message)
            .digest('hex');
        return `CEA algorithm=HmacSHA256, access-key=${this.accessKey}, signed-date=${datetime}, signature=${signature}`;
    }
    getAffiliateLink(productUrl, productId) {
        // Coupang API already returns affiliate URLs
        return productUrl;
    }
    getFallbackData(query, limit) {
        console.log('Using fallback data for Coupang');
        return [{
                id: 'COUPANG_FALLBACK_001',
                title: `${query} - 쿠팡 (샘플)`,
                price: 289000,
                currency: 'KRW',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.coupang.com',
                inStock: true,
                isRocket: true,
                affiliateUrl: 'https://www.coupang.com'
            }];
    }
}
exports.CoupangPartnersAdapter = CoupangPartnersAdapter;
//# sourceMappingURL=CoupangPartners.js.map