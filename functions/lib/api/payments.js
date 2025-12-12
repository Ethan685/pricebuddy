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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPortalSession = exports.handleStripeWebhook = exports.createCheckoutSession = exports.processWithdrawal = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
// Admin only function to approve withdrawals
exports.processWithdrawal = functions.https.onCall(async (data, context) => {
    var _a;
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    const db = admin.firestore();
    // 2. Admin Role Check
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    if (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        throw new functions.https.HttpsError("permission-denied", "Admin only");
    }
    const withdrawalId = data.withdrawalId;
    const action = data.action; // 'approve' or 'reject'
    try {
        await db.runTransaction(async (t) => {
            const ledgerRef = db.collection("cashback_ledger").doc(withdrawalId);
            const ledgerDoc = await t.get(ledgerRef);
            if (!ledgerDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Withdrawal request not found");
            }
            const entry = ledgerDoc.data();
            if (entry.status !== "pending") {
                throw new functions.https.HttpsError("failed-precondition", "Request already processed");
            }
            if (action === "approve") {
                // Mock Payment Gateway Call
                // await portone.transfer({ amount: -entry.amount, account: entry.bankAccount });
                t.update(ledgerRef, {
                    status: "paid",
                    processedAt: admin.firestore.FieldValue.serverTimestamp(),
                    processedBy: context.auth.uid
                });
            }
            else if (action === "reject") {
                // Refund the wallet
                const walletRef = db.collection("cashback_wallet").doc(entry.userId);
                t.update(walletRef, {
                    balance: admin.firestore.FieldValue.increment(-entry.amount),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                t.update(ledgerRef, {
                    status: "rejected",
                    processedAt: admin.firestore.FieldValue.serverTimestamp(),
                    processedBy: context.auth.uid
                });
            }
        });
        return { success: true };
    }
    catch (error) {
        functions.logger.error("Withdrawal processing failed", error);
        throw new functions.https.HttpsError("internal", "Processing failed");
    }
});
// NEW: Real Stripe Checkout Session
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2022-11-15', // TypeScript strictness workaround
});
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to upgrade");
    }
    const { planId } = data; // 'pro' or 'pro_plus'
    if (!planId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing planId");
    }
    const uid = context.auth.uid;
    const email = context.auth.token.email;
    // Price Mapping (Test Mode IDs - Replace with Env Vars in prod)
    const prices = {
        'pro': process.env.STRIPE_PRICE_PRO || 'price_123_pro_test',
        'pro_plus': process.env.STRIPE_PRICE_PRO_PLUS || 'price_456_pro_plus',
        'enterprise': process.env.STRIPE_PRICE_ENTERPRISE || 'price_789_ent_test'
    };
    const priceId = prices[planId];
    if (!priceId) {
        throw new functions.https.HttpsError("not-found", "Invalid Plan ID");
    }
    try {
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                    price: priceId,
                    quantity: 1,
                }],
            customer_email: email,
            client_reference_id: uid,
            metadata: {
                firebaseUID: uid,
                planId: planId
            },
            success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/pricing`,
        });
        return { success: true, url: session.url };
    }
    catch (error) {
        functions.logger.error("Stripe Session failed", error);
        throw new functions.https.HttpsError("internal", "Checkout create failed");
    }
});
// NEW: Stripe Webhook Handler
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';
    let event;
    try {
        // Verify signature
        // In Cloud Functions, req.rawBody is available
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
        functions.logger.error("Webhook Signature Error", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle Events
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const uid = session.client_reference_id;
        const planId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.planId;
        if (uid && planId) {
            await admin.firestore().collection("users").doc(uid).set({
                role: planId,
                planUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
                subscriptionId: session.subscription
            }, { merge: true });
            functions.logger.info(`User ${uid} upgraded to ${planId} via Webhook`);
        }
    }
    res.json({ received: true });
});
// NEW: Create Stripe Customer Portal Session
exports.createPortalSession = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    const uid = context.auth.uid;
    const db = admin.firestore();
    try {
        // 2. Get user data to retrieve stripeCustomerId
        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();
        let customerId = userData === null || userData === void 0 ? void 0 : userData.stripeCustomerId;
        // 3. If no customer ID, create one
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: context.auth.token.email,
                metadata: {
                    firebaseUID: uid
                }
            });
            customerId = customer.id;
            // Save customer ID to Firestore
            await db.collection("users").doc(uid).update({
                stripeCustomerId: customerId
            });
        }
        // 4. Create billing portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `http://localhost:5174/profile`,
        });
        return { success: true, url: session.url };
    }
    catch (error) {
        functions.logger.error("Portal Session failed", error);
        throw new functions.https.HttpsError("internal", "Portal session creation failed");
    }
});
//# sourceMappingURL=payments.js.map