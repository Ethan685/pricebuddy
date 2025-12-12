import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';
import { apiClient } from '../../utils/ApiClient';
import { priceValidator } from '../../utils/PriceValidator';

// Note: Uncomment after npm install paapi5-nodejs-sdk
// import * as paapi5 from 'paapi5-nodejs-sdk';

/**
 * Amazon Product Advertising API 5.0 Adapter
 * Requires Amazon Associates account and PAAPI access
 */
export class AmazonUSAdapter extends BaseMerchantAdapter {
    readonly name = 'Amazon US';
    readonly region: Region = 'NA';
    readonly currency = 'USD';
    readonly countryCode = 'US';

    private accessKey: string;
    private secretKey: string;
    private partnerTag: string;
    // private client: any; // PAAPI client

    constructor() {
        super();
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

    async search(query: string, limit: number = 10): Promise<Product[]> {
        if (!this.accessKey || !this.secretKey || !this.partnerTag) {
            console.warn('Amazon PAAPI credentials not configured, using fallback');
            return this.getFallbackData(query, limit);
        }

        const cacheKey = `amazon:search:${query}:${limit}`;

        try {
            return await apiClient.fetchWithCache(
                cacheKey,
                async () => {
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
                },
                1800000, // 30 minutes cache
                'amazon-api'
            );
        } catch (error: any) {
            console.error('Amazon PAAPI search failed:', error.message);
            return this.getFallbackData(query, limit);
        }
    }

    private parseAmazonResponse(response: any): Product[] {
        if (!response.SearchResult?.Items) {
            return [];
        }

        return response.SearchResult.Items
            .map((item: any) => {
                const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
                if (!priceValidator.validate(price, 'USD')) {
                    return null;
                }

                return {
                    id: item.ASIN,
                    title: item.ItemInfo?.Title?.DisplayValue || 'Unknown',
                    price,
                    currency: 'USD' as const,
                    merchantName: this.name,
                    region: this.region,
                    productUrl: item.DetailPageURL,
                    imageUrl: item.Images?.Primary?.Large?.URL,
                    inStock: item.Offers?.Listings?.[0]?.Availability?.Type === 'Now',
                    affiliateUrl: item.DetailPageURL, // Already affiliate link
                    rating: item.CustomerReviews?.StarRating?.Value,
                    reviewCount: item.CustomerReviews?.Count,
                    brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue
                };
            })
            .filter((p: Product | null): p is Product => p !== null);
    }

    async getPrice(asin: string): Promise<PriceInfo> {
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

    getAffiliateLink(productUrl: string, asin?: string): string {
        if (!this.partnerTag) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('tag', this.partnerTag);
            return url.toString();
        } catch {
            return `${productUrl}?tag=${this.partnerTag}`;
        }
    }

    private getFallbackData(query: string, limit: number): Product[] {
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
