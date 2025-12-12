"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmonAdapter = exports.WemakePriceAdapter = exports.LotteONAdapter = exports.SSGAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * SSG.COM Adapter (신세계)
 */
class SSGAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'SSG.COM';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
    }
    async search(query, limit = 10) {
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
            }].map(p => (Object.assign(Object.assign({}, p), { affiliateUrl: this.getAffiliateLink(p.productUrl, p.id) })));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 295000,
            currency: this.currency,
            priceKRW: 295000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.SSG_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('ckwhere', affiliateId);
            return url.toString();
        }
        catch (_a) {
            return productUrl;
        }
    }
}
exports.SSGAdapter = SSGAdapter;
/**
 * 롯데온 (Lotte ON) Adapter
 */
class LotteONAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = '롯데온';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
    }
    async search(query, limit = 10) {
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
            }].map(p => (Object.assign(Object.assign({}, p), { affiliateUrl: this.getAffiliateLink(p.productUrl, p.id) })));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 289000,
            currency: this.currency,
            priceKRW: 289000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.LOTTEON_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?affid=${affiliateId}`;
    }
}
exports.LotteONAdapter = LotteONAdapter;
/**
 * 위메프 (WeMakePrice) Adapter
 */
class WemakePriceAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = '위메프';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
    }
    async search(query, limit = 10) {
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
            }].map(p => (Object.assign(Object.assign({}, p), { affiliateUrl: this.getAffiliateLink(p.productUrl, p.id) })));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 279000,
            currency: this.currency,
            priceKRW: 279000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.WEMAKEPRICE_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?source=${affiliateId}`;
    }
}
exports.WemakePriceAdapter = WemakePriceAdapter;
/**
 * 티몬 (Tmon) Adapter
 */
class TmonAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = '티몬';
        this.region = 'KR';
        this.currency = 'KRW';
        this.countryCode = 'KR';
    }
    async search(query, limit = 10) {
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
            }].map(p => (Object.assign(Object.assign({}, p), { affiliateUrl: this.getAffiliateLink(p.productUrl, p.id) })));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 275000,
            currency: this.currency,
            priceKRW: 275000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.TMON_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?aff=${affiliateId}`;
    }
}
exports.TmonAdapter = TmonAdapter;
//# sourceMappingURL=KoreaMarketsExtra.js.map