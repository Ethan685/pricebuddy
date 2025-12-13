import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp();
}

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

export * from "./api/search";
export { search, seedProducts } from "./api/search"; // HTTP 엔드포인트 export
export * from "./api/details";
export { getProduct } from "./api/details"; // HTTP 엔드포인트 export
export * from "./api/deals";
export { deals } from "./api/deals"; // HTTP 엔드포인트 export
export * from "./api/product-collector";
export { collectPopularProducts } from "./api/product-collector"; // HTTP 엔드포인트 export
export * from "./api/auto-product-collector";
export { autoCollectProducts } from "./api/auto-product-collector"; // 스케줄러 export
export * from "./api/purchases";
export { purchases } from "./api/purchases"; // HTTP 엔드포인트 export
export * from "./api/wallet-http";
export { wallet } from "./api/wallet-http"; // HTTP 엔드포인트 export
export * from "./triggers/alerts";
export { checkPriceAlerts } from "./triggers/alerts";
export * from "./triggers/auth";
export * from "./triggers/reporting";
export * from "./api/wallet";
export * from "./api/enterprise";

// Vector Search
import * as vector from './api/vector';


// --- Firestore Triggers ---
// When a product is added to Firestore, verify/enrich it?
// For v2.0, we just index it.
export const onProductCreate = functions.firestore
    .document('products/{productId}')
    .onCreate(async (snap, context) => {
        const product = snap.data();
        await vector.addToIndex(product);
    });

// --- API ---
export { generateB2BReport } from './api/reports';

// === Enterprise Features ===
// API Key Management
export { createApiKey, listApiKeys, revokeApiKey } from './api/apikeys';

// Bulk SKU Import
export { bulkImportSKUs, getMonitoredSKUs, removeMonitoredSKU } from './api/bulk';

// REST API Endpoints (for external clients)
export { apiGetProduct, apiGetPrices, apiSearchProducts, apiCreateAlert } from './api/rest';
export { chatWithAI } from './api/chat';
export { analyzeReviews } from './api/reviews';
export { optimizeCoupons } from './api/coupons';
export { predictEngagement } from './api/engagement';
// Initialize Firebase Admin (once)


// Export all Cloud Functions
export * from './api/search-global'; // Global search with all marketplaces
export * from './api/search'; // Legacy search
export * from './api/details'; // Product details

// Legacy scrapers (deprecated - use merchants/ adapters instead)
// export * from './scrapers/naver';
// export * from './scrapers/coupang';
// export * from './payments/stripe';
// export * from './wallet/transactions';
// export * from './wallet/withdrawals';
// export * from './wallet/fraud';
// export * from './ai/price-prediction';
// export * from './ai/review-analysis';
// export * from './ai/sku-matching';
// export * from './api/delivery-tracking';
export * from './api/enterprise';
// export * from './api/user-feed';

// Enterprise Functions
export * from './api/apikeys';
export * from './api/bulk';
export * from './api/rest';

// Global Search
export * from './api/search-global';

// Trust & Reliability Features
export * from './api/price-tracking';
export { priceTracking } from './api/price-tracking';
export * from "./triggers/referrals";

export * from "./api/share";
export * from "./api/payments";
export * from "./api/feed";
export * from "./api/community";
export * from "./api/prediction";
export * from "./api/match";
export * from "./api/alerts";
// export * from "./api/referrals"; // Referrals trigger exported above, api might be different
export * from "./api/referrals";
// export * from "./api/engagement"; // Duplicate
export * from "./api/wishlist";
export { wishlist } from "./api/wishlist";
export * from "./api/telemetry";
export * from "./api/delivery";
// export * from "./api/fraud"; // Likely broken or conflicting

// Growth API
export * from "./api/growth";

/**
 * Calculates the total price including shipping, VAT, and duty.
 * 
 * @param base Base price of the item
 * @param ship Shipping cost
 * @param country Country code (e.g., "KR")
 * @param curr Currency code (default "KRW")
 * @returns Total estimated price
 */
export function estimateTotals({ base, ship, country, curr = "KRW" }: { base: number; ship: number; country: string; curr?: string }): number {
    const vat = country === "KR" ? 0.10 : 0;
    const duty = 0; // Placeholder for category-specific rules
    return base + ship + (base + ship) * vat + base * duty;
}
