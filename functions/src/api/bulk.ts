import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { parse } from 'csv-parse/sync';

const db = admin.firestore();

interface BulkSKU {
    sku: string;
    productName: string;
    targetPrice?: number;
    alertOnChange?: boolean;
}

/**
 * Bulk import SKUs for monitoring
 * Accepts CSV data with columns: sku, productName, targetPrice (optional), alertOnChange (optional)
 */
export const bulkImportSKUs = functions.https.onCall(async (data, context) => {
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
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        }) as BulkSKU[];

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
        const errors: string[] = [];

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
            } catch (err) {
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
    } catch (error) {
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
export const getMonitoredSKUs = functions.https.onCall(async (data, context) => {
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
    } catch (error) {
        functions.logger.error('Failed to get monitored SKUs', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch SKUs');
    }
});

/**
 * Remove a monitored SKU
 */
export const removeMonitoredSKU = functions.https.onCall(async (data, context) => {
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
    } catch (error) {
        functions.logger.error('Failed to remove SKU', error);
        throw new functions.https.HttpsError('internal', 'Failed to remove SKU');
    }
});
