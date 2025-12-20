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
exports.apiCreateShareLink = exports.apiListAlerts = exports.apiCreateAlert = exports.apiSearchProducts = exports.apiGetPrices = exports.apiGetProduct = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const apikeys_1 = require("./apikeys");
const db = admin.firestore();
/**
 * REST API Middleware - Validates API key from request header
 */
async function authenticateRestApi(req) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKey) {
        return { authenticated: false, error: 'API key required' };
    }
    const validation = await (0, apikeys_1.validateApiKey)(apiKey);
    if (!validation.valid) {
        return { authenticated: false, error: 'Invalid API key' };
    }
    return { authenticated: true, userId: validation.userId };
}
/**
 * REST API: Get product details by ID
 * GET /api/v1/products/:productId
 */
exports.apiGetProduct = functions.https.onRequest(async (req, res) => {
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
    }
    catch (error) {
        functions.logger.error('API: Get product failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * REST API: Get price history for a product
 * GET /api/v1/prices/:productId
 */
exports.apiGetPrices = functions.https.onRequest(async (req, res) => {
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
    const days = parseInt(req.query.days) || 30;
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
    }
    catch (error) {
        functions.logger.error('API: Get prices failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * REST API: Search products
 * GET /api/v1/search?q=<query>&limit=<number>
 */
exports.apiSearchProducts = functions.https.onRequest(async (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
    res.setHeader("access-control-allow-headers", "Content-Type, X-API-Key");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    const qFromQuery = String(req.query?.q || req.query?.query || "").trim();
    let q = qFromQuery;
    if (!q) {
        try {
            const bodyAny = req.body;
            if (bodyAny && typeof bodyAny === "object") {
                q = String(bodyAny.q || bodyAny.query || "").trim();
            }
            else if (typeof bodyAny === "string" && bodyAny.trim()) {
                const parsed = JSON.parse(bodyAny);
                q = String(parsed?.q || parsed?.query || "").trim();
            }
            else if (req.rawBody) {
                const raw = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString("utf8") : String(req.rawBody);
                if (raw.trim()) {
                    const parsed = JSON.parse(raw);
                    q = String(parsed?.q || parsed?.query || "").trim();
                }
            }
        }
        catch (_) { }
    }
    if (!q) {
        res.status(400).json({ error: "Search query required" });
        return;
    }
    const region = String(req.query?.region || req?.body?.region || "KR").trim();
    // 개발 환경(에뮬레이터)에서는 API 키 검증 우회
    // 에뮬레이터는 localhost나 127.0.0.1에서 실행되므로 이를 확인
    const isDevelopment = process.env.FUNCTIONS_EMULATOR === "true" ||
        process.env.FIRESTORE_EMULATOR_HOST !== undefined ||
        !process.env.GCLOUD_PROJECT ||
        (req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1")));
    if (!isDevelopment) {
        // 프로덕션 환경에서만 API 키 검증
        try {
            const apiKeyHeader = (req.get && req.get("x-api-key")) || (req.headers && req.headers["x-api-key"]) || "";
            const apiKey = String(apiKeyHeader || "").trim();
            const { valid } = await (0, apikeys_1.validateApiKey)(apiKey);
            if (!valid) {
                res.status(401).json({ error: "Invalid API key" });
                return;
            }
        }
        catch (e) {
            res.status(401).json({ error: "Invalid API key" });
            return;
        }
    }
    try {
        const results = await searchProducts({ q, region });
        res.status(200).json({ ok: true, q, region, results });
    }
    catch (e) {
        res.status(500).json({ error: "Search failed", detail: String(e?.message || e) });
    }
});
/**
 * REST API: Create price alert
 * POST /api/v1/alerts
 * Body: { productId, targetPrice }
 */
exports.apiCreateAlert = functions.https.onRequest(async (req, res) => {
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
    }
    catch (error) {
        functions.logger.error('API: Create alert failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * REST API: List active alerts
 * GET /api/v1/alerts
 */
exports.apiListAlerts = functions.https.onRequest(async (req, res) => {
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
    }
    catch (error) {
        functions.logger.error('API: List alerts failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const ViralShare_1 = require("../shared/ViralShare");
require("./search-global");
const index_1 = require("../services/scraper/index");
async function searchProducts({ q, region }) {
    const rr = String(region || "KR").toUpperCase() === "KR" ? "KR" : "GLOBAL";
    const products = await index_1.ScraperService.search(String(q || ""), rr, 10);
    return Array.isArray(products) ? products : [];
}
/**
 * REST API: Generate Creator Share Link
 * POST /api/v1/share/link
 */
exports.apiCreateShareLink = functions.https.onRequest(async (req, res) => {
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
        const link = ViralShare_1.ViralShare.generateShareLink(baseUrl, path, refCode);
        res.status(200).json({ success: true, link });
    }
    catch (error) {
        functions.logger.error('API: Create link failed', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
