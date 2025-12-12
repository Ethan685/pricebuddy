"use strict";
/**
 * Resilience utilities for handling transient failures.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryHelper = void 0;
class RetryHelper {
    /**
     * Executes a function with exponential backoff retry logic.
     * @param fn The async function to execute
     * @param maxRetries Maximum number of retries (default: 3)
     * @param baseDelayMs Base delay in milliseconds (default: 1000)
     */
    static async withRetry(fn, maxRetries = 3, baseDelayMs = 1000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                // Don't retry on the last attempt
                if (attempt === maxRetries)
                    break;
                // Calculate delay with exponential backoff and jitter
                const delay = baseDelayMs * Math.pow(2, attempt) + (Math.random() * 100);
                console.warn(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay)}ms...`, error);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
}
exports.RetryHelper = RetryHelper;
//# sourceMappingURL=Resilience.js.map