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
exports.removeMonitoredSKU = exports.getMonitoredSKUs = exports.bulkImportSKUs = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const sync_1 = require("csv-parse/sync");
const db = admin.firestore();
/**
 * Bulk import SKUs for monitoring
 * Accepts CSV data with columns: sku, productName, targetPrice (optional), alertOnChange (optional)
 */
exports.bulkImportSKUs = functions.https.onCall(async (data, context) => {
    // Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const { csvData } = data;
    if (!csvData) {
        throw new functions.https.HttpsError('invalid-argument', 'CSV data required');
    }
    // Role check - Enterprise only
    const userRef = db.collection('users').doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    if (userData?.role !== 'enterprise' && userData?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Enterprise plan required');
    }
    try {
        // Parse CSV
        const records = (0, sync_1.parse)(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        if (records.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'No valid records in CSV');
        }
        if (records.length > 1000) {
            throw new functions.https.HttpsError('invalid-argument', 'Maximum 1000 SKUs per import');
        }
        // Batch write
        const batch = db.batch();
        const importId = db.collection('bulk_imports').doc().id;
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        let successCount = 0;
        const errors = [];
        for (const record of records) {
            try {
                if (!record.sku || !record.productName) {
                    errors.push(`Missing required fields for row: ${JSON.stringify(record)}`);
                    continue;
                }
                const monitorRef = db.collection('monitored_skus').doc();
                batch.set(monitorRef, {
                    userId: context.auth.uid,
                    sku: record.sku.trim(),
                    productName: record.productName.trim(),
                    targetPrice: record.targetPrice ? parseFloat(record.targetPrice.toString()) : null,
                    alertOnChange: record.alertOnChange ? (String(record.alertOnChange).toLowerCase() === 'true' || String(record.alertOnChange) === '1') : false,
                    importId,
                    createdAt: timestamp,
                    active: true,
                    currentPrice: null,
                    lastChecked: null
                });
                successCount++;
            }
            catch (err) {
                errors.push(`Error processing SKU ${record.sku}: ${err}`);
            }
        }
        // Commit batch
        await batch.commit();
        // Log import job
        await db.collection('bulk_imports').doc(importId).set({
            userId: context.auth.uid,
            totalRecords: records.length,
            successCount,
            errorCount: errors.length,
            errors: errors.slice(0, 10), // Store first 10 errors
            createdAt: timestamp
        });
        functions.logger.info(`Bulk import completed: ${successCount}/${records.length} SKUs imported`);
        return {
            success: true,
            imported: successCount,
            total: records.length,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined
        };
    }
    catch (error) {
        functions.logger.error('Bulk import failed', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Bulk import failed');
    }
});
/**
 * Get list of monitored SKUs for current user
 */
exports.getMonitoredSKUs = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const { limit = 50, offset = 0 } = data;
    try {
        const skusSnap = await db.collection('monitored_skus')
            .where('userId', '==', context.auth.uid)
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset(offset)
            .get();
        const skus = skusSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString()
        }));
        return { skus, total: skus.length };
    }
    catch (error) {
        functions.logger.error('Failed to get monitored SKUs', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch SKUs');
    }
});
/**
 * Remove a monitored SKU
 */
exports.removeMonitoredSKU = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const { skuId } = data;
    if (!skuId) {
        throw new functions.https.HttpsError('invalid-argument', 'SKU ID required');
    }
    try {
        const skuRef = db.collection('monitored_skus').doc(skuId);
        const skuSnap = await skuRef.get();
        if (!skuSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'SKU not found');
        }
        const skuData = skuSnap.data();
        if (skuData?.userId !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Not your SKU');
        }
        await skuRef.update({
            active: false,
            removedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, message: 'SKU removed from monitoring' };
    }
    catch (error) {
        functions.logger.error('Failed to remove SKU', error);
        throw new functions.https.HttpsError('internal', 'Failed to remove SKU');
    }
});
