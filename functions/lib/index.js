"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTotals = exports.predictEngagement = exports.optimizeCoupons = exports.analyzeReviews = exports.chatWithAI = exports.apiCreateAlert = exports.apiSearchProducts = exports.apiGetPrices = exports.apiGetProduct = exports.removeMonitoredSKU = exports.getMonitoredSKUs = exports.bulkImportSKUs = exports.revokeApiKey = exports.listApiKeys = exports.createApiKey = exports.generateB2BReport = exports.onProductCreate = exports.helloWorld = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
__exportStar(require("./api/search"), exports);
__exportStar(require("./api/details"), exports);
__exportStar(require("./triggers/alerts"), exports);
__exportStar(require("./triggers/auth"), exports);
__exportStar(require("./triggers/reporting"), exports);
__exportStar(require("./api/wallet"), exports);
__exportStar(require("./api/enterprise"), exports);
// Vector Search
const vector = __importStar(require("./api/vector"));
// --- Firestore Triggers ---
// When a product is added to Firestore, verify/enrich it?
// For v2.0, we just index it.
exports.onProductCreate = functions.firestore
    .document('products/{productId}')
    .onCreate(async (snap, context) => {
    const product = snap.data();
    await vector.addToIndex(product);
});
// --- API ---
var reports_1 = require("./api/reports");
Object.defineProperty(exports, "generateB2BReport", { enumerable: true, get: function () { return reports_1.generateB2BReport; } });
// === Enterprise Features ===
// API Key Management
var apikeys_1 = require("./api/apikeys");
Object.defineProperty(exports, "createApiKey", { enumerable: true, get: function () { return apikeys_1.createApiKey; } });
Object.defineProperty(exports, "listApiKeys", { enumerable: true, get: function () { return apikeys_1.listApiKeys; } });
Object.defineProperty(exports, "revokeApiKey", { enumerable: true, get: function () { return apikeys_1.revokeApiKey; } });
// Bulk SKU Import
var bulk_1 = require("./api/bulk");
Object.defineProperty(exports, "bulkImportSKUs", { enumerable: true, get: function () { return bulk_1.bulkImportSKUs; } });
Object.defineProperty(exports, "getMonitoredSKUs", { enumerable: true, get: function () { return bulk_1.getMonitoredSKUs; } });
Object.defineProperty(exports, "removeMonitoredSKU", { enumerable: true, get: function () { return bulk_1.removeMonitoredSKU; } });
// REST API Endpoints (for external clients)
var rest_1 = require("./api/rest");
Object.defineProperty(exports, "apiGetProduct", { enumerable: true, get: function () { return rest_1.apiGetProduct; } });
Object.defineProperty(exports, "apiGetPrices", { enumerable: true, get: function () { return rest_1.apiGetPrices; } });
Object.defineProperty(exports, "apiSearchProducts", { enumerable: true, get: function () { return rest_1.apiSearchProducts; } });
Object.defineProperty(exports, "apiCreateAlert", { enumerable: true, get: function () { return rest_1.apiCreateAlert; } });
var chat_1 = require("./api/chat");
Object.defineProperty(exports, "chatWithAI", { enumerable: true, get: function () { return chat_1.chatWithAI; } });
var reviews_1 = require("./api/reviews");
Object.defineProperty(exports, "analyzeReviews", { enumerable: true, get: function () { return reviews_1.analyzeReviews; } });
var coupons_1 = require("./api/coupons");
Object.defineProperty(exports, "optimizeCoupons", { enumerable: true, get: function () { return coupons_1.optimizeCoupons; } });
var engagement_1 = require("./api/engagement");
Object.defineProperty(exports, "predictEngagement", { enumerable: true, get: function () { return engagement_1.predictEngagement; } });
// Initialize Firebase Admin (once)
// Export all Cloud Functions
__exportStar(require("./api/search-global"), exports); // Global search with all marketplaces
__exportStar(require("./api/search"), exports); // Legacy search
__exportStar(require("./api/details"), exports); // Product details
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
__exportStar(require("./api/enterprise"), exports);
// export * from './api/user-feed';
// Enterprise Functions
__exportStar(require("./api/apikeys"), exports);
__exportStar(require("./api/bulk"), exports);
__exportStar(require("./api/rest"), exports);
// Global Search
__exportStar(require("./api/search-global"), exports);
// Trust & Reliability Features
__exportStar(require("./api/price-tracking"), exports);
__exportStar(require("./triggers/referrals"), exports);
__exportStar(require("./api/share"), exports);
__exportStar(require("./api/payments"), exports);
__exportStar(require("./api/feed"), exports);
__exportStar(require("./api/community"), exports);
__exportStar(require("./api/prediction"), exports);
__exportStar(require("./api/match"), exports);
__exportStar(require("./api/alerts"), exports);
// export * from "./api/referrals"; // Referrals trigger exported above, api might be different
__exportStar(require("./api/referrals"), exports);
// export * from "./api/engagement"; // Duplicate
__exportStar(require("./api/wishlist"), exports);
__exportStar(require("./api/telemetry"), exports);
__exportStar(require("./api/delivery"), exports);
// export * from "./api/fraud"; // Likely broken or conflicting
// Growth API
__exportStar(require("./api/growth"), exports);
/**
 * Calculates the total price including shipping, VAT, and duty.
 *
 * @param base Base price of the item
 * @param ship Shipping cost
 * @param country Country code (e.g., "KR")
 * @param curr Currency code (default "KRW")
 * @returns Total estimated price
 */
function estimateTotals({ base, ship, country, curr = "KRW" }) {
    const vat = country === "KR" ? 0.10 : 0;
    const duty = 0; // Placeholder for category-specific rules
    return base + ship + (base + ship) * vat + base * duty;
}
exports.estimateTotals = estimateTotals;
//# sourceMappingURL=index.js.map