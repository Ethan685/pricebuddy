"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmallAdapter = exports.JDAdapter = exports.TaobaoAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * Taobao Adapter (China)
 */
class TaobaoAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Taobao';
        this.region = 'ASIA';
        this.currency = 'CNY';
        this.countryCode = 'CN';
    }
    async search(query, limit = 10) {
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
    async getPrice(productId) {
        return {
            productId,
            price: 1699,
            currency: this.currency,
            priceKRW: 312000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        // Taobao Affiliate (淘宝客)
        const pid = process.env.TAOBAO_PID;
        if (!pid)
            return productUrl;
        return `https://s.click.taobao.com/t?e=${pid}&u=${encodeURIComponent(productUrl)}`;
    }
}
exports.TaobaoAdapter = TaobaoAdapter;
/**
 * JD.com Adapter (China)
 */
class JDAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'JD.com';
        this.region = 'ASIA';
        this.currency = 'CNY';
        this.countryCode = 'CN';
    }
    async search(query, limit = 10) {
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
    async getPrice(productId) {
        return {
            productId,
            price: 1999,
            currency: this.currency,
            priceKRW: 367000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const unionId = process.env.JD_UNION_ID;
        if (!unionId)
            return productUrl;
        return `https://u.jd.com/jda?t=${unionId}&to=${encodeURIComponent(productUrl)}`;
    }
}
exports.JDAdapter = JDAdapter;
/**
 * Tmall Adapter (China)
 */
class TmallAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Tmall';
        this.region = 'ASIA';
        this.currency = 'CNY';
        this.countryCode = 'CN';
    }
    async search(query, limit = 10) {
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
    async getPrice(productId) {
        return {
            productId,
            price: 2199,
            currency: this.currency,
            priceKRW: 404000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const pid = process.env.TMALL_PID;
        if (!pid)
            return productUrl;
        return `https://s.click.tmall.com/t?e=${pid}&u=${encodeURIComponent(productUrl)}`;
    }
}
exports.TmallAdapter = TmallAdapter;
