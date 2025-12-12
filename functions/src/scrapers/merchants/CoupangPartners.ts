import * as crypto from 'crypto';
import axios from 'axios';
import { BaseMerchantAdapter, Product, PriceInfo, Region } from '../MerchantAdapter';
import { apiClient } from '../../utils/ApiClient';
import { priceValidator } from '../../utils/PriceValidator';

/**
 * Coupang Partners API Adapter
 * Requires Coupang Partners account and API credentials
 */
export class CoupangPartnersAdapter extends BaseMerchantAdapter {
    readonly name = '쿠팡';
    readonly region: Region = 'KR';
    readonly currency = 'KRW';
    readonly countryCode = 'KR';

    private accessKey: string;
    private secretKey: string;
    private readonly baseUrl = 'https://api-gateway.coupang.com';

    constructor() {
        super();
        this.accessKey = process.env.COUPANG_ACCESS_KEY || '';
        this.secretKey = process.env.COUPANG_SECRET_KEY || '';
    }

    async search(query: string, limit: number = 10): Promise<Product[]> {
        if (!this.accessKey || !this.secretKey) {
            console.warn('Coupang API credentials not configured, using fallback');
            return this.getFallbackData(query, limit);
        }

        const cacheKey = `coupang:search:${query}:${limit}`;

        try {
            return await apiClient.fetchWithCache(
                cacheKey,
                async () => {
                    const path = '/v2/providers/affiliate_open_api/apis/openapi/v1/products/search';
                    const datetime = new Date().toISOString();

                    const response = await axios.get(
                        `${this.baseUrl}${path}`,
                        {
                            params: {
                                keyword: query,
                                limit: Math.min(limit, 100)
                            },
                            headers: {
                                'Authorization': this.generateHMAC('GET', path, datetime),
                                'X-Requested-Date': datetime
                            },
                            timeout: 15000
                        }
                    );

                    return this.parseCoupangResponse(response.data);
                },
                1800000, // 30 minutes cache
                'coupang-api'
            );
        } catch (error: any) {
            console.error('Coupang API search failed:', error.message);
            return this.getFallbackData(query, limit);
        }
    }

    private parseCoupangResponse(data: any): Product[] {
        if (!data.data || !Array.isArray(data.data)) {
            return [];
        }

        return data.data
            .map((item: any) => {
                const price = item.productPrice;
                if (!priceValidator.validate(price, 'KRW')) {
                    return null;
                }

                return {
                    id: String(item.productId),
                    title: item.productName,
                    price,
                    currency: 'KRW' as const,
                    merchantName: this.name,
                    region: this.region,
                    productUrl: item.productUrl,
                    imageUrl: item.productImage,
                    inStock: true,
                    affiliateUrl: item.productUrl, // Coupang returns affiliate URL
                    isRocket: item.isRocket,
                    isFreeShipping: item.isFreeShipping,
                    rating: item.rating,
                    reviewCount: item.reviewCount
                };
            })
            .filter((p: Product | null): p is Product => p !== null);
    }

    async getPrice(productId: string): Promise<PriceInfo> {
        // Coupang API doesn't support direct product lookup
        throw new Error('Direct price lookup not supported - use search instead');
    }

    private generateHMAC(method: string, path: string, datetime: string): string {
        const message = `${datetime}${method}${path}`;
        const signature = crypto
            .createHmac('sha256', this.secretKey)
            .update(message)
            .digest('hex');

        return `CEA algorithm=HmacSHA256, access-key=${this.accessKey}, signed-date=${datetime}, signature=${signature}`;
    }

    getAffiliateLink(productUrl: string, productId?: string): string {
        // Coupang API already returns affiliate URLs
        return productUrl;
    }

    private getFallbackData(query: string, limit: number): Product[] {
        console.log('Using fallback data for Coupang');
        return [{
            id: 'COUPANG_FALLBACK_001',
            title: `${query} - 쿠팡 (샘플)`,
            price: 289000,
            currency: 'KRW',
            merchantName: this.name,
            region: this.region,
            productUrl: 'https://www.coupang.com',
            inStock: true,
            isRocket: true,
            affiliateUrl: 'https://www.coupang.com'
        }];
    }
}
