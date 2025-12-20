"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazadaAdapter = exports.RakutenAdapter = exports.AliExpressAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * AliExpress Marketplace Adapter
 * Global marketplace from Alibaba Group
 */
class AliExpressAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = 'AliExpress';
        this.region = 'ASIA';
        this.currency = 'USD';
        this.countryCode = 'CN';
        this.appKey = process.env.ALIEXPRESS_APP_KEY || '';
        this.trackingId = process.env.ALIEXPRESS_TRACKING_ID || '';
    }
    async search(query, limit = 10) {
        // Mock data - actual API integration needed
        return [{
                id: 'AE001',
                title: `${query} - AliExpress`,
                price: 249.99,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.aliexpress.com/item/AE001.html',
                inStock: true,
                rating: 4.7,
                reviewCount: 2345
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 249.99,
            currency: this.currency,
            priceKRW: 333000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        if (!this.trackingId)
            return productUrl;
        // AliExpress affiliate link format
        try {
            return `https://s.click.aliexpress.com/e/${this.trackingId}`;
        }
        catch {
            return productUrl;
        }
    }
}
exports.AliExpressAdapter = AliExpressAdapter;
/**
 * Rakuten (楽天) Marketplace Adapter
 * Japan's largest e-commerce platform
 */
class RakutenAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = 'Rakuten';
        this.region = 'JP';
        this.currency = 'JPY';
        this.countryCode = 'JP';
        this.affiliateId = process.env.RAKUTEN_AFFILIATE_ID || '';
    }
    async search(query, limit = 10) {
        return [{
                id: 'RAK001',
                title: `${query} - 楽天市場`,
                price: 39800,
                currency: 'JPY',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://item.rakuten.co.jp/RAK001/',
                inStock: true,
                rating: 4.5,
                reviewCount: 1567
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 39800,
            currency: this.currency,
            priceKRW: 354000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        if (!this.affiliateId)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('scid', this.affiliateId);
            return url.toString();
        }
        catch {
            return productUrl;
        }
    }
}
exports.RakutenAdapter = RakutenAdapter;
/**
 * Lazada Marketplace Adapter
 * Southeast Asia's leading platform (Alibaba Group)
 */
class LazadaAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Lazada';
        this.region = 'SEA';
        this.currency = 'USD';
        this.countryCode = 'SG';
    }
    async search(query, limit = 10) {
        return [{
                id: 'LAZ001',
                title: `${query} - Lazada`,
                price: 269.99,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.lazada.sg/products/LAZ001',
                inStock: true,
                rating: 4.4,
                reviewCount: 892
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 269.99,
            currency: this.currency,
            priceKRW: 359000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.LAZADA_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?aff_short_key=${affiliateId}`;
    }
}
exports.LazadaAdapter = LazadaAdapter;
