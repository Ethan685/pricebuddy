import { rateLimiter } from './RateLimiter';
import { apiCache } from './ApiCache';

interface RetryConfig {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
    retryableStatuses: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryableStatuses: [429, 500, 502, 503, 504]
};

/**
 * API Client with automatic retry, rate limiting, and caching
 */
export class ApiClient {
    /**
     * Fetch with automatic retry and exponential backoff
     * @param fn - Function to execute
     * @param rateLimitKey - Key for rate limiting (optional)
     * @param config - Retry configuration
     */
    async fetchWithRetry<T>(
        fn: () => Promise<T>,
        rateLimitKey?: string,
        config: Partial<RetryConfig> = {}
    ): Promise<T> {
        const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < cfg.maxRetries; attempt++) {
            try {
                // Rate limit check
                if (rateLimitKey) {
                    await rateLimiter.waitForSlot(rateLimitKey, 10, 60000); // 10 req/min default
                }

                // Execute function
                return await fn();
            } catch (error: any) {
                lastError = error;

                // Check if error is retryable
                const status = error.response?.status || error.status;
                const isRetryable = cfg.retryableStatuses.includes(status);

                if (!isRetryable || attempt === cfg.maxRetries - 1) {
                    // Not retryable or max retries reached
                    throw error;
                }

                // Calculate backoff delay
                const delay = Math.min(
                    cfg.baseDelay * Math.pow(2, attempt),
                    cfg.maxDelay
                );

                console.log(
                    `Request failed (attempt ${attempt + 1}/${cfg.maxRetries}), ` +
                    `retrying in ${delay}ms... Status: ${status}`
                );

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
    async fetchWithCache<T>(
        cacheKey: string,
        fn: () => Promise<T>,
        ttlMs: number = 3600000, // 1 hour default
        rateLimitKey?: string
    ): Promise<T> {
        // Check cache first
        const cached = await apiCache.get(cacheKey);
        if (cached !== null) {
            return cached as T;
        }

        // Cache miss - fetch data
        const data = await this.fetchWithRetry(fn, rateLimitKey);

        // Store in cache
        await apiCache.set(cacheKey, data, ttlMs);

        return data;
    }

    /**
     * Batch fetch with concurrency control
     * @param items - Items to process
     * @param fn - Function to execute for each item
     * @param concurrency - Maximum concurrent requests
     */
    async batchFetch<T, R>(
        items: T[],
        fn: (item: T) => Promise<R>,
        concurrency: number = 5
    ): Promise<R[]> {
        const results: R[] = [];
        const queue = [...items];

        const workers = Array(concurrency).fill(null).map(async () => {
            while (queue.length > 0) {
                const item = queue.shift();
                if (!item) break;

                try {
                    const result = await fn(item);
                    results.push(result);
                } catch (error) {
                    console.error('Batch fetch error:', error);
                    // Continue with other items
                }
            }
        });

        await Promise.all(workers);
        return results;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
export const apiClient = new ApiClient();
