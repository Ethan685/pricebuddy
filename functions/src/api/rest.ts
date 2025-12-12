import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateApiKey } from './apikeys';

const db = admin.firestore();

/**
 * REST API Middleware - Validates API key from request header
 */
async function authenticateRestApi(req: functions.https.Request): Promise<{ authenticated: boolean; userId?: string; error?: string }> {
    const apiKey = req.headers['x-api-key'] as string || req.query.api_key as string;

    if (!apiKey) {
        return { authenticated: false, error: 'API key required' };
    }

    const validation = await validateApiKey(apiKey);

    if (!validation.valid) {
        return { authenticated: false, error: 'Invalid API key' };
    }

    return { authenticated: true, userId: validation.userId };
}

/**
 * REST API: Get product details by ID
 * GET /api/v1/products/:productId
 */
export const apiGetProduct = functions.https.onRequest(async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Auth
    const auth = await authenticateRestApi(req);
    if (!auth.authenticated) {
        res.status(401).json({ error: auth.error });
        return;
    }

    const productId = req.path.split('/').pop();

    if (!productId) {
        res.status(400).json({ error: 'Product ID required' });
        return;
    }

    try {
        const productSnap = await db.collection('products').doc(productId).get();

        if (!productSnap.exists) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        const productData = productSnap.data();

        res.status(200).json({
            id: productSnap.id,
            ...productData
        });
    } catch (error) {
        functions.logger.error('API: Get product failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * REST API: Get price history for a product
 * GET /api/v1/prices/:productId
 */
export const apiGetPrices = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const auth = await authenticateRestApi(req);
    if (!auth.authenticated) {
        res.status(401).json({ error: auth.error });
        return;
    }

    const productId = req.path.split('/').pop();
    const days = parseInt(req.query.days as string) || 30;

    if (!productId) {
        res.status(400).json({ error: 'Product ID required' });
        return;
    }

    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const pricesSnap = await db.collection('price_history')
            .where('productId', '==', productId)
            .where('timestamp', '>=', cutoffDate)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        const prices = pricesSnap.docs.map(doc => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate().toISOString()
        }));

        res.status(200).json({
            productId,
            priceHistory: prices,
            count: prices.length
        });
    } catch (error) {
        functions.logger.error('API: Get prices failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * REST API: Search products
 * GET /api/v1/search?q=<query>&limit=<number>
 */
export const apiSearchProducts = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const auth = await authenticateRestApi(req);
    if (!auth.authenticated) {
        res.status(401).json({ error: auth.error });
        return;
    }

    const query = (req.query.q as string || '').toLowerCase();
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
        res.status(400).json({ error: 'Search query required' });
        return;
    }

    try {
        const productsSnap = await db.collection('products').get();

        const matchingProducts = productsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((product: any) => {
                const titleLower = (product.titleLower || '').toLowerCase();
                return titleLower.includes(query);
            })
            .slice(0, limit);

        res.status(200).json({
            query,
            results: matchingProducts,
            count: matchingProducts.length
        });
    } catch (error) {
        functions.logger.error('API: Search failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * REST API: Create price alert
 * POST /api/v1/alerts
 * Body: { productId, targetPrice }
 */
export const apiCreateAlert = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const auth = await authenticateRestApi(req);
    if (!auth.authenticated) {
        res.status(401).json({ error: auth.error });
        return;
    }

    const { productId, targetPrice } = req.body;

    if (!productId || !targetPrice) {
        res.status(400).json({ error: 'productId and targetPrice required' });
        return;
    }

    try {
        const alertRef = await db.collection('price_alerts').add({
            userId: auth.userId,
            productId,
            targetPrice: parseFloat(targetPrice),
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            triggered: false
        });

        res.status(201).json({
            success: true,
            alertId: alertRef.id,
            message: 'Price alert created'
        });
    } catch (error) {
        functions.logger.error('API: Create alert failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * REST API: List active alerts
 * GET /api/v1/alerts
 */
export const apiListAlerts = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    const auth = await authenticateRestApi(req);
    if (!auth.authenticated) {
        res.status(401).json({ error: auth.error });
        return;
    }

    try {
        const alertsSnap = await db.collection('price_alerts')
            .where('userId', '==', auth.userId)
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .get();

        const alerts = alertsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString()
        }));

        res.status(200).json({ alerts, count: alerts.length });
    } catch (error) {
        functions.logger.error('API: List alerts failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

import { ViralShare } from '../shared/ViralShare';

/**
 * REST API: Generate Creator Share Link
 * POST /api/v1/share/link
 */
export const apiCreateShareLink = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const auth = await authenticateRestApi(req);
    if (!auth.authenticated) {
        res.status(401).json({ error: auth.error });
        return;
    }

    const { path } = req.body;
    if (!path) {
        res.status(400).json({ error: 'Path required' });
        return;
    }

    try {
        // Use userId (API Key owner) as the referrer
        // In a real B2B scenario, userId might be the tenant/creator ID.
        // We assume the API Key matches a valid user record which serves as the referrer code or logic.
        // For simplicity, we use auth.userId as the referral 'code' here or fetch a nicer code.

        // Fetch user's proper referral code if exists, or just use ID?
        // Let's assume we pass auth.userId for now, or the client should pass ?ref=... 
        // But the requirement says "Wraps ViralShare".
        // Let's try to lookup the referral code for this user.

        const userRef = await db.collection('referrals').where('userId', '==', auth.userId).limit(1).get();
        let refCode = auth.userId; // Fallback
        if (!userRef.empty) {
            refCode = userRef.docs[0].data().code;
        }

        // Ideally base URL is config, but hardcoding for now or env var
        const baseUrl = process.env.BASE_URL || 'https://pricebuddy.web.app';
        const link = ViralShare.generateShareLink(baseUrl, path, refCode);

        res.status(200).json({ success: true, link });
    } catch (error) {
        functions.logger.error('API: Create link failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

