import * as admin from 'firebase-admin';
import { IReferralService } from '../../domain/services/IReferralService';
import { RetryHelper } from '../../shared/Resilience';

export class FirestoreReferralRepository implements IReferralService {
    private db = admin.firestore();
    private collection = this.db.collection('referrals');

    async generateReferralCode(userId: string): Promise<string> {
        // Check if user already has a code
        const snapshot = await this.collection.where('userId', '==', userId).limit(1).get();
        if (!snapshot.empty) {
            return snapshot.docs[0].data().code;
        }

        // Generate new code (Retry for collision)
        return RetryHelper.withRetry(async () => {
            const code = this.createRandomCode();

            // Allow transaction to ensure uniqueness
            await this.db.runTransaction(async (t) => {
                const docRef = this.collection.doc(code);
                const doc = await t.get(docRef);
                if (doc.exists) {
                    throw new Error('Code collision');
                }
                t.set(docRef, {
                    code,
                    userId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    usageCount: 0
                });
            });

            return code;
        });
    }

    async validateReferralCode(code: string): Promise<boolean> {
        const doc = await this.collection.doc(code).get();
        return doc.exists;
    }

    async attributeReferral(code: string, newUserId: string): Promise<void> {
        const docRef = this.collection.doc(code);

        await this.db.runTransaction(async (t) => {
            const doc = await t.get(docRef);
            if (!doc.exists) return; // Silent fail or throw?

            t.update(docRef, {
                usageCount: admin.firestore.FieldValue.increment(1),
                lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Log attribution
            const attributionRef = this.db.collection('referral_attributions').doc();
            t.set(attributionRef, {
                referralCode: code,
                refererId: doc.data()?.userId,
                refereeId: newUserId,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        });
    }

    private createRandomCode(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}
