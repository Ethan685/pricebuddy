"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Qoo10JPAdapter = exports.MercariJPAdapter = exports.AmazonJPAdapter = exports.YahooJapanAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * Yahoo Japan Shopping Adapter
 */
class YahooJapanAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Yahoo Japan';
        this.region = 'JP';
        this.currency = 'JPY';
        this.countryCode = 'JP';
    }
    async search(query, limit = 10) {
        const isIphone = query.toLowerCase().includes('iphone');
        if (isIphone) {
            return [{
                    id: 'YJ001',
                    title: 'iPhone 17 128GB SIM Free - Yahoo Japan',
                    price: 135800, // ~1.2M KRW
                    currency: 'JPY',
                    merchantName: this.name,
                    region: this.region,
                    productUrl: 'https://shopping.yahoo.co.jp/products/YJ001',
                    image: 'https://img.danawa.com/prod_img/500000/598/086/img/18086598_1.jpg?shrink=330:*&_v=20231018163558', // Another variant image
                    inStock: true,
                    rating: 4.6,
                    reviewCount: 1234
                }].map(p => ({
                ...p,
                affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
            }));
        }
        return [{
                id: 'YJ001',
                title: `${query} - Yahoo!ショッピング`,
                price: 35800,
                currency: 'JPY',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://shopping.yahoo.co.jp/products/YJ001',
                image: 'https://placehold.co/400x400/1a1a1a/4F7EFF?text=Yahoo+JP',
                inStock: true,
                rating: 4.6,
                reviewCount: 1234
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 35800,
            currency: this.currency,
            priceKRW: 318000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const sid = process.env.YAHOO_JAPAN_SID;
        if (!sid)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('sc_i', sid);
            return url.toString();
        }
        catch {
            return productUrl;
        }
    }
}
exports.YahooJapanAdapter = YahooJapanAdapter;
/**
 * Amazon JP Adapter
 */
class AmazonJPAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Amazon JP';
        this.region = 'JP';
        this.currency = 'JPY';
        this.countryCode = 'JP';
    }
    async search(query, limit = 10) {
        return [{
                id: 'AMZJP001',
                title: 'Apple iPhone 17 (256GB) - Starlight (Sim Free)',
                price: 148900,
                currency: 'JPY',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.amazon.co.jp/dp/AMZJP001',
                image: 'https://m.media-amazon.com/images/I/71GLMJ7TQiL._AC_SX679_.jpg',
                inStock: true,
                rating: 4.7,
                reviewCount: 2109
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 148900,
            currency: this.currency,
            priceKRW: 1320000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const tag = process.env.AMAZON_JP_TAG;
        if (!tag)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('tag', tag);
            return url.toString();
        }
        catch {
            return `${productUrl}?tag=${tag}`;
        }
    }
}
exports.AmazonJPAdapter = AmazonJPAdapter;
/**
 * Mercari JP Adapter (Second-hand)
 */
class MercariJPAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Mercari JP';
        this.region = 'JP';
        this.currency = 'JPY';
        this.countryCode = 'JP';
    }
    async search(query, limit = 10) {
        // Enforce iPhone 17 Demo Data always
        return [{
                id: 'MER001',
                title: 'iPhone 17 Pro Max 256GB - Clean Condition',
                price: 189000, // ~1.6M KRW
                currency: 'JPY',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://jp.mercari.com/item/MER001',
                image: 'https://img.danawa.com/prod_img/500000/039/725/img/17725039_1.jpg?shrink=330:*&_v=20230509151608',
                inStock: true,
                rating: 4.8,
                reviewCount: 543
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 189000,
            currency: this.currency,
            priceKRW: 1680000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        // Mercari doesn't have official affiliate program
        return productUrl;
    }
}
exports.MercariJPAdapter = MercariJPAdapter;
/**
 * Qoo10 JP Adapter
 */
class Qoo10JPAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Qoo10 JP';
        this.region = 'JP';
        this.currency = 'JPY';
        this.countryCode = 'JP';
    }
    async search(query, limit = 10) {
        return [{
                id: 'Q10JP001',
                title: `${query} - Qoo10`,
                price: 32800,
                currency: 'JPY',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.qoo10.jp/item/Q10JP001',
                inStock: true,
                rating: 4.4,
                reviewCount: 876
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 32800,
            currency: this.currency,
            priceKRW: 292000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.QOO10_JP_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('jaehuid', affiliateId);
            return url.toString();
        }
        catch {
            return productUrl;
        }
    }
}
exports.Qoo10JPAdapter = Qoo10JPAdapter;
