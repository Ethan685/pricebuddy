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
exports.FirestoreAlertRepository = void 0;
const admin = __importStar(require("firebase-admin"));
class FirestoreAlertRepository {
    constructor() {
        this.db = admin.firestore();
        this.collection = this.db.collection('alerts');
    }
    async createAlert(alertData) {
        const docRef = this.collection.doc();
        await docRef.set({
            ...alertData,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return docRef.id;
    }
    async getAlertsByUserId(userId) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    async updateAlert(id, updates) {
        const updateData = { ...updates };
        if (updates.updatedAt) {
            updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        }
        await this.collection.doc(id).update(updateData);
    }
    async findActiveAlert(userId, productId) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('productId', '==', productId)
            .where('isActive', '==', true)
            .limit(1)
            .get();
        if (snapshot.empty)
            return null;
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }
}
exports.FirestoreAlertRepository = FirestoreAlertRepository;
