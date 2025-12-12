"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonUSAdapter = void 0;
const MerchantAdapter_1 = require("../MerchantAdapter");
const ApiClient_1 = require("../../utils/ApiClient");
const PriceValidator_1 = require("../../utils/PriceValidator");
// Note: Uncomment after npm install paapi5-nodejs-sdk
// import * as paapi5 from 'paapi5-nodejs-sdk';
/**
 * Amazon Product Advertising API 5.0 Adapter
 * Requires Amazon Associates account and PAAPI access
 */
class AmazonUSAdapter extends MerchantAdapter_1.BaseMerchantAdapter {
    // private client: any; // PAAPI client
    constructor() {
        super();
        this.name = 'Amazon US';
        this.region = 'NA';
        this.currency = 'USD';
        this.countryCode = 'US';
        this.accessKey = process.env.AMAZON_ACCESS_KEY || '';
        this.secretKey = process.env.AMAZON_SECRET_KEY || '';
        this.partnerTag = process.env.AMAZON_ASSOCIATE_TAG || '';
        // Initialize PAAPI client when credentials available
        // if (this.accessKey && this.secretKey && this.partnerTag) {
        //     const credentials = new paapi5.Credentials(
        //         this.accessKey,
        //         this.secretKey,
        //         this.partnerTag
        //     );
        //     this.client = new paapi5.DefaultApi(credentials);
        // }
    }
    async search(query, limit = 10) {
        if (!this.accessKey || !this.secretKey || !this.partnerTag) {
            console.warn('Amazon PAAPI credentials not configured, using fallback');
            return this.getFallbackData(query, limit);
        }
        const cacheKey = `amazon:search:${query}:${limit}`;
        try {
            return await ApiClient_1.apiClient.fetchWithCache(cacheKey, async () => {
                // TODO: Implement actual PAAPI call
                // const searchRequest = {
                //     Keywords: query,
                //     Resources: [
                //         'Images.Primary.Large',
                //         'ItemInfo.Title',
                //         'Offers.Listings.Price',
                //         'ItemInfo.ByLineInfo',
                //         'CustomerReviews.StarRating'
                //     ],
                //     ItemCount: Math.min(limit, 10),
                //     PartnerTag: this.partnerTag,
                //     PartnerType: 'Associates',
                //     Marketplace: 'www.amazon.com'
                // };
                // const response = await this.client.searchItems(searchRequest);
                // return this.parseAmazonResponse(response);
                // For now, return enhanced fallback
                return this.getFallbackData(query, limit);
            }, 1800000, // 30 minutes cache
            'amazon-api');
        }
        catch (error) {
            console.error('Amazon PAAPI search failed:', error.message);
            return this.getFallbackData(query, limit);
        }
    }
    parseAmazonResponse(response) {
        var _a;
        if (!((_a = response.SearchResult) === null || _a === void 0 ? void 0 : _a.Items)) {
            return [];
        }
        return response.SearchResult.Items
            .map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            const price = ((_d = (_c = (_b = (_a = item.Offers) === null || _a === void 0 ? void 0 : _a.Listings) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.Price) === null || _d === void 0 ? void 0 : _d.Amount) || 0;
            if (!PriceValidator_1.priceValidator.validate(price, 'USD')) {
                return null;
            }
            return {
                id: item.ASIN,
                title: ((_f = (_e = item.ItemInfo) === null || _e === void 0 ? void 0 : _e.Title) === null || _f === void 0 ? void 0 : _f.DisplayValue) || 'Unknown',
                price,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: item.DetailPageURL,
                imageUrl: (_j = (_h = (_g = item.Images) === null || _g === void 0 ? void 0 : _g.Primary) === null || _h === void 0 ? void 0 : _h.Large) === null || _j === void 0 ? void 0 : _j.URL,
                inStock: ((_o = (_m = (_l = (_k = item.Offers) === null || _k === void 0 ? void 0 : _k.Listings) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.Availability) === null || _o === void 0 ? void 0 : _o.Type) === 'Now',
                affiliateUrl: item.DetailPageURL,
                rating: (_q = (_p = item.CustomerReviews) === null || _p === void 0 ? void 0 : _p.StarRating) === null || _q === void 0 ? void 0 : _q.Value,
                reviewCount: (_r = item.CustomerReviews) === null || _r === void 0 ? void 0 : _r.Count,
                brand: (_u = (_t = (_s = item.ItemInfo) === null || _s === void 0 ? void 0 : _s.ByLineInfo) === null || _t === void 0 ? void 0 : _t.Brand) === null || _u === void 0 ? void 0 : _u.DisplayValue
            };
        })
            .filter((p) => p !== null);
    }
    async getPrice(asin) {
        if (!this.accessKey || !this.secretKey) {
            throw new Error('Amazon credentials not configured');
        }
        // TODO: Implement actual PAAPI GetItems call
        // const itemRequest = {
        //     ItemIds: [asin],
        //     Resources: ['Offers.Listings.Price'],
        //     PartnerTag: this.partnerTag,
        //     PartnerType: 'Associates',
        //     Marketplace: 'www.amazon.com'
        // };
        // const response = await this.client.getItems(itemRequest);
        throw new Error('Not yet implemented - use search instead');
    }
    getAffiliateLink(productUrl, asin) {
        if (!this.partnerTag)
            return productUrl;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('tag', this.partnerTag);
            return url.toString();
        }
        catch (_a) {
            return `${productUrl}?tag=${this.partnerTag}`;
        }
    }
    getFallbackData(query, limit) {
        console.log('Using fallback data for Amazon');
        return [{
                id: 'B08N5WRWNW',
                title: `${query} - Amazon (샘플)`,
                price: 299.99,
                currency: 'USD',
                merchantName: this.name,
                region: this.region,
                productUrl: 'https://www.amazon.com/dp/B08N5WRWNW',
                inStock: true,
                affiliateUrl: this.getAffiliateLink('https://www.amazon.com/dp/B08N5WRWNW', 'B08N5WRWNW'),
                rating: 4.7,
                reviewCount: 15234
            }];
    }
}
exports.AmazonUSAdapter = AmazonUSAdapter;
//# sourceMappingURL=AmazonUS.js.map