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
exports.createUserProfile = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
    var _a, _b;
    const db = admin.firestore();
    // Fraud ML Mock
    let fraudScore = Math.floor(Math.random() * 10); // Base low risk
    if (((_a = user.email) === null || _a === void 0 ? void 0 : _a.includes('spam')) || ((_b = user.email) === null || _b === void 0 ? void 0 : _b.includes('test'))) {
        fraudScore = 95; // High risk mock
    }
    const userProfile = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: fraudScore > 80 ? "flagged" : "user",
        fraudScore,
        preferences: {
            currency: "KRW",
            notifications: true
        },
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase() // Simple random code
    };
    const wallet = {
        balance: 0,
        pending: 0,
        currency: "KRW",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    try {
        // Create User Profile
        await db.collection("users").doc(user.uid).set(userProfile);
        // Create Cashback Wallet
        await db.collection("cashback_wallet").doc(user.uid).set(wallet);
        functions.logger.info(`User profile created for ${user.uid}`);
    }
    catch (error) {
        functions.logger.error(`Error creating profile for ${user.uid}`, error);
    }
});
//# sourceMappingURL=auth.js.map