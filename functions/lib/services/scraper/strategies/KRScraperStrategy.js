"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KRScraperStrategy = void 0;
const MerchantAdapter_1 = require("../../../scrapers/MerchantAdapter");
const Resilience_1 = require("../../../shared/Resilience");
class KRScraperStrategy {
    constructor() {
        this.supportedRegions = ['KR'];
    }
    async search(query) {
        console.log(`[KRStrategy] Searching for "${query}"`);
        // 1. Get KR merchants
        const merchants = MerchantAdapter_1.MerchantRegistry.getByRegion('KR');
        if (merchants.length === 0) {
            console.warn('[KRStrategy] No KR merchants found');
            return [];
        }
        // ...
        // 2. Execute parallel search
        const searchPromises = merchants.map(async (merchant) => {
            try {
                // Wrap with RetryHelper
                const results = await Resilience_1.RetryHelper.withRetry(() => merchant.search(query, 20), 2, // Max retries
                500 // Base delay
                );
                return results;
            }
            catch (error) {
                console.error(`[KRStrategy] Search failed for ${merchant.name}:`, error);
                return [];
            }
        });
        const nestedResults = await Promise.all(searchPromises);
        const products = nestedResults.flat();
        // 3. Filter suspicious products (KR specific logic)
        return this.filterSuspiciousProducts(products);
    }
    /**
     * Filter out suspicious/fake listings AND mock data
     * (Moved from legacy ScraperService)
     */
    filterSuspiciousProducts(products) {
        if (products.length < 3)
            return products;
        const MOCK_INDICATORS = ['샘플', 'sample', 'fallback', 'mock', 'test'];
        const SUSPICIOUS_KEYWORDS = ['미개봉', '새상품', '병행수입', '리퍼', '중고', 'B급', 'C급', '전시'];
        // Calculate average price
        const prices = products.map(p => p.price).filter(p => p > 0);
        prices.sort((a, b) => a - b);
        const trimCount = Math.floor(prices.length * 0.1);
        const trimmedPrices = prices.slice(trimCount, prices.length - trimCount);
        const avgPrice = trimmedPrices.reduce((a, b) => a + b, 0) / trimmedPrices.length;
        return products.filter(product => {
            const price = product.price;
            const title = (product.title || '').toLowerCase();
            const id = (product.id || '').toLowerCase();
            if (MOCK_INDICATORS.some(kw => title.includes(kw) || id.includes(kw)))
                return false;
            if (id.includes('_fallback_') || id.includes('fallback'))
                return false;
            // Suspiciously low price check
            if (avgPrice > 0 && price < avgPrice * 0.4)
                return false;
            if (SUSPICIOUS_KEYWORDS.some(kw => title.includes(kw.toLowerCase())))
                return false;
            return true;
        });
    }
}
exports.KRScraperStrategy = KRScraperStrategy;
//# sourceMappingURL=KRScraperStrategy.js.map