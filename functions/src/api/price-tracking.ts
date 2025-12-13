import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Price History Tracking System
 * Tracks all price changes for transparency and trust
 */

interface PriceSnapshot {
    price: number;
    currency: string;
    merchantName: string;
    recordedAt: FirebaseFirestore.Timestamp;
    verified: boolean;
    source: 'api' | 'scraper' | 'user_report';
}

/**
 * Record price snapshot whenever price is checked
 */
export const recordPriceSnapshot = functions.https.onCall(async (data, context) => {
    const { productId, merchantName, price, currency, source = 'scraper' } = data;

    if (!productId || !merchantName || !price) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
        // Get product reference
        const productRef = db.collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }

        // Create price history entry
        await productRef.collection('priceHistory').add({
            price,
            currency,
            merchantName,
            recordedAt: admin.firestore.FieldValue.serverTimestamp(),
            verified: source === 'api', // API sources are verified
            source,
            product: {
                title: productDoc.data()?.title,
                id: productId
            }
        });

        // Update last checked timestamp
        await productRef.update({
            lastPriceCheck: admin.firestore.FieldValue.serverTimestamp(),
            [`merchants.${merchantName}.lastUpdated`]: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, message: 'Price snapshot recorded' };
    } catch (error) {
        console.error('Failed to record price snapshot:', error);
        throw new functions.https.HttpsError('internal', 'Failed to record price');
    }
});

/**
 * Get price history for a product
 */
export const getPriceHistory = functions.https.onCall(async (data, context) => {
    const { productId, merchantName, daysBack = 30 } = data;

    if (!productId) {
        throw new functions.https.HttpsError('invalid-argument', 'Product ID required');
    }

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);

        let query = db.collection('products')
            .doc(productId)
            .collection('priceHistory')
            .where('recordedAt', '>=', admin.firestore.Timestamp.fromDate(cutoffDate))
            .orderBy('recordedAt', 'desc');

        if (merchantName) {
            query = query.where('merchantName', '==', merchantName);
        }

        const snapshot = await query.limit(100).get();

        const history: PriceSnapshot[] = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        } as any));

        // Calculate statistics
        const prices = history.map(h => h.price);
        const stats = {
            current: prices[0] || 0,
            min: Math.min(...prices),
            max: Math.max(...prices),
            average: prices.reduce((a, b) => a + b, 0) / prices.length,
            dataPoints: history.length,
            isLowestEver: prices[0] === Math.min(...prices),
            priceChange: prices.length > 1 ? ((prices[0] - prices[prices.length - 1]) / prices[prices.length - 1]) * 100 : 0
        };

        return {
            history,
            stats,
            daysBack,
            lastUpdated: history[0]?.recordedAt || null
        };
    } catch (error) {
        console.error('Failed to get price history:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get price history');
    }
});

/**
 * Scheduled price verification
 * Runs every 6 hours to update price data
 */
export const scheduledPriceUpdate = functions.pubsub
    .schedule('every 6 hours')
    .onRun(async (context) => {
        console.log('Starting scheduled price update...');

        try {
            // Get all monitored products (from wishlists, alerts, etc.)
            const monitoredProducts = new Set<string>();

            // Get products from wishlists
            const usersSnapshot = await db.collection('users').get();
            for (const userDoc of usersSnapshot.docs) {
                const wishlistSnapshot = await db.collection('users')
                    .doc(userDoc.id)
                    .collection('wishlist')
                    .get();

                wishlistSnapshot.docs.forEach(doc => {
                    monitoredProducts.add(doc.id);
                });
            }

            // Get products with active alerts
            const alertsSnapshot = await db.collection('alerts')
                .where('active', '==', true)
                .get();

            alertsSnapshot.docs.forEach(doc => {
                const productId = doc.data().productId;
                if (productId) monitoredProducts.add(productId);
            });

            console.log(`Found ${monitoredProducts.size} products to monitor`);

            // Update prices for each product
            let updated = 0;
            for (const productId of monitoredProducts) {
                try {
                    // This would trigger actual scraping/API calls
                    // For now, just mark as checked
                    await db.collection('products').doc(productId).update({
                        lastPriceCheck: admin.firestore.FieldValue.serverTimestamp()
                    });
                    updated++;
                } catch (error) {
                    console.error(`Failed to update product ${productId}:`, error);
                }
            }

            console.log(`Successfully updated ${updated} products`);
            return { monitored: monitoredProducts.size, updated };

        } catch (error) {
            console.error('Scheduled price update failed:', error);
            throw error;
        }
    });

