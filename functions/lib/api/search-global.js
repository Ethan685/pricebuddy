"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableMerchants = exports.searchGlobal = void 0;
const functions = __importStar(require("firebase-functions"));
const MerchantAdapter_1 = require("../scrapers/MerchantAdapter");
const scraper_1 = require("../services/scraper");
// Real API Adapters
const NaverShopping_1 = require("../scrapers/merchants/NaverShopping");
// Japanese Markets (Mock - for demo)
const JapanMarkets_1 = require("../scrapers/merchants/JapanMarkets");
// Register merchants (TODO: Move to a bootstrap file)
MerchantAdapter_1.MerchantRegistry.register(new NaverShopping_1.NaverShoppingAdapter()); // REAL
MerchantAdapter_1.MerchantRegistry.register(new JapanMarkets_1.YahooJapanAdapter()); // Mock
MerchantAdapter_1.MerchantRegistry.register(new JapanMarkets_1.AmazonJPAdapter()); // Mock  
MerchantAdapter_1.MerchantRegistry.register(new JapanMarkets_1.MercariJPAdapter()); // Mock
console.log('✅ Registered: Naver (KR), Yahoo/Amazon/Mercari (JP)');
/**
 * Global multi-marketplace search
 */
exports.searchGlobal = functions.https.onCall(async (data, context) => {
    const { query, region = 'ALL', limit = 10 } = data;
    if (!query) {
        throw new functions.https.HttpsError('invalid-argument', 'Query is required');
    }
    try {
        const products = await scraper_1.ScraperService.search(query, region, limit);
        // Get merchants name list for metadata
        const merchants = region === 'ALL'
            ? await MerchantAdapter_1.MerchantRegistry.getAvailable()
            : MerchantAdapter_1.MerchantRegistry.getByRegion(region);
        return {
            query,
            region,
            totalResults: products.length,
            merchants: merchants.map(m => m.name),
            products: products
        };
    }
    catch (error) {
        console.error('Global search error:', error);
        throw new functions.https.HttpsError('internal', 'Search failed');
    }
});
/**
 * Get all available merchants
 */
exports.getAvailableMerchants = functions.https.onCall(async (data, context) => {
    const merchants = await MerchantAdapter_1.MerchantRegistry.getAvailable();
    return merchants.map(m => ({
        name: m.name,
        region: m.region,
        currency: m.currency,
        countryCode: m.countryCode
    }));
});
//# sourceMappingURL=search-global.js.map