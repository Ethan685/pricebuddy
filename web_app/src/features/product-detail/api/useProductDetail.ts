
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { clientV1 } from '../../../api/client-v1';

export function useProductDetail(productId: string) {
    return useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            if (productId === 'temp-id') {
                return {
                    product: {
                        id: 'temp-id',
                        title: 'Sony WH-1000XM5 Mock Test (Demo)',
                        minPrice: 34800,
                        currency: 'JPY',
                        images: ['https://img.danawa.com/prod_img/500000/039/725/img/17725039_1.jpg?shrink=330:*&_v=20230509151608'],
                        offerCount: 5,
                        createdAt: new Date().toISOString()
                    },
                    offers: [
                        { id: '1', merchantName: 'Coupang (Mock)', totalPrice: 37300, currency: 'KRW', url: '#' },
                        { id: '2', merchantName: 'Naver (Mock)', totalPrice: 38000, currency: 'KRW', url: '#' }
                    ],
                    priceHistory: []
                };
            }
            return api.getProductDetails(productId);
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useProductInsights(productId: string, priceHistory: any[], reviews: string[] = []) {
    return useQuery({
        queryKey: ['insights', productId],
        queryFn: async () => {
            // Parallel execution for speed
            const [prediction, reviewAnalysis, promo] = await Promise.all([
                clientV1.predictPrice(priceHistory),
                clientV1.analyzeReviews(reviews),
                clientV1.decidePromo()
            ]);
            return { prediction, reviewAnalysis, promo };
        },
        enabled: !!productId && priceHistory.length >= 0, // Run even if empty history
        staleTime: 1000 * 60 * 60, // 1 hour (insights don't change fast)
    });
}
