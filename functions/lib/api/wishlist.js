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
exports.wishlist = exports.getWishlist = exports.toggleWishlist = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.toggleWishlist = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const uid = context.auth.uid;
    const { productId, productData } = data; // productData needed for minimal display info
    const wishRef = db.collection('users').doc(uid).collection('wishlist').doc(productId);
    const docSnap = await wishRef.get();
    if (docSnap.exists) {
        // Remove
        await wishRef.delete();
        return { added: false, message: "Removed from wishlist" };
    }
    else {
        // Add
        await wishRef.set(Object.assign(Object.assign({}, productData), { addedAt: admin.firestore.FieldValue.serverTimestamp() }));
        return { added: true, message: "Added to wishlist" };
    }
});
exports.getWishlist = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const uid = context.auth.uid;
    const snap = await db.collection('users').doc(uid).collection('wishlist').orderBy('addedAt', 'desc').get();
    const items = snap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
    return { items };
});
// HTTP 엔드포인트: 위시리스트 조회
exports.wishlist = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
    var _a;
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
    res.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
    }
    try {
        const userId = req.query.userId || ((_a = req.body) === null || _a === void 0 ? void 0 : _a.userId);
        if (!userId) {
            res.status(400).json({ error: "userId is required" });
            return;
        }
        functions.logger.info("Wishlist request", { method: req.method, userId });
        if (req.method === "GET") {
            // GET: 위시리스트 조회
            const snap = await db.collection('users').doc(userId).collection('wishlist')
                .orderBy('addedAt', 'desc')
                .get();
            const items = snap.docs.map(d => (Object.assign({ id: d.id, productId: d.id }, d.data())));
            res.json({ items });
        }
        else if (req.method === "POST") {
            // POST: 위시리스트 추가
            const { productId, productData } = req.body;
            if (!productId) {
                res.status(400).json({ error: "productId is required" });
                return;
            }
            const wishRef = db.collection('users').doc(userId).collection('wishlist').doc(productId);
            const docSnap = await wishRef.get();
            if (docSnap.exists) {
                res.json({ added: false, message: "Already in wishlist" });
            }
            else {
                await wishRef.set(Object.assign(Object.assign({}, productData), { addedAt: admin.firestore.FieldValue.serverTimestamp() }));
                res.json({ added: true, message: "Added to wishlist" });
            }
        }
        else if (req.method === "DELETE") {
            // DELETE: 위시리스트에서 제거
            const itemId = req.path.split("/").pop() || req.query.itemId;
            if (!itemId) {
                res.status(400).json({ error: "itemId is required" });
                return;
            }
            const wishRef = db.collection('users').doc(userId).collection('wishlist').doc(itemId);
            await wishRef.delete();
            res.json({ success: true, message: "Removed from wishlist" });
        }
        else {
            res.status(405).json({ error: "Method not allowed" });
        }
    }
    catch (error) {
        functions.logger.error("Wishlist operation failed", error);
        res.status(500).json({ error: "Wishlist operation failed", message: error.message });
    }
});
//# sourceMappingURL=wishlist.js.map