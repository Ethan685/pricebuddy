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
exports.apiCache = exports.ApiCache = void 0;
const admin = __importStar(require("firebase-admin"));
/**
 * Two-tier caching system (Memory + Firestore)
 * for API responses and computed data
 */
class ApiCache {
    constructor() {
        this.memoryCache = new Map();
        this.MAX_MEMORY_ITEMS = 1000;
    }
    /**
     * Get cached data
     * @param key - Cache key
     * @returns Cached data or null if not found/expired
     */
    async get(key) {
        // Check memory cache first (fastest)
        const memoryCached = this.memoryCache.get(key);
        if (memoryCached && memoryCached.expiry > Date.now()) {
            console.log(`Cache HIT (memory): ${key}`);
            return memoryCached.data;
        }
        // Check Firestore cache (slower but persistent)
        try {
            const doc = await admin.firestore()
                .collection('apiCache')
                .doc(this.sanitizeKey(key))
                .get();
            if (doc.exists) {
                const data = doc.data();
                if (data && data.expiry > Date.now()) {
                    console.log(`Cache HIT (firestore): ${key}`);
                    // Promote to memory cache
                    this.setMemoryCache(key, data);
                    return data.data;
                }
            }
        }
        catch (error) {
            console.error('Firestore cache read error:', error);
        }
        console.log(`Cache MISS: ${key}`);
        return null;
    }
    /**
     * Set cached data
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttlMs - Time to live in milliseconds
     */
    async set(key, data, ttlMs) {
        const expiry = Date.now() + ttlMs;
        const cacheData = { data, expiry };
        // Set memory cache
        this.setMemoryCache(key, cacheData);
        // Set Firestore cache (async, don't wait)
        this.setFirestoreCache(key, cacheData).catch(error => {
            console.error('Firestore cache write error:', error);
        });
    }
    /**
     * Invalidate cache for a key
     */
    async invalidate(key) {
        this.memoryCache.delete(key);
        try {
            await admin.firestore()
                .collection('apiCache')
                .doc(this.sanitizeKey(key))
                .delete();
        }
        catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }
    /**
     * Clear all expired entries (cleanup)
     */
    async cleanup() {
        const now = Date.now();
        // Memory cache cleanup
        for (const [key, value] of this.memoryCache.entries()) {
            if (value.expiry <= now) {
                this.memoryCache.delete(key);
            }
        }
        // Firestore cleanup (batch delete expired)
        try {
            const snapshot = await admin.firestore()
                .collection('apiCache')
                .where('expiry', '<=', now)
                .limit(500)
                .get();
            const batch = admin.firestore().batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`Cleaned up ${snapshot.size} expired cache entries`);
        }
        catch (error) {
            console.error('Cache cleanup error:', error);
        }
    }
    setMemoryCache(key, data) {
        // Evict oldest if at capacity
        if (this.memoryCache.size >= this.MAX_MEMORY_ITEMS) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }
        this.memoryCache.set(key, data);
    }
    async setFirestoreCache(key, data) {
        await admin.firestore()
            .collection('apiCache')
            .doc(this.sanitizeKey(key))
            .set(data);
    }
    sanitizeKey(key) {
        // Firestore doc IDs can't contain certain characters
        return key.replace(/[\/\\\.\#\$\[\]]/g, '_');
    }
}
exports.ApiCache = ApiCache;
// Singleton instance
exports.apiCache = new ApiCache();
//# sourceMappingURL=ApiCache.js.map