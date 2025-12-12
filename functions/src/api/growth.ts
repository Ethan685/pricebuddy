import * as functions from 'firebase-functions';
import { FirestoreReferralRepository } from '../infrastructure/growth/FirestoreReferralRepository';
import { ApiResponse } from '../types/api';

const referralRepo = new FirestoreReferralRepository();

/**
 * Generate a referral code for the current user.
 * POST /api/growth/referral
 */
export const generateReferralCode = functions.https.onCall(async (data, context) => {
    // 1. Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const userId = context.auth.uid;

    try {
        const code = await referralRepo.generateReferralCode(userId);

        const response: ApiResponse<{ code: string }> = {
            success: true,
            data: { code }
        };
        return response;

    } catch (error) {
        console.error('Referral generation failed:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate code');
    }
});

import { FirestorePromotionRepository } from '../infrastructure/growth/FirestorePromotionRepository';

const promoRepo = new FirestorePromotionRepository();

/**
 * Apply a promotion code.
 * POST /api/growth/promo
 */
export const applyPromoCode = functions.https.onCall(async (data, context) => {
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
    } catch (error) {
        console.error('Promo apply failed:', error);
        throw new functions.https.HttpsError('internal', 'Failed to apply promo');
    }
});

