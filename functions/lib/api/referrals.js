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
exports.redeemReferral = exports.createReferralCode = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Helper to generate random 6-char code
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
exports.createReferralCode = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const uid = context.auth.uid;
    // Check if exists
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists && ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.referralCode)) {
        return { code: (_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.referralCode };
    }
    // Generate unique code (simplified collision check)
    let code = generateCode();
    let collision = true;
    let attempts = 0;
    while (collision && attempts < 5) {
        const check = await db.collection('users').where('referralCode', '==', code).get();
        if (check.empty) {
            collision = false;
        }
        else {
            code = generateCode();
            attempts++;
        }
    }
    if (collision) {
        throw new functions.https.HttpsError('internal', 'Failed to generate unique code');
    }
    await db.collection('users').doc(uid).set({ referralCode: code }, { merge: true });
    return { code };
});
exports.redeemReferral = functions.https.onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const uid = context.auth.uid;
    const { code } = data;
    if (!code) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing referral code');
    }
    // Validate Code
    const referrerSnap = await db.collection('users').where('referralCode', '==', code).limit(1).get();
    if (referrerSnap.empty) {
        throw new functions.https.HttpsError('not-found', 'Invalid referral code');
    }
    const referrerDoc = referrerSnap.docs[0];
    const referrerId = referrerDoc.id;
    if (referrerId === uid) {
        throw new functions.https.HttpsError('invalid-argument', 'Cannot redeem your own code');
    }
    // Check if already redeemed
    const userDoc = await db.collection('users').doc(uid).get();
    if ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.redeemedReferral) {
        throw new functions.https.HttpsError('failed-precondition', 'Already redeemed a code');
    }
    try {
        await db.runTransaction(async (t) => {
            // Reward Referrer
            const referrerWalletRef = db.collection('cashback_wallet').doc(referrerId);
            t.set(referrerWalletRef, {
                balance: admin.firestore.FieldValue.increment(1000),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            // Reward Referee (User)
            const userWalletRef = db.collection('cashback_wallet').doc(uid);
            t.set(userWalletRef, {
                balance: admin.firestore.FieldValue.increment(1000),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            // Mark User as Redeemed
            t.set(db.collection('users').doc(uid), {
                redeemedReferral: true,
                redeemedCode: code
            }, { merge: true });
            // Log Transaction
            const ledgerRef = db.collection('cashback_ledger').doc();
            t.set(ledgerRef, {
                userId: referrerId,
                amount: 1000,
                type: 'referral_bonus',
                description: `Referral bonus for ${uid}`,
                status: 'paid',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            const ledgerRef2 = db.collection('cashback_ledger').doc();
            t.set(ledgerRef2, {
                userId: uid,
                amount: 1000,
                type: 'referral_bonus',
                description: `Referral bonus from ${code}`,
                status: 'paid',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        return { success: true, message: 'Referral redeemed! +1000 KRW' };
    }
    catch (error) {
        functions.logger.error("Redeem Referral failed", error);
        throw new functions.https.HttpsError('internal', 'Redemption failed');
    }
});
//# sourceMappingURL=referrals.js.map