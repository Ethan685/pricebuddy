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
exports.checkFraudRisk = exports.checkFraudList = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Checks for fraudulent activity based on user history and action.
 * Rules:
 * 1. New Account (< 7 days) requesting high amount -> Review
 * 2. High Velocity (> 3 calls in 24h) -> Reject
 * 3. Absurd Amount (> 1M KRW) -> Reject
 */
async function checkFraudList(userId, amount) {
    var _a, _b, _c;
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        return { riskScore: 100, decision: 'reject', reason: "User not found" };
    }
    const userData = userSnap.data();
    const now = admin.firestore.Timestamp.now();
    const createdAt = userData.createdAt || now;
    // Rule 1: New Account High Value
    const accountAgeDays = (now.toMillis() - createdAt.toMillis()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < 7 && amount > 50000) {
        return { riskScore: 70, decision: 'review', reason: "New account high withdrawal" };
    }
    // Rule 2: High Velocity (Check last 24h ledger entries)
    // DEBUG: Removed "type" filter to see if we satisfy ANY ledger entry
    const velocitySnap = await db.collection("cashback_ledger")
        .where("userId", "==", userId)
        .get();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // Filter for withdrawals manually
    const withdrawalDocs = velocitySnap.docs.filter(doc => doc.data().type === 'withdrawal');
    const recentWithdrawals = withdrawalDocs.filter(doc => {
        const data = doc.data();
        const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        return createdAt > yesterday;
    });
    const debugInfo = {
        totalLedger: velocitySnap.size,
        totalWithdrawals: withdrawalDocs.length,
        recent: recentWithdrawals.length,
        lastType: (_b = (_a = velocitySnap.docs[0]) === null || _a === void 0 ? void 0 : _a.data()) === null || _b === void 0 ? void 0 : _b.type,
        sampleDoc: (_c = velocitySnap.docs[0]) === null || _c === void 0 ? void 0 : _c.data()
    };
    try {
        const fs = require('fs');
        // Use hardcoded absolute path to avoid CWD issues
        const logPath = '/tmp/debug_fraud.log';
        fs.appendFileSync(logPath, JSON.stringify({ timestamp: new Date().toISOString(), userId, debugInfo }, null, 2) + '\n\n');
    }
    catch (e) {
        console.error("Failed to write debug log", e);
    }
    console.log(`[FRAUD] Debug:`, debugInfo);
    if (recentWithdrawals.length >= 3) {
        return {
            riskScore: 90,
            decision: 'reject',
            reason: "Velocity limit exceeded (3/24h)",
            velocityCount: recentWithdrawals.length,
            debug: debugInfo
        };
    }
    // Rule 3: Absurd Amount
    if (amount > 1000000) {
        return { riskScore: 95, decision: 'review', reason: "Large transaction requires manual approval", velocityCount: recentWithdrawals.length, debug: debugInfo };
    }
    return { riskScore: 10, decision: 'approve', velocityCount: recentWithdrawals.length, debug: debugInfo };
}
exports.checkFraudList = checkFraudList;
// Cloud Function wrapper (optional, for manual checks)
exports.checkFraudRisk = functions.https.onCall(async (data, context) => {
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError("permission-denied", "Admin only");
    }
    return checkFraudList(data.userId, data.amount);
});
//# sourceMappingURL=fraud.js.map