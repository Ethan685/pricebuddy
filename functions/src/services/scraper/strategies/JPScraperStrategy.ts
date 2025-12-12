import { IScraperStrategy } from './IScraperStrategy';
import { Product, MerchantRegistry } from '../../../scrapers/MerchantAdapter';
import { RetryHelper } from '../../../shared/Resilience';

export class JPScraperStrategy implements IScraperStrategy {
    supportedRegions = ['JP'];

    async search(query: string): Promise<Product[]> {
        console.log(`[JPStrategy] Searching for "${query}"`);

        // 1. Get JP merchants
        const merchants = MerchantRegistry.getByRegion('JP');
        if (merchants.length === 0) {
            console.warn('[JPStrategy] No JP merchants found');
            return [];
        }

        // 2. Execute parallel search
        const searchPromises = merchants.map(async (merchant) => {
            try {
                // Wrap with RetryHelper
                const results = await RetryHelper.withRetry(
                    () => merchant.search(query, 20),
                    2,
                    500
                );
                return results;
            } catch (error) {
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
