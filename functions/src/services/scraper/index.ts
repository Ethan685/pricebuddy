import { MerchantRegistry } from '../../scrapers/MerchantAdapter';
import { currencyService } from '../CurrencyService';
import { GroupedProduct, MatcherService } from '../matcher';
import '../../scrapers/merchants/NaverShopping'; // Ensure registers
import '../../scrapers/merchants/JapanMarkets'; // Ensure JP merchants register
import { IScraperStrategy } from './strategies/IScraperStrategy';
import { KRScraperStrategy } from './strategies/KRScraperStrategy';
import { JPScraperStrategy } from './strategies/JPScraperStrategy';

export class ScraperService {
    private static strategies: IScraperStrategy[] = [
        new KRScraperStrategy(),
        new JPScraperStrategy()
    ];

    /**
     * Search for products using the appropriate regional strategy.
     */
    static async search(query: string, region: string = 'KR', limit: number = 20): Promise<GroupedProduct[]> {
        console.log(`Searching for "${query}" in ${region}`);

        // 1. Select Strategies
        let strategiesToRun: IScraperStrategy[] = [];

        if (region === 'ALL') {
            strategiesToRun = this.strategies;
        } else {
            const strategy = this.strategies.find(s => s.supportedRegions.includes(region));
            if (strategy) strategiesToRun.push(strategy);
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
        const productsWithKRW = await Promise.all(
            products.map(async (product) => {
                if (product.currency === 'KRW') {
                    return { ...product, priceKRW: product.price };
                }

                const priceKRW = await currencyService.convert(
                    product.price,
                    product.currency,
                    'KRW'
                );
                return { ...product, priceKRW };
            })
        );

        // 3. Grouping (Matcher Service)
        return MatcherService.groupProducts(productsWithKRW);
    }

    /**
     * Get detailed product information from a URL.
     */
    static async getProductDetails(url: string): Promise<any> {
        return null; // TODO
    }
}

