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
exports.checkBadges = exports.predictEngagement = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.predictEngagement = functions.https.onCall(async (data, context) => {
    // Mock Engagement ML (v4.6 Growth Loop)
    // Predicts "Churn Risk" and recommends "Retention Action"
    // In real world, this would use BigQuery ML or TensorFlow
    const uid = context.auth?.uid;
    if (!uid)
        return { error: "Auth required" };
    // 1. Fetch user activity stats (Simulated)
    // const lastLogin = new Date(); // Mock "Just now"
    const sessionCount = Math.floor(Math.random() * 50);
    // 2. Calculate Score (Mock Logic)
    let churnRisk = 0.1; // Low risk default
    let action = "none";
    if (sessionCount < 5) {
        churnRisk = 0.8;
        action = "send_welcome_email";
    }
    else if (sessionCount > 20) {
        churnRisk = 0.05;
        action = "push_pro_upgrade";
    }
    // 3. Log Prediction
    await db.collection("telemetry").add({
        type: "engagement_prediction",
        uid,
        churnRisk,
        recommendedAction: action,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return {
        uid,
        churnRisk, // 0.0 to 1.0
        segment: churnRisk > 0.5 ? "at_risk" : "loyal",
        recommendedAction: action
    };
});
exports.checkBadges = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    const uid = context.auth.uid;
    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};
    const existingBadges = userData.badges || [];
    const newBadges = [...existingBadges];
    // Mock Stats (In real app, query aggregated stats)
    // const loginCount = userData.stats?.loginCount || 0;
    // const alertCount = userData.stats?.alertCount || 0;
    // const referralCount = userData.stats?.referralCount || 0;
    // For demo, we grant badges randomly or based on role
    if (userData.role === 'pro' || userData.role === 'pro_plus') {
        if (!newBadges.includes('vip_member'))
            newBadges.push('vip_member');
    }
    if (userData.redeemedReferral) {
        if (!newBadges.includes('community_builder'))
            newBadges.push('community_builder');
    }
    // Always grant 'early_adopter' for beta users
    if (!newBadges.includes('early_adopter'))
        newBadges.push('early_adopter');
    if (newBadges.length > existingBadges.length) {
        await userRef.update({ badges: newBadges });
        return { newBadges, message: "New badges unlocked!" };
    }
    return { newBadges, message: "No new badges." };
});
