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
exports.getProduct = exports.getProductDetails = void 0;
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
// HTTP 엔드포인트 추가 (웹 앱에서 사용)
exports.getProduct = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
    // CORS 설정
    const origin = req.headers.origin;
    const allowedOrigins = [
        "https://pricebuddy-5a869.web.app",
        "https://pricebuddy-5a869.firebaseapp.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ];
    if (origin && allowedOrigins.includes(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
    }
    else {
        res.set("Access-Control-Allow-Origin", "*");
    }
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
    }
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const productId = req.path.split("/").pop() || req.query.productId;
        if (!productId) {
            res.status(400).json({ error: "Product ID is required" });
            return;
        }
        functions.logger.info("HTTP Product Detail request", { productId });
        const db = admin.firestore();
        // 1. Fetch Product
        const productDoc = await db.collection("products").doc(productId).get();
        if (!productDoc.exists) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        const product = Object.assign({ id: productDoc.id }, productDoc.data());
        // 2. Fetch Offers
        const offersSnap = await db.collection("products").doc(productId).collection("offers").get();
        const offers = offersSnap.docs.map(doc => {
            const d = doc.data();
            const price = d.totalPrice || d.price || 0;
            const shippingFee = d.shippingFee || 0;
            return Object.assign(Object.assign({ id: doc.id }, d), { url: wrapAffiliateLink(d.url || "", d.merchant || d.merchantName || ""), 
                // 웹 앱 호환성을 위한 필드 추가
                totalPriceKrw: price, shippingFeeKrw: shippingFee });
        });
        // 3. Fetch Price History
        const historySnap = await db.collection("products").doc(productId).collection("price_history")
            .orderBy("timestamp", "asc")
            .limit(30)
            .get();
        const priceHistory = historySnap.docs.map(doc => {
            var _a, _b, _c;
            const d = doc.data();
            return {
                productId: product.id,
                timestamp: ((_c = (_b = (_a = d.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString()) || d.date || d.timestamp,
                price: d.price,
                merchant: d.lowestMerchant || "Market"
            };
        });
        // 웹 앱 형식에 맞게 변환
        res.json({
            product,
            offers,
            history: priceHistory.map(h => ({
                ts: h.timestamp,
                totalPriceKrw: h.price
            }))
        });
    }
    catch (error) {
        functions.logger.error("Get Product Details failed", error);
        res.status(500).json({ error: "Failed to fetch product details", message: error.message });
    }
});
//# sourceMappingURL=details.js.map