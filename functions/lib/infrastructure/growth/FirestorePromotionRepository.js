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
exports.FirestorePromotionRepository = void 0;
const admin = __importStar(require("firebase-admin"));
class FirestorePromotionRepository {
    constructor() {
        this.db = admin.firestore();
        this.collection = this.db.collection('promotions');
    }
    async getActivePromotions() {
        const now = admin.firestore.Timestamp.now();
        const snapshot = await this.collection
            .where('isActive', '==', true)
            .where('endDate', '>=', now)
            .get();
        return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
    }
    async applyPromotion(code, context) {
        const snapshot = await this.collection.where('code', '==', code).limit(1).get();
        if (snapshot.empty)
            return null;
        const promo = Object.assign({ id: snapshot.docs[0].id }, snapshot.docs[0].data());
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
exports.FirestorePromotionRepository = FirestorePromotionRepository;
//# sourceMappingURL=FirestorePromotionRepository.js.map