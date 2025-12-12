/**
 * Rate Limiter for API quota management
 * Prevents exceeding API rate limits across different services
 */
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    /**
     * Check if request is within rate limit
     * @param key - Identifier for the rate limit (e.g., 'naver-api')
     * @param maxRequests - Maximum number of requests allowed
     * @param windowMs - Time window in milliseconds
     * @returns true if request is allowed, false if rate limit exceeded
     */
    async checkLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
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
    async waitForSlot(key: string, maxRequests: number, windowMs: number): Promise<void> {
        while (!(await this.checkLimit(key, maxRequests, windowMs))) {
            await this.sleep(1000); // Wait 1 second and retry
        }
    }

    /**
     * Get current request count for a key
     */
    getRequestCount(key: string, windowMs: number): number {
        const now = Date.now();
        const requests = this.requests.get(key) || [];
        return requests.filter(time => now - time < windowMs).length;
    }

    /**
     * Reset rate limit for a key
     */
    reset(key: string): void {
        this.requests.delete(key);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
export const rateLimiter = new RateLimiter();
