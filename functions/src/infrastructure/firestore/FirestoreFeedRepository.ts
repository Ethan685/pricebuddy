import * as admin from 'firebase-admin';
import { IFeedRepository } from '../../domain/repositories/IFeedRepository';
import { Product } from '../../domain/entities/Product';

export class FirestoreFeedRepository implements IFeedRepository {
    private db = admin.firestore();

    async getRecentProducts(limit: number): Promise<Product[]> {
        const snapshot = await this.db.collection('products')
            .limit(limit)
            // .orderBy('createdAt', 'desc') // Ensure index exists if using orderBy
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
    }
}
