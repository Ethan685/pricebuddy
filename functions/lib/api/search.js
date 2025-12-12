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
exports.searchProducts = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.searchProducts = functions.https.onCall(async (data, context) => {
    const query = data.query || "";
    functions.logger.info("Searching products", { query });
    if (!query)
        return [];
    try {
        const logs = [];
        const log = (msg) => {
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
        const products = matchingDocs.slice(0, 20).map(doc => (Object.assign({ id: doc.id }, doc.data())));
        return products;
    }
    catch (error) {
        functions.logger.error("Search failed", error);
        throw new functions.https.HttpsError("internal", "Search failed");
    }
});
//# sourceMappingURL=search.js.map