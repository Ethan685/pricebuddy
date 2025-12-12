"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiClient = void 0;
const RateLimiter_1 = require("./RateLimiter");
const ApiCache_1 = require("./ApiCache");
const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryableStatuses: [429, 500, 502, 503, 504]
};
/**
 * API Client with automatic retry, rate limiting, and caching
 */
class ApiClient {
    /**
     * Fetch with automatic retry and exponential backoff
     * @param fn - Function to execute
     * @param rateLimitKey - Key for rate limiting (optional)
     * @param config - Retry configuration
     */
    async fetchWithRetry(fn, rateLimitKey, config = {}) {
        var _a;
        const cfg = Object.assign(Object.assign({}, DEFAULT_RETRY_CONFIG), config);
        let lastError = null;
        for (let attempt = 0; attempt < cfg.maxRetries; attempt++) {
            try {
                // Rate limit check
                if (rateLimitKey) {
                    await RateLimiter_1.rateLimiter.waitForSlot(rateLimitKey, 10, 60000); // 10 req/min default
                }
                // Execute function
                return await fn();
            }
            catch (error) {
                lastError = error;
                // Check if error is retryable
                const status = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || error.status;
                const isRetryable = cfg.retryableStatuses.includes(status);
                if (!isRetryable || attempt === cfg.maxRetries - 1) {
                    // Not retryable or max retries reached
                    throw error;
                }
                // Calculate backoff delay
                const delay = Math.min(cfg.baseDelay * Math.pow(2, attempt), cfg.maxDelay);
                console.log(`Request failed (attempt ${attempt + 1}/${cfg.maxRetries}), ` +
                    `retrying in ${delay}ms... Status: ${status}`);
                await this.sleep(delay);
            }
        }
        throw lastError || new Error('Max retries exceeded');
    }
    /**
     * Fetch with caching
     * @param cacheKey - Cache key
     * @param fn - Function to execute if cache miss
     * @param ttlMs - Cache TTL in milliseconds
     * @param rateLimitKey - Rate limit key
     */
    async fetchWithCache(cacheKey, fn, ttlMs = 3600000, // 1 hour default
    rateLimitKey) {
        // Check cache first
        const cached = await ApiCache_1.apiCache.get(cacheKey);
        if (cached !== null) {
            return cached;
        }
        // Cache miss - fetch data
        const data = await this.fetchWithRetry(fn, rateLimitKey);
        // Store in cache
        await ApiCache_1.apiCache.set(cacheKey, data, ttlMs);
        return data;
    }
    /**
     * Batch fetch with concurrency control
     * @param items - Items to process
     * @param fn - Function to execute for each item
     * @param concurrency - Maximum concurrent requests
     */
    async batchFetch(items, fn, concurrency = 5) {
        const results = [];
        const queue = [...items];
        const workers = Array(concurrency).fill(null).map(async () => {
            while (queue.length > 0) {
                const item = queue.shift();
                if (!item)
                    break;
                try {
                    const result = await fn(item);
                    results.push(result);
                }
                catch (error) {
                    console.error('Batch fetch error:', error);
                    // Continue with other items
                }
            }
        });
        await Promise.all(workers);
        return results;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.ApiClient = ApiClient;
// Singleton instance
exports.apiClient = new ApiClient();
//# sourceMappingURL=ApiClient.js.map