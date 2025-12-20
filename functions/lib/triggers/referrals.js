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
exports.processReferral = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.processReferral = functions.firestore
    .document("users/{userId}")
    .onCreate(async (snap, context) => {
    const newUser = snap.data();
    const userId = context.params.userId;
    const db = admin.firestore();
    // 1. Generate Referral Code for New User
    // Simple logic: First 4 chars of name + random 4 digits
    const namePart = (newUser.displayName || "USER").replace(/\s/g, "").substring(0, 4).toUpperCase();
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const referralCode = `${namePart}${randomPart}`;
    await snap.ref.update({ referralCode });
    // 2. Check if they signed up with a referral code
    // (Assuming 'referredBy' field is set during sign-up if applicable)
    const referredByCode = newUser.referredBy;
    if (!referredByCode)
        return;
    try {
        // Find referrer
        const referrerSnap = await db.collection("users").where("referralCode", "==", referredByCode).limit(1).get();
        if (referrerSnap.empty)
            return;
        const referrerDoc = referrerSnap.docs[0];
        const referrerId = referrerDoc.id;
        const batch = db.batch();
        // Bonus for Referrer (5000 KRW)
        const referrerWalletRef = db.collection("cashback_wallet").doc(referrerId);
        batch.update(referrerWalletRef, {
            balance: admin.firestore.FieldValue.increment(5000),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        const referrerLedgerRef = db.collection("cashback_ledger").doc();
        batch.set(referrerLedgerRef, {
            userId: referrerId,
            amount: 5000,
            type: "referral_bonus",
            status: "completed",
            description: `Referral bonus for ${newUser.displayName || "New User"}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Bonus for New User (2000 KRW)
        const newUserWalletRef = db.collection("cashback_wallet").doc(userId);
        batch.update(newUserWalletRef, {
            balance: admin.firestore.FieldValue.increment(2000),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        const newUserLedgerRef = db.collection("cashback_ledger").doc();
        batch.set(newUserLedgerRef, {
            userId: userId,
            amount: 2000,
            type: "signup_bonus",
            status: "completed",
            description: "Welcome bonus",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
        functions.logger.info(`Referral processed: ${referrerId} referred ${userId}`);
    }
    catch (error) {
        functions.logger.error("Referral processing failed", error);
    }
});
