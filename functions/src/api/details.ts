import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Product, Offer, PriceHistory } from "../types";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Helper to wrap affiliate links
function wrapAffiliateLink(url: string, merchant: string): string {
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
