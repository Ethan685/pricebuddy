import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/api';

export function useSearch(query: string, region: string = 'ALL', useGlobal: boolean = true) {
    return useQuery({
        queryKey: ['search', query, region, useGlobal],
        queryFn: async () => {
            if (!query) return [];

            // [DEMO MODE]
            // If query implies a URL inspection OR is the specific demo keyword "iPhone 17",
            // we treat it as an inspection for the purpose of the demo.
            const isInspection = query.includes('http') || query.includes('www') || query.toLowerCase() === 'iphone 17';

            if (isInspection) {
                const { clientV1 } = await import('../../../api/client-v1');
                // For demo purposes, if the query is "iPhone 17", use a predefined URL for inspection.
                // Otherwise, use the query itself as the URL.
                const inspectionUrl = query.toLowerCase() === 'iphone 17'
                    ? 'https://www.amazon.com/Apple-iPhone-15-Pro-Max/dp/B0CHX6938B' // Example URL for iPhone 15 Pro Max
                    : query;

                const enriched = await clientV1.inspectProduct(inspectionUrl);
                return [{
                    id: 'temp-id',
                    title: enriched.title,
                    price: enriched.price,
                    currency: enriched.currency,
                    priceKRW: enriched.pricing.totalPriceKrw,
                    imageUrl: enriched.imageUrl,
                    images: [enriched.imageUrl],
                    merchantName: 'Detected',
                    productUrl: query,
                    minPrice: enriched.pricing.totalPriceKrw,
                    isSoldOut: false,
                    verified: true,
                    reviewCount: 0,
                    since: new Date().toISOString().slice(0, 7).replace('-', '.'), // YYYY.MM
                    rate: 0
                }];
            }

            // Normal Search
            if (useGlobal) {
                const result = await api.searchGlobal(query, region);
                return result.products || [];
            } else {
                return await api.search(query);
            }
        },
        enabled: !!query,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
