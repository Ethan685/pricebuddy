"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.RateLimiter = void 0;
/**
 * Rate Limiter for API quota management
 * Prevents exceeding API rate limits across different services
 */
class RateLimiter {
    constructor() {
        this.requests = new Map();
    }
    /**
     * Check if request is within rate limit
     * @param key - Identifier for the rate limit (e.g., 'naver-api')
     * @param maxRequests - Maximum number of requests allowed
     * @param windowMs - Time window in milliseconds
     * @returns true if request is allowed, false if rate limit exceeded
     */
    async checkLimit(key, maxRequests, windowMs) {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        // Remove requests outside the time window
        const validRequests = requests.filter(time => now - time < windowMs);
        if (validRequests.length >= maxRequests) {
            return false; // Rate limit exceeded
        }
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }
    /**
     * Wait until a slot is available
     * @param key - Identifier for the rate limit
     * @param maxRequests - Maximum number of requests allowed
     * @param windowMs - Time window in milliseconds
     */
    async waitForSlot(key, maxRequests, windowMs) {
        while (!(await this.checkLimit(key, maxRequests, windowMs))) {
            await this.sleep(1000); // Wait 1 second and retry
        }
    }
    /**
     * Get current request count for a key
     */
    getRequestCount(key, windowMs) {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        return requests.filter(time => now - time < windowMs).length;
    }
    /**
     * Reset rate limit for a key
     */
    reset(key) {
        this.requests.delete(key);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RateLimiter = RateLimiter;
// Singleton instance
exports.rateLimiter = new RateLimiter();
