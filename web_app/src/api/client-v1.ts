import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export interface EnrichedOffer {
    title: string;
    price: number;
    currency: string;
    shippingFee: number;
    imageUrl?: string; // Standardize 
    attributes: Record<string, string>;
    pricing: {
        itemPriceKrw: number;
        shippingFeeKrw: number;
        taxFeeKrw: number;
        totalPriceKrw: number;
    };
}

export const clientV1 = {
    // 1. Inspect Product: Uses 'inspect' endpoint from local API Service (BFF)
    async inspectProduct(url: string, country: string = 'KR'): Promise<EnrichedOffer> {
        try {
            // Pointing to Local API Service on Port 3000
            // In production, this would be an env var (VITE_API_URL)
            const response = await fetch('http://localhost:3000/v1/inspect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, country })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Inspect request failed');
            }

            const json = await response.json();
            const data = json.data;

            // Map standard API response (which already has pricing) to EnrichedOffer
            // services/api returns { ...rawOffer, pricing: {...} }
            // rawOffer usually has title, price, currency, image/imageUrl
            return {
                title: data.title,
                price: data.price,
                currency: data.currency,
                shippingFee: 0, // Inferred in pricing
                imageUrl: data.image || data.imageUrl,
                attributes: data.attributes || {},
                pricing: data.pricing
            };

        } catch (error) {
            console.error("Inspect failed:", error);
            throw error;
        }
    },

    // 2. Match Product: Uses 'matchSKU' Cloud Function
    async matchProduct(target: string, _candidates: { id: string, title: string }[]): Promise<any> {
        try {
            const matchFn = httpsCallable<any, any>(functions, 'matchSKU');
            // matchSKU expects { title, currentPrice, currency }
            // We adapt the signature to match the backend expectation
            // We assume 'target' is the title here.
            const res = await matchFn({ title: target, currentPrice: 0, currency: 'KRW' });
            return res.data.matches;
        } catch (error) {
            console.error("Match failed:", error);
            // Fallback to empty
            return [];
        }
    },

    // 3. Predict Price: Uses 'predictPrice' Cloud Function
    async predictPrice(history: any[], _daysAhead: number = 7): Promise<any> {
        try {
            const predictFn = httpsCallable<any, any>(functions, 'predictPrice');
            // predictPrice expects { productId, currentPrice }
            // We need to infer current price from history if possible
            const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;
            const productId = "temp-id"; // We might need to pass ID if available

            const res = await predictFn({ productId, currentPrice });
            return res.data;
        } catch (error) {
            console.error("Forecast failed:", error);
            // Return null to allow UI to handle gracefully
            return null;
        }
    },

    // 4. Analyze Reviews: Uses 'analyzeReviews' Cloud Function
    async analyzeReviews(texts: string[]): Promise<any> {
        try {
            const analyzeFn = httpsCallable<{ reviews: string[] }, any>(functions, 'analyzeReviews');
            const res = await analyzeFn({ reviews: texts });
            return res.data;
        } catch (error) {
            console.error("Review analysis failed:", error);
            return null;
        }
    },

    // 5. Decide Promo: Uses 'optimizeCoupons' Cloud Function
    async decidePromo(): Promise<any> {
        try {
            const promoFn = httpsCallable<any, any>(functions, 'optimizeCoupons');
            const res = await promoFn({});

            // Map 'bestCoupon' to 'promoVariant' structure expected by UI
            const coupon = res.data.bestCoupon;
            if (coupon) {
                return {
                    id: coupon.code,
                    text: `${coupon.discount} OFF - ${coupon.description}`,
                    subtext: "Limited time offer"
                };
            }
            return null;
        } catch (error) {
            console.error("Promo decision failed:", error);
            return null;
        }
    },

    // 6. Track Promo: Logging only for now
    async trackPromoConversion(variantId: string): Promise<void> {
        console.log(`[Analytics] Promo Converted: ${variantId}`);
        // Optionally call logEvent
        try {
            const logFn = httpsCallable(functions, 'logEvent');
            await logFn({ eventName: 'promo_converted', params: { variantId } });
        } catch (e) {
            // ignore
        }
    }
};
