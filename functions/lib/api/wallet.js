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
exports.getCurrentLimits = exports.simulateCashbackEarned = exports.requestWithdrawalV2 = exports.getWalletBalance = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.getWalletBalance = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    const userId = context.auth.uid;
    const db = admin.firestore();
    try {
        const walletDoc = await db.collection("cashback_wallet").doc(userId).get();
        if (!walletDoc.exists) {
            return { balance: 0, pending: 0, currency: "KRW" };
        }
        return walletDoc.data();
    }
    catch (error) {
        functions.logger.error("Get Wallet failed", error);
        throw new functions.https.HttpsError("internal", "Failed to get wallet");
    }
});
const checkFraudList = async (userId, amount) => {
    const db = admin.firestore();
    // const userRef = db.collection("users").doc(userId);
    // const userSnap = await userRef.get(); // Unused for now
    // Default to strict if user not found, but for now just approve to pass this check
    // if (!userSnap.exists) { ... } 
    // Query all ledger entries for this user
    const velocitySnap = await db.collection("cashback_ledger")
        .where("userId", "==", userId)
        .get();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const withdrawalDocs = velocitySnap.docs.filter(doc => doc.data().type === 'withdrawal');
    const recentWithdrawals = withdrawalDocs.filter(doc => {
        const data = doc.data();
        const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        return createdAt > yesterday;
    });
    // Calculate total amount withdrawn in last 24h
    const totalWithdrawn = recentWithdrawals.reduce((sum, doc) => {
        return sum + Math.abs(doc.data().amount);
    }, 0);
    const debugInfo = {
        totalLedger: velocitySnap.size,
        totalWithdrawals: withdrawalDocs.length,
        recent24h: recentWithdrawals.length,
        totalWithdrawn24h: totalWithdrawn,
        currentAmount: amount,
        from_inlined: true
    };
    // Log to file for debugging
    try {
        const fs = require('fs');
        fs.appendFileSync('/tmp/debug_fraud_inlined.log', JSON.stringify({ userId, debugInfo }, null, 2) + '\n');
    }
    catch (e) { }
    // Rule 1: Single transaction limit (100,000 KRW requires manual review)
    if (amount > 100000) {
        return {
            decision: 'review',
            reason: "High-value withdrawal requires manual review (>100,000 KRW)",
            debug: debugInfo
        };
    }
    // Rule 2: Daily withdrawal count limit (10 withdrawals per 24h)
    if (recentWithdrawals.length >= 10) {
        return {
            decision: 'reject',
            reason: "Daily withdrawal limit exceeded (10 withdrawals/24h)",
            debug: debugInfo
        };
    }
    // Rule 3: Daily total amount limit (500,000 KRW per 24h)
    if (totalWithdrawn + amount > 500000) {
        return {
            decision: 'reject',
            reason: `Daily amount limit exceeded (${Math.floor(totalWithdrawn + amount).toLocaleString()} / 500,000 KRW)`,
            debug: debugInfo
        };
    }
    return { decision: 'approve', debug: debugInfo };
};
exports.requestWithdrawalV2 = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    const userId = context.auth.uid;
    const amount = data.amount;
    if (!amount || amount < 10000) { // Min withdrawal 10,000 KRW
        throw new functions.https.HttpsError("invalid-argument", "Minimum withdrawal is 10,000 KRW");
    }
    const db = admin.firestore();
    try {
        let fraudResult = { decision: 'approve' };
        // 0. Pre-calculation (Read only) - Run this BEFORE transaction to avoid "cant read after write" issues or complexity
        // Also simpler for debugging
        fraudResult = await checkFraudList(userId, amount);
        if (fraudResult.decision === 'reject') {
            throw new functions.https.HttpsError("resource-exhausted", `Withdrawal rejected: ${fraudResult.reason}`);
        }
        await db.runTransaction(async (t) => {
            const walletRef = db.collection("cashback_wallet").doc(userId);
            const walletDoc = await t.get(walletRef);
            if (!walletDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Wallet not found");
            }
            const wallet = walletDoc.data();
            if (wallet.balance < amount) {
                throw new functions.https.HttpsError("failed-precondition", "Insufficient balance");
            }
            const status = fraudResult.decision === 'review' ? 'pending_review' : 'pending';
            // Deduct balance
            const currentBalance = wallet.balance;
            const newBalance = currentBalance - amount;
            t.update(walletRef, {
                balance: newBalance,
                updatedAt: new Date()
            });
            // Create Ledger Entry
            const ledgerRef = db.collection("cashback_ledger").doc();
            t.set(ledgerRef, {
                userId: userId,
                amount: -amount,
                type: "withdrawal",
                status: status,
                balanceAfter: newBalance,
                referenceId: ledgerRef.id,
                description: "Withdrawal Request",
                createdAt: new Date()
            });
        });
        return { success: true, message: "Withdrawal requested", debug: fraudResult.debug };
    }
    catch (error) {
        functions.logger.error("Withdrawal failed", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Withdrawal failed");
    }
});
exports.simulateCashbackEarned = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    const userId = context.auth.uid;
    const amount = 5000; // Fixed simulation amount
    const db = admin.firestore();
    try {
        await db.runTransaction(async (t) => {
            var _a;
            const walletRef = db.collection("cashback_wallet").doc(userId);
            const walletDoc = await t.get(walletRef);
            let currentBalance = 0;
            if (!walletDoc.exists) {
                currentBalance = 0;
                t.set(walletRef, {
                    balance: amount,
                    currency: "KRW",
                    pending: 0,
                    updatedAt: new Date()
                });
            }
            else {
                currentBalance = ((_a = walletDoc.data()) === null || _a === void 0 ? void 0 : _a.balance) || 0;
                t.update(walletRef, {
                    balance: currentBalance + amount,
                    updatedAt: new Date()
                });
            }
            const newBalance = currentBalance + amount;
            // Create Ledger Entry
            const ledgerRef = db.collection("cashback_ledger").doc();
            t.set(ledgerRef, {
                userId: userId,
                amount: amount,
                type: "earned",
                source: "simulation",
                description: "Test Cashback Earned",
                balanceAfter: newBalance,
                referenceId: ledgerRef.id,
                createdAt: new Date()
            });
        });
        return { success: true, message: `Simulated earning ${amount} KRW` };
    }
    catch (error) {
        functions.logger.error("Simulation failed", error);
        throw new functions.https.HttpsError("internal", `Simulation failed: ${error.message || error}`);
    }
});
// Get current limits without making a withdrawal
exports.getCurrentLimits = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    const userId = context.auth.uid;
    const db = admin.firestore();
    try {
        // Use the same logic as checkFraudList
        const velocitySnap = await db.collection("cashback_ledger")
            .where("userId", "==", userId)
            .get();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const withdrawalDocs = velocitySnap.docs.filter(doc => doc.data().type === 'withdrawal');
        const recentWithdrawals = withdrawalDocs.filter(doc => {
            const data = doc.data();
            const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            return createdAt > yesterday;
        });
        const totalWithdrawn = recentWithdrawals.reduce((sum, doc) => {
            return sum + Math.abs(doc.data().amount);
        }, 0);
        return {
            withdrawals: recentWithdrawals.length,
            maxWithdrawals: 10,
            totalAmount: totalWithdrawn,
            maxAmount: 500000
        };
    }
    catch (error) {
        functions.logger.error("Get limits failed", error);
        throw new functions.https.HttpsError("internal", "Failed to get limits");
    }
});
//# sourceMappingURL=wallet.js.map