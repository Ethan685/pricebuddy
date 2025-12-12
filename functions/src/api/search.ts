import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Product } from "../types";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const searchProducts = functions.https.onCall(async (data, context) => {
    const query = data.query || "";
    functions.logger.info("Searching products", { query });

    if (!query) return [];

    try {
        const logs: string[] = [];
        const log = (msg: string) => {
            functions.logger.info(msg);
            logs.push(msg);
        };

        const queryLower = query.toLowerCase();
        log(`[DEBUG] Query: ${query}, Lower: ${queryLower}, Project: ${process.env.GCLOUD_PROJECT}`);

        // Use simpler approach: fetch all and filter in-memory for emulator testing
        // Production should use full-text search (Algolia, Elasticsearch, etc.)
        const allProducts = await admin.firestore().collection("products").limit(100).get();

        log(`[DEBUG] Fetched ${allProducts.size} total products`);

        // Filter products that contain the search term
        const matchingDocs = allProducts.docs.filter(doc => {
            const data = doc.data();
            const titleLower = (data.titleLower || '').toLowerCase();
            return titleLower.includes(queryLower);
        });

        log(`[DEBUG] Found ${matchingDocs.length} matching products`);

        if (matchingDocs.length > 0) {
            const firstData = matchingDocs[0].data();
            log(`[DEBUG] First match ID: ${matchingDocs[0].id}`);
            log(`[DEBUG] First match title: ${firstData.title}`);
            log(`[DEBUG] First match titleLower: ${firstData.titleLower}`);
        }

        const products: Product[] = matchingDocs.slice(0, 20).map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));

        return products;
    } catch (error) {
        functions.logger.error("Search failed", error);
        throw new functions.https.HttpsError("internal", "Search failed");
    }
});
