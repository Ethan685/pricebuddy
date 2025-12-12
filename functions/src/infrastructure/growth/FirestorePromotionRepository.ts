import * as admin from 'firebase-admin';
import { IPromotionService } from '../../domain/services/IPromotionService';
import { Promotion } from '../../domain/entities/Promotion';

export class FirestorePromotionRepository implements IPromotionService {
    private db = admin.firestore();
    private collection = this.db.collection('promotions');

    async getActivePromotions(): Promise<Promotion[]> {
        const now = admin.firestore.Timestamp.now();
        const snapshot = await this.collection
            .where('isActive', '==', true)
            .where('endDate', '>=', now)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
    }

    async applyPromotion(code: string, context: { userId: string; originalAmount?: number }): Promise<Promotion | null> {
        const snapshot = await this.collection.where('code', '==', code).limit(1).get();
        if (snapshot.empty) return null;

        const promo = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Promotion;

        // 1. Check validity (Date)
        const now = new Date();
        if (promo.startDate > now || promo.endDate < now || !promo.isActive) {
            return null;
        }

        // 2. Check conditions (e.g. Min Amount)
        if (promo.conditions.minAmount && (context.originalAmount || 0) < promo.conditions.minAmount) {
            return null;
        }

        return promo;
    }
}