/**
 * Get data freshness indicator
 */
export const getDataFreshness = functions.https.onCall(async (data, context) => {
    const { productId } = data;

    if (!productId) {
        throw new functions.https.HttpsError('invalid-argument', 'Product ID required');
    }

    try {
        const productDoc = await db.collection('products').doc(productId).get();

        if (!productDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Product not found');
        }

        const lastCheck = productDoc.data()?.lastPriceCheck;

        if (!lastCheck) {
            return {
                status: 'unknown',
                message: '가격 정보가 없습니다',
                color: 'gray'
            };
        }

        const now = Date.now();
        const lastCheckTime = lastCheck.toMillis();
        const hoursSinceCheck = (now - lastCheckTime) / (1000 * 60 * 60);

        if (hoursSinceCheck < 1) {
            return {
                status: 'fresh',
                message: '방금 업데이트됨',
                color: 'green',
                lastUpdated: lastCheck
            };
        } else if (hoursSinceCheck < 6) {
            return {
                status: 'recent',
                message: `${Math.floor(hoursSinceCheck)}시간 전 업데이트`,
                color: 'blue',
                lastUpdated: lastCheck
            };
        } else if (hoursSinceCheck < 24) {
            return {
                status: 'stale',
                message: '업데이트 필요',
                color: 'yellow',
                lastUpdated: lastCheck
            };
        } else {
            return {
                status: 'outdated',
                message: '오래된 정보',
                color: 'red',
                lastUpdated: lastCheck
            };
        }
    } catch (error) {
        console.error('Failed to get data freshness:', error);
        throw new functions.https.HttpsError('internal', 'Failed to check freshness');
    }
});

// HTTP 엔드포인트: 가격 히스토리 조회
// 경로: /price-tracking/product/{productId}/history
export const priceTracking = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
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
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
    }

    try {
        const path = req.path;
        functions.logger.info("Price Tracking request", { path, method: req.method });

        // 경로 파싱: /price-tracking/product/{productId}/history 또는 /price-tracking/track
        if (path.includes("/product/") && path.includes("/history")) {
            // GET /price-tracking/product/{productId}/history
            if (req.method !== "GET") {
                res.status(405).json({ error: "Method not allowed" });
                return;
            }

            const pathParts = path.split("/");
            const productIdIndex = pathParts.indexOf("product");
            const productId = productIdIndex >= 0 && pathParts[productIdIndex + 1] ? pathParts[productIdIndex + 1] : null;

            if (!productId) {
                res.status(400).json({ error: "Product ID is required" });
                return;
            }

            // price_history 컬렉션에서 조회
            const historySnap = await db.collection("products").doc(productId).collection("price_history")
                .orderBy("timestamp", "asc")
                .limit(30)
                .get();

            const history = historySnap.docs.map(doc => {
                const d = doc.data();
                const timestamp = d.timestamp?.toDate?.()?.toISOString() || d.date || d.timestamp;
                return {
                    ts: timestamp,
                    totalPriceKrw: d.price || d.totalPriceKrw || 0
                };
            });

            res.json({ history });
        } else if (path.includes("/track")) {
            // POST /price-tracking/track
            if (req.method !== "POST") {
                res.status(405).json({ error: "Method not allowed" });
                return;
            }

            const { url, marketplace, productId } = req.body;

            if (!url || !marketplace || !productId) {
                res.status(400).json({ error: "Missing required fields: url, marketplace, productId" });
                return;
            }

            // TODO: 실제 추적 로직 구현
            res.json({ success: true, message: "Price tracking started" });
        } else {
            res.status(404).json({ error: "Not found" });
        }
    } catch (error: any) {
        functions.logger.error("Price Tracking failed", error);
        res.status(500).json({ error: "Request failed", message: error.message });
    }
});
