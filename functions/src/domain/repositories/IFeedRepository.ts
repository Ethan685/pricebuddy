import { Product } from '../entities/Product';

export interface IFeedRepository {
    getRecentProducts(limit: number): Promise<Product[]>;
    // Future: getProductsByInterest(interest: string, limit: number): Promise<Product[]>;
}
