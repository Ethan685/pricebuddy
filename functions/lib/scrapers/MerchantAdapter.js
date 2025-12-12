"use strict";
/**
 * Base interface for all marketplace adapters
 * Allows seamless integration of new marketplaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantRegistry = exports.BaseMerchantAdapter = void 0;
/**
 * Base adapter with common functionality
 */
class BaseMerchantAdapter {
    /**
     * Fetch with retry logic
     */
    async fetchWithRetry(url, options, maxRetries = 3) {
        let lastError = null;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, Object.assign(Object.assign({}, options), { headers: Object.assign({ 'User-Agent': 'PriceBuddy/1.0' }, options === null || options === void 0 ? void 0 : options.headers) }));
                if (response.ok) {
                    return response;
                }
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            catch (error) {
                lastError = error;
                // Wait before retry (exponential backoff)
                if (i < maxRetries - 1) {
                    await this.sleep(Math.pow(2, i) * 1000);
                }
            }
        }
        throw lastError || new Error('Fetch failed');
    }
    /**
     * Parse price string to number
     */
    parsePrice(priceString) {
        // Remove currency symbols and formatting
        const cleaned = priceString
            .replace(/[^0-9.,]/g, '')
            .replace(/,/g, '');
        return parseFloat(cleaned) || 0;
    }
    /**
     * Extract product ID from URL
     */
    extractProductId(url) {
        // Override in specific adapters
        return null;
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Default availability check
     */
    async isAvailable() {
        return true;
    }
}
exports.BaseMerchantAdapter = BaseMerchantAdapter;
/**
 * Merchant Registry
 * Central registry for all marketplace adapters
 */
class MerchantRegistry {
    static register(adapter) {
        this.merchants.set(adapter.name, adapter);
    }
    static get(name) {
        return this.merchants.get(name);
    }
    static getAll() {
        return Array.from(this.merchants.values());
    }
    static getByRegion(region) {
        if (region === 'ALL') {
            return this.getAll();
        }
        return this.getAll().filter(m => m.region === region);
    }
    static getAvailable() {
        return Promise.all(this.getAll().map(async (m) => ({
            merchant: m,
            available: await m.isAvailable()
        }))).then(results => results
            .filter(r => r.available)
            .map(r => r.merchant));
    }
}
exports.MerchantRegistry = MerchantRegistry;
MerchantRegistry.merchants = new Map();
//# sourceMappingURL=MerchantAdapter.js.map