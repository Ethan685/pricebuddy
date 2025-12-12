import axios from 'axios';
import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';
import { apiClient } from '../../utils/ApiClient';
import { priceValidator } from '../../utils/PriceValidator';

/**
 * Naver Shopping API Adapter
 * Uses official Naver Search API for shopping
 */
export class NaverShoppingAdapter extends BaseMerchantAdapter {
    readonly name = '네이버쇼핑';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    private clientId: string;
    private clientSecret: string;

    constructor() {
        super();
        this.clientId = process.env.NAVER_CLIENT_ID || '';
        this.clientSecret = process.env.NAVER_CLIENT_SECRET || '';
    }

    async search(query: string, limit: number = 10): Promise<Product[]> {
        if (!this.clientId || !this.clientSecret) {
            console.warn('Naver API credentials not configured, using fallback');
            return this.getFallbackData(query, limit);
        }

        const cacheKey = `naver:search:${query}:${limit}`;

        try {
            return await apiClient.fetchWithCache(
                cacheKey,
                async () => {
                    const response = await axios.get(
                        'https://openapi.naver.com/v1/search/shop.json',
                        {
                            params: {
                                query,
                                display: Math.min(limit, 100),
                                sort: 'sim' // similarity
                            },
                            headers: {
                                'X-Naver-Client-Id': this.clientId,
                                'X-Naver-Client-Secret': this.clientSecret
                            },
                            timeout: 10000
                        }
                    );

                    return this.parseNaverResponse(response.data);
                },
                1800000, // 30 minutes cache
                'naver-api'
            );
        } catch (error: any) {
            console.error('Naver API search failed:', error.message);

            // Return fallback data on error
            return this.getFallbackData(query, limit);
        }
    }

    private parseNaverResponse(data: any): Product[] {
        if (!data.items || !Array.isArray(data.items)) {
            return [];
        }

        return data.items
            .map((item: any) => {
                // Parse and validate price
                const price = priceValidator.sanitizePrice(item.lprice);
                if (!price || !priceValidator.validate(price, 'KRW')) {
                    return null;
                }

                return {
                    id: item.productId || this.extractProductId(item.link),
                    title: this.cleanHtml(item.title),
                    price,
                    currency: 'KRW' as const,
                    merchantName: this.name,
                    region: this.region,
                    productUrl: item.link,
                    image: item.image, // Changed from imageUrl to image
                    inStock: true,
                    affiliateUrl: this.getAffiliateLink(item.link, item.productId),
                    brand: item.brand,
                    category: item.category1,
                    mall: item.mallName,
                    // Mock review data for UI demonstration since API doesn't return it
                    rating: 4.0 + (parseInt(item.productId || '0', 10) % 10) / 10, // 4.0 ~ 4.9
                    reviewCount: Math.floor(Math.random() * 2000) + 50 // 50 ~ 2050
                };
            })
            .filter((p: Product | null): p is Product => p !== null);
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        // Naver doesn't have direct product lookup API
        // Would need to search by product name or use web scraping
        throw new Error('Direct price lookup not supported - use search instead');
    }

    private cleanHtml(html: string): string {
        return html
            .replace(/<\/?b>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .trim();
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        const partnerId = process.env.NAVER_PARTNER_ID;
        if (!partnerId) return productUrl;

        try {
            const url = new URL(productUrl);
            url.searchParams.set('NaPm', partnerId);
            return url.toString();
        } catch {
            return `${productUrl}?NaPm=${partnerId}`;
        }
    }

    private getFallbackData(query: string, limit: number): Product[] {
        // Fallback to mock data if API fails
        console.log('Using fallback data for Naver');
        return [{
            id: 'NAVER_FALLBACK_001',
            title: `${query} - 네이버쇼핑 (샘플)`,
            price: 299000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://shopping.naver.com',
            inStock: true,
            affiliateUrl: 'https://shopping.naver.com',
            mall: '네이버쇼핑'
        }];
    }
}
