import * as admin from 'firebase-admin';

interface CacheData {
    data: any;
    expiry: number;
}

/**
 * Two-tier caching system (Memory + Firestore)
 * for API responses and computed data
 */
export class ApiCache {
    private memoryCache = new Map<string, CacheData>();
    private readonly MAX_MEMORY_ITEMS = 1000;

    /**
     * Get cached data
     * @param key - Cache key
     * @returns Cached data or null if not found/expired
     */
    async get(key: string): Promise<any | null> {
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
                const data = doc.data() as CacheData;
                if (data && data.expiry > Date.now()) {
                    console.log(`Cache HIT (firestore): ${key}`);

                    // Promote to memory cache
                    this.setMemoryCache(key, data);
                    return data.data;
                }
            }
        } catch (error) {
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
    async set(key: string, data: any, ttlMs: number): Promise<void> {
        const expiry = Date.now() + ttlMs;
        const cacheData: CacheData = { data, expiry };

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
    async invalidate(key: string): Promise<void> {
        this.memoryCache.delete(key);

        try {
            await admin.firestore()
                .collection('apiCache')
                .doc(this.sanitizeKey(key))
                .delete();
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }

    /**
     * Clear all expired entries (cleanup)
     */
    async cleanup(): Promise<void> {
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
        } catch (error) {
            console.error('Cache cleanup error:', error);
        }
    }

    private setMemoryCache(key: string, data: CacheData): void {
        // Evict oldest if at capacity
        if (this.memoryCache.size >= this.MAX_MEMORY_ITEMS) {
            const firstKey = this.memoryCache.keys().next().value;
            this.memoryCache.delete(firstKey);
        }

        this.memoryCache.set(key, data);
    }

    private async setFirestoreCache(key: string, data: CacheData): Promise<void> {
        await admin.firestore()
            .collection('apiCache')
            .doc(this.sanitizeKey(key))
            .set(data);
    }

    private sanitizeKey(key: string): string {
        // Firestore doc IDs can't contain certain characters
        return key.replace(/[\/\\\.\#\$\[\]]/g, '_');
    }
}

// Singleton instance
export const apiCache = new ApiCache();
