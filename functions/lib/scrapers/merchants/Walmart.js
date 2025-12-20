"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalmartAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
/**
 * Walmart Marketplace Adapter
 * Uses Walmart Open API / Affiliate API
 *
 * Setup: Sign up at https://developer.walmart.com
 * Also join Walmart Affiliates: https://affiliates.walmart.com
 */
class WalmartAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    constructor() {
        super();
        this.name = 'Walmart';
        this.region = 'NA';
        this.currency = 'USD';
        this.countryCode = 'US';
        this.apiKey = process.env.WALMART_API_KEY || '';
        this.publisherId = process.env.WALMART_PUBLISHER_ID || '';
    }
    async search(query, limit = 10) {
        if (!this.apiKey) {
            return this.searchMock(query, limit);
        }
        try {
            const url = `https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search?` +
                `query=${encodeURIComponent(query)}&` +
                `publisherId=${this.publisherId}&` +
                `numItems=${limit}&` +
                `format=json`;
            const response = await this.fetchWithRetry(url, {
                headers: {
                    'WM_SEC.ACCESS_TOKEN': this.apiKey
                }
            });
            const data = await response.json();
            return ((data.items || [])).map((item) => ({
                id: item.itemId?.toString() || '',
                title: item.name || '',
                price: item.salePrice || item.msrp || 0,
                currency: this.currency,
                merchantName: this.name,
                region: this.region,
                productUrl: item.productUrl || '',
                affiliateUrl: item.affiliateAddToCartUrl || item.productUrl,
                imageUrl: item.thumbnailImage || item.mediumImage,
                inStock: item.stock === 'Available',
                rating: item.customerRating,
                reviewCount: item.numReviews
            }));
        }
        catch (error) {
            console.error('Walmart search failed:', error);
            return this.searchMock(query, limit);
        }
    }
    searchMock(query, limit) {
        // Mock data for demo
        return [{
                id: 'WM001',
                title: `${query} - Walmart`,
                price: 279.99,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.walmart.com/ip/WM001',
                inStock: true,
                rating: 4.3,
                reviewCount: 890
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
            priceKRW: 372000,
            lastUpdated: new Date(),
            inStock: true
        };
    }
    getAffiliateLink(productUrl, productId) {
        if (!this.publisherId) {
            return productUrl;
        }
        // Walmart affiliate links use a specific format
        try {
            const url = new URL(productUrl);
            url.searchParams.set('u1', this.publisherId);
            url.searchParams.set('oid', '223073');
            url.searchParams.set('wmlspartner', this.publisherId);
            return url.toString();
        }
        catch {
            return productUrl;
        }
    }
    async isAvailable() {
        return Boolean(this.apiKey && this.publisherId);
    }
}
exports.WalmartAdapter = WalmartAdapter;
