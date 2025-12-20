"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eBayUKAdapter = exports.AmazonFRAdapter = exports.AmazonDEAdapter = exports.AmazonUKAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * Amazon UK Adapter
 */
class AmazonUKAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Amazon UK';
        this.region = 'EU';
        this.currency = 'GBP';
        this.countryCode = 'UK';
    }
    async search(query, limit = 10) {
        return [{
                id: 'AMZUK001',
                title: `${query} - Amazon UK`,
                price: 249.99,
                currency: 'GBP',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.amazon.co.uk/dp/AMZUK001',
                inStock: true,
                rating: 4.6,
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
            priceKRW: 420000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const tag = process.env.AMAZON_UK_TAG;
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
exports.AmazonUKAdapter = AmazonUKAdapter;
/**
 * Amazon DE (Germany) Adapter
 */
class AmazonDEAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Amazon DE';
        this.region = 'EU';
        this.currency = 'EUR';
        this.countryCode = 'DE';
    }
    async search(query, limit = 10) {
        return [{
                id: 'AMZDE001',
                title: `${query} - Amazon DE`,
                price: 269.99,
                currency: 'EUR',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.amazon.de/dp/AMZDE001',
                inStock: true,
                rating: 4.5,
                reviewCount: 1432
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
            priceKRW: 390000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const tag = process.env.AMAZON_DE_TAG;
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
exports.AmazonDEAdapter = AmazonDEAdapter;
/**
 * Amazon FR (France) Adapter
 */
class AmazonFRAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'Amazon FR';
        this.region = 'EU';
        this.currency = 'EUR';
        this.countryCode = 'FR';
    }
    async search(query, limit = 10) {
        return [{
                id: 'AMZFR001',
                title: `${query} - Amazon FR`,
                price: 279.99,
                currency: 'EUR',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.amazon.fr/dp/AMZFR001',
                inStock: true,
                rating: 4.4,
                reviewCount: 1198
            }].map(p => ({
            ...p,
            affiliateUrl: this.getAffiliateLink(p.productUrl, p.id)
        }));
    }
    async getPrice(productId) {
        return {
            productId,
            price: 279.99,
            currency: this.currency,
            priceKRW: 405000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const tag = process.env.AMAZON_FR_TAG;
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
exports.AmazonFRAdapter = AmazonFRAdapter;
/**
 * eBay UK Adapter
 */
class eBayUKAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super(...arguments);
        this.name = 'eBay UK';
        this.region = 'EU';
        this.currency = 'GBP';
        this.countryCode = 'UK';
    }
    async search(query, limit = 10) {
        return [{
                id: 'EBAYUK001',
                title: `${query} - eBay UK`,
                price: 239.99,
                currency: 'GBP',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.ebay.co.uk/itm/EBAYUK001',
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
            price: 239.99,
            currency: this.currency,
            priceKRW: 403000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        const campaignId = process.env.EBAY_UK_CAMPAIGN_ID;
        if (!campaignId)
            return productUrl;
        return `https://rover.ebay.com/rover/1/${campaignId}/${productUrl}`;
    }
}
exports.eBayUKAdapter = eBayUKAdapter;
