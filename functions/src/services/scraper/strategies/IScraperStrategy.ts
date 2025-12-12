import { Product } from '../../../scrapers/MerchantAdapter';

export interface IScraperStrategy {
    search(query: string): Promise<Product[]>;
    supportedRegions: string[];
}
