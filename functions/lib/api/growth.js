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
exports.applyPromoCode = exports.generateReferralCode = void 0;
const functions = __importStar(require("firebase-functions"));
const FirestoreReferralRepository_1 = require("../infrastructure/growth/FirestoreReferralRepository");
const referralRepo = new FirestoreReferralRepository_1.FirestoreReferralRepository();
/**
 * Generate a referral code for the current user.
 * POST /api/growth/referral
 */
exports.generateReferralCode = functions.https.onCall(async (data, context) => {
    // 1. Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const userId = context.auth.uid;
    try {
        const code = await referralRepo.generateReferralCode(userId);
        const response = {
            success: true,
            data: { code }
        };
        return response;
    }
    catch (error) {
        console.error('Referral generation failed:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate code');
    }
});
const FirestorePromotionRepository_1 = require("../infrastructure/growth/FirestorePromotionRepository");
const promoRepo = new FirestorePromotionRepository_1.FirestorePromotionRepository();
/**
 * Apply a promotion code.
 * POST /api/growth/promo
 */
exports.applyPromoCode = functions.https.onCall(async (data, context) => {
    const { code, amount } = data;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    try {
        const promo = await promoRepo.applyPromotion(code, {
            userId: context.auth.uid,
            originalAmount: amount
        });
        if (!promo) {
            return { success: false, message: 'Invalid or expired code' };
        }
        return {
            success: true,
            data: promo
        };
    }
    catch (error) {
        console.error('Promo apply failed:', error);
        throw new functions.https.HttpsError('internal', 'Failed to apply promo');
    }
});
//# sourceMappingURL=growth.js.map