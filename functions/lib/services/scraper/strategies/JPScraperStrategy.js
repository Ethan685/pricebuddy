"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JPScraperStrategy = void 0;
const MerchantAdapter_1 = require("../../../scrapers/MerchantAdapter");
const Resilience_1 = require("../../../shared/Resilience");
class JPScraperStrategy {
    constructor() {
        this.supportedRegions = ['JP'];
    }
    async search(query) {
        console.log(`[JPStrategy] Searching for "${query}"`);
        // 1. Get JP merchants
        const merchants = MerchantAdapter_1.MerchantRegistry.getByRegion('JP');
        if (merchants.length === 0) {
            console.warn('[JPStrategy] No JP merchants found');
            return [];
        }
        // 2. Execute parallel search
        const searchPromises = merchants.map(async (merchant) => {
            try {
                // Wrap with RetryHelper
                const results = await Resilience_1.RetryHelper.withRetry(() => merchant.search(query, 20), 2, 500);
                return results;
            }
            catch (error) {
                console.error(`[JPStrategy] Search failed for ${merchant.name}:`, error);
                return [];
            }
        });
        const nestedResults = await Promise.all(searchPromises);
        const products = nestedResults.flat();
        // 3. Simple filtering for JP (lighter than KR for now)
        return products.filter(p => p.price > 0 && p.title);
    }
}
exports.JPScraperStrategy = JPScraperStrategy;
//# sourceMappingURL=JPScraperStrategy.js.map