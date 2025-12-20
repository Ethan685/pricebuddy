"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const CurrencyService_1 = require("../CurrencyService");
const matcher_1 = require("../matcher");
require("../../scrapers/merchants/NaverShopping"); // Ensure registers
require("../../scrapers/merchants/JapanMarkets"); // Ensure JP merchants register
const KRScraperStrategy_1 = require("./strategies/KRScraperStrategy");
const JPScraperStrategy_1 = require("./strategies/JPScraperStrategy");
class ScraperService {
    /**
     * Search for products using the appropriate regional strategy.
     */
    static async search(query, region = 'KR', limit = 20) {
        console.log(`Searching for "${query}" in ${region}`);
        // 1. Select Strategies
        let strategiesToRun = [];
        if (region === 'ALL') {
            strategiesToRun = this.strategies;
        }
        else {
            const strategy = this.strategies.find(s => s.supportedRegions.includes(region));
            if (strategy)
                strategiesToRun.push(strategy);
        }
        if (strategiesToRun.length === 0) {
            console.warn(`No strategy found for region ${region}`);
            return [];
        }
        // Execute strategies in parallel
        const results = await Promise.all(strategiesToRun.map(s => s.search(query)));
        const products = results.flat();
        // 2. Currency Conversion (Centralized)
        // Strategies typically return products in their local currency.
        // We ensure everything is converted to KRW for the frontend comparison for now,
        // OR we respect the target currency. The legacy code converted everything to KRW.
        const productsWithKRW = await Promise.all(products.map(async (product) => {
            if (product.currency === 'KRW') {
                return { ...product, priceKRW: product.price };
            }
            const priceKRW = await CurrencyService_1.currencyService.convert(product.price, product.currency, 'KRW');
            return { ...product, priceKRW };
        }));
        // 3. Grouping (Matcher Service)
        return matcher_1.MatcherService.groupProducts(productsWithKRW);
    }
    /**
     * Get detailed product information from a URL.
     */
    static async getProductDetails(url) {
        return null; // TODO
    }
}
exports.ScraperService = ScraperService;
ScraperService.strategies = [
    new KRScraperStrategy_1.KRScraperStrategy(),
    new JPScraperStrategy_1.JPScraperStrategy()
];
