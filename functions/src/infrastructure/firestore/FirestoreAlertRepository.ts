import * as admin from 'firebase-admin';
import { IAlertRepository } from '../../domain/repositories/IAlertRepository';
import { Alert } from '../../domain/entities/Alert';

export class FirestoreAlertRepository implements IAlertRepository {
    private db = admin.firestore();
    private collection = this.db.collection('alerts');

    async createAlert(alertData: Omit<Alert, 'id' | 'createdAt'>): Promise<string> {
        const docRef = this.collection.doc();
        await docRef.set({
            ...alertData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return docRef.id;
    }

    async getAlertsByUserId(userId: string): Promise<Alert[]> {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Alert));
    }

    async updateAlert(id: string, updates: Partial<Alert>): Promise<void> {
        const updateData: any = { ...updates };
        if (updates.updatedAt) {
            updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        }
        await this.collection.doc(id).update(updateData);
    }

    async findActiveAlert(userId: string, productId: string): Promise<Alert | null> {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('productId', '==', productId)
            .where('isActive', '==', true)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        } as Alert;
    }
}
