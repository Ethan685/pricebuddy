import * as functions from 'firebase-functions';
import { MerchantRegistry, Region } from '../scrapers/MerchantAdapter';
import { ScraperService } from '../services/scraper';

// Real API Adapters
import { NaverShoppingAdapter } from '../scrapers/merchants/NaverShopping';

// Japanese Markets (Mock - for demo)
import { YahooJapanAdapter, AmazonJPAdapter, MercariJPAdapter } from '../scrapers/merchants/JapanMarkets';

// Register merchants (TODO: Move to a bootstrap file)
MerchantRegistry.register(new NaverShoppingAdapter()); // REAL
MerchantRegistry.register(new YahooJapanAdapter()); // Mock
MerchantRegistry.register(new AmazonJPAdapter()); // Mock  
MerchantRegistry.register(new MercariJPAdapter()); // Mock

console.log('✅ Registered: Naver (KR), Yahoo/Amazon/Mercari (JP)');

/**
 * Global multi-marketplace search
 */
export const searchGlobal = functions.https.onCall(async (data, context) => {
    const { query, region = 'ALL', limit = 10 } = data;

    if (!query) {
        throw new functions.https.HttpsError('invalid-argument', 'Query is required');
    }

    try {
        const products = await ScraperService.search(query, region, limit);

        // Get merchants name list for metadata
        const merchants = region === 'ALL'
            ? await MerchantRegistry.getAvailable()
            : MerchantRegistry.getByRegion(region as Region);

        return {
            query,
            region,
            totalResults: products.length,
            merchants: merchants.map(m => m.name),
            products: products
        };

    } catch (error) {
        console.error('Global search error:', error);
        throw new functions.https.HttpsError('internal', 'Search failed');
    }
});

/**
 * Get all available merchants
 */
export const getAvailableMerchants = functions.https.onCall(async (data, context) => {
    const merchants = await MerchantRegistry.getAvailable();

    return merchants.map(m => ({
        name: m.name,
        region: m.region,
        currency: m.currency,
        countryCode: m.countryCode
    }));
});

