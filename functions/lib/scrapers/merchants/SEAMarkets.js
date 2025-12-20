"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikiAdapter = exports.BukalapakAdapter = exports.TokopediaAdapter = exports.ShopeeAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * Shopee Adapter (Southeast Asia)
 */
class ShopeeAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Shopee';
        this.region = 'SEA';
        this.currency = 'USD';
        this.countryCode = 'SG';
    }
    async search(query, limit = 10) {
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
    async getPrice(productId) {
        return {
            productId,
            price: 259.99,
            currency: this.currency,
            priceKRW: 346000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.SHOPEE_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?af_siteid=${affiliateId}`;
    }
}
exports.ShopeeAdapter = ShopeeAdapter;
/**
 * Tokopedia Adapter (Indonesia)
 */
class TokopediaAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Tokopedia';
        this.region = 'SEA';
        this.currency = 'USD';
        this.countryCode = 'ID';
    }
    async search(query, limit = 10) {
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
        // Tokopedia affiliate
        const affiliateId = process.env.TOKOPEDIA_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?whid=${affiliateId}`;
    }
}
exports.TokopediaAdapter = TokopediaAdapter;
/**
 * Bukalapak Adapter (Indonesia)
 */
class BukalapakAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Bukalapak';
        this.region = 'SEA';
        this.currency = 'USD';
        this.countryCode = 'ID';
    }
    async search(query, limit = 10) {
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
    async getPrice(productId) {
        return {
            productId,
            price: 239.99,
            currency: this.currency,
            priceKRW: 319000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        return productUrl;
    }
}
exports.BukalapakAdapter = BukalapakAdapter;
/**
 * Tiki Adapter (Vietnam)
 */
class TikiAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Tiki';
        this.region = 'SEA';
        this.currency = 'USD';
        this.countryCode = 'VN';
    }
    async search(query, limit = 10) {
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
    async getPrice(productId) {
        return {
            productId,
            price: 229.99,
            currency: this.currency,
            priceKRW: 306000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.TIKI_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?spid=${affiliateId}`;
    }
}
exports.TikiAdapter = TikiAdapter;
