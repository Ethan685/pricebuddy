import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Product, Offer, PriceHistory } from "../types";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Helper to wrap affiliate links
function wrapAffiliateLink(url: string, merchant: string): string {
    if (!url) return "";
    
    // 플레이스홀더 URL인 경우 검색 페이지로 리다이렉트
    if (url.includes("/products/") && url.includes("smartstore.naver.com/products/") && !url.includes("?")) {
        // 가짜 productId를 사용한 URL인 경우 검색 페이지로 변경
        const titleMatch = url.match(/products\/([^/]+)$/);
        if (titleMatch && titleMatch[1].length > 10) {
            // productId처럼 보이는 경우 (길이가 10자 이상)
            return `https://shopping.naver.com/search/all`;
        }
    }
    
    if (url.includes("/vp/products/") && url.includes("coupang.com/vp/products/") && !url.includes("?")) {
        // 가짜 productId를 사용한 URL인 경우 검색 페이지로 변경
        const titleMatch = url.match(/products\/([^/]+)$/);
        if (titleMatch && titleMatch[1].length > 10) {
            return `https://www.coupang.com/np/search`;
        }
    }
    
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

export const getProductDetails = functions.https.onCall(async (data, context) => {
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
        const product = { id: productDoc.id, ...productDoc.data() } as Product;

        // 2. Fetch Offers
        const offersSnap = await db.collection("products").doc(productId).collection("offers").get();
        const offers: Offer[] = offersSnap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                ...d,
                url: wrapAffiliateLink(d.url, d.merchant) // Inject Affiliate Tag
            } as Offer;
        });

        // 3. Fetch Price History (Real Data)
        const historySnap = await db.collection("products").doc(productId).collection("price_history")
            .orderBy("timestamp", "asc")
            .limit(30)
            .get();

        const priceHistory: PriceHistory[] = historySnap.docs.map(doc => {
            const d = doc.data();
            return {
                productId: product.id,
                timestamp: d.date, // Use stored date string
                price: d.price,
                merchant: d.lowestMerchant || "Market"
            };
        });

        return { product, offers, priceHistory };

    } catch (error) {
        functions.logger.error("Get Details failed", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch details");
    }
});

// HTTP 엔드포인트 추가 (웹 앱에서 사용)
export const getProduct = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
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
    } else {
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
        const productId = req.path.split("/").pop() || req.query.productId as string;
        
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
        const product = { id: productDoc.id, ...productDoc.data() };

        // 2. Fetch Offers
        const offersSnap = await db.collection("products").doc(productId).collection("offers").get();
        const offers = offersSnap.docs.map(doc => {
            const d = doc.data();
            const price = d.totalPrice || d.price || 0;
            const shippingFee = d.shippingFee || 0;
            return {
                id: doc.id,
                ...d,
                url: wrapAffiliateLink(d.url || "", d.merchant || d.merchantName || ""),
                // 웹 앱 호환성을 위한 필드 추가
                totalPriceKrw: price,
                shippingFeeKrw: shippingFee,
            };
        });

        // 3. Fetch Price History
        const historySnap = await db.collection("products").doc(productId).collection("price_history")
            .orderBy("timestamp", "asc")
            .limit(30)
            .get();

        const priceHistory = historySnap.docs.map(doc => {
            const d = doc.data();
            return {
                productId: product.id,
                timestamp: d.timestamp?.toDate?.()?.toISOString() || d.date || d.timestamp,
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
    } catch (error: any) {
        functions.logger.error("Get Product Details failed", error);
        res.status(500).json({ error: "Failed to fetch product details", message: error.message });
    }
});
