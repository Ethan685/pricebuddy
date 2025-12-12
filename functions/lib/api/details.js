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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductDetails = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
// Helper to wrap affiliate links
function wrapAffiliateLink(url, merchant) {
    if (merchant.toLowerCase() === "amazon") {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}tag=pricebuddy-20`;
    }
    if (merchant.toLowerCase() === "coupang") {
        // Coupang Partners logic (simplified)
        return url;
    }
    return url;
}
exports.getProductDetails = functions.https.onCall(async (data, context) => {
    const productId = data.productId;
    if (!productId) {
        throw new functions.https.HttpsError("invalid-argument", "Product ID is required");
    }
    try {
        const db = admin.firestore();
        // 1. Fetch Product
        const productDoc = await db.collection("products").doc(productId).get();
        if (!productDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Product not found");
        }
        const product = Object.assign({ id: productDoc.id }, productDoc.data());
        // 2. Fetch Offers
        const offersSnap = await db.collection("products").doc(productId).collection("offers").get();
        const offers = offersSnap.docs.map(doc => {
            const d = doc.data();
            return Object.assign(Object.assign({ id: doc.id }, d), { url: wrapAffiliateLink(d.url, d.merchant) // Inject Affiliate Tag
             });
        });
        // 3. Fetch Price History (Real Data)
        const historySnap = await db.collection("products").doc(productId).collection("price_history")
            .orderBy("timestamp", "asc")
            .limit(30)
            .get();
        const priceHistory = historySnap.docs.map(doc => {
            const d = doc.data();
            return {
                productId: product.id,
                timestamp: d.date,
                price: d.price,
                merchant: d.lowestMerchant || "Market"
            };
        });
        return { product, offers, priceHistory };
    }
    catch (error) {
        functions.logger.error("Get Details failed", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch details");
    }
});
//# sourceMappingURL=details.js.map