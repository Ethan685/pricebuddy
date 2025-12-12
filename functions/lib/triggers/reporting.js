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
exports.generateReport = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.generateReport = functions.firestore
    .document("report_jobs/{jobId}")
    .onCreate(async (snap, context) => {
    const jobId = context.params.jobId;
    const job = snap.data();
    const db = admin.firestore();
    console.log(`Starting report generation for job ${jobId}`);
    try {
        // 1. Fetch Products
        const productsSnap = await db.collection("products").limit(100).get();
        const rows = [];
        // Header
        rows.push("ProductID,Title,Brand,Category,MinPrice,Currency");
        for (const doc of productsSnap.docs) {
            const p = doc.data();
            // Basic Product Info
            rows.push(`"${doc.id}","${p.title}","${p.brand}","${p.category}",${p.minPrice},"${p.currency}"`);
        }
        const csvContent = rows.join("\n");
        // In a real app, upload ‘csvContent’ to Cloud Storage and get a download URL.
        // For this emulator demo, we'll just store a mock URL or base64 data url (if small) 
        // or just a text confirmation.
        // Log for debugging/lint usage
        console.log(`Generated CSV size: ${csvContent.length} chars for job data:`, job);
        // Let's assume we "uploaded" it.
        const mockDownloadUrl = `https://example.com/reports/${jobId}.csv`;
        // 2. Update Job Status
        await db.collection("report_jobs").doc(jobId).update({
            status: "completed",
            completedAt: new Date(),
            downloadUrl: mockDownloadUrl,
            summary: `Generated ${rows.length - 1} rows`
        });
        console.log(`Report job ${jobId} completed.`);
    }
    catch (error) {
        console.error(`Report job ${jobId} failed:`, error);
        await db.collection("report_jobs").doc(jobId).update({
            status: "failed",
            error: "Internal Error"
        });
    }
});
//# sourceMappingURL=reporting.js.map