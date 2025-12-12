"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestBuyAdapter = exports.TargetAdapter = exports.eBayAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * eBay US Marketplace Adapter
 * Uses eBay Partner Network (EPN)
 */
class eBayAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = 'eBay';
        this.region = 'NA';
        this.currency = 'USD';
        this.countryCode = 'US';
        this.campaignId = process.env.EBAY_CAMPAIGN_ID || '';
    }
    async search(query, limit = 10) {
        return [{
                id: 'EBAY001',
                title: `${query} - eBay`,
                price: 269.99,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.ebay.com/itm/EBAY001',
                inStock: true,
                rating: 4.6,
                reviewCount: 1543
            }].map(p => (Object.assign(Object.assign({}, p), { affiliateUrl: this.getAffiliateLink(p.productUrl, p.id) })));
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
        if (!this.campaignId)
            return productUrl;
        // eBay Partner Network link
        return `https://rover.ebay.com/rover/1/${this.campaignId}/${productUrl}`;
    }
}
exports.eBayAdapter = eBayAdapter;
/**
 * Target Marketplace Adapter
 */
class TargetAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Target';
        this.region = 'NA';
        this.currency = 'USD';
        this.countryCode = 'US';
    }
    async search(query, limit = 10) {
        return [{
                id: 'TGT001',
                title: `${query} - Target`,
                price: 289.99,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.target.com/p/TGT001',
                inStock: true,
                rating: 4.5,
                reviewCount: 987
            }].map(p => (Object.assign(Object.assign({}, p), { affiliateUrl: this.getAffiliateLink(p.productUrl, p.id) })));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 289.99,
            currency: this.currency,
            priceKRW: 385000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.TARGET_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('afid', affiliateId);
            return url.toString();
        }
        catch (_a) {
            return productUrl;
        }
    }
}
exports.TargetAdapter = TargetAdapter;
/**
 * Best Buy Marketplace Adapter
 */
class BestBuyAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Best Buy';
        this.region = 'NA';
        this.currency = 'USD';
        this.countryCode = 'US';
    }
    async search(query, limit = 10) {
        return [{
                id: 'BB001',
                title: `${query} - Best Buy`,
                price: 299.99,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.bestbuy.com/site/BB001',
                inStock: true,
                rating: 4.7,
                reviewCount: 2134
            }].map(p => (Object.assign(Object.assign({}, p), { affiliateUrl: this.getAffiliateLink(p.productUrl, p.id) })));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 299.99,
            currency: this.currency,
            priceKRW: 399000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const affiliateId = process.env.BESTBUY_AFFILIATE_ID;
        if (!affiliateId)
            return productUrl;
        return `${productUrl}?irclickid=${affiliateId}`;
    }
}
exports.BestBuyAdapter = BestBuyAdapter;
//# sourceMappingURL=NAMarketsExtra.js.map