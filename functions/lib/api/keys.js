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
exports.revokeApiKey = exports.listApiKeys = exports.createApiKey = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
// Create new API Key
exports.createApiKey = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    const { label } = data;
    const uid = context.auth.uid;
    // RBAC Check
    const userSnap = await db.collection('users').doc(uid).get();
    if (userSnap.data()?.role !== 'enterprise' && userSnap.data()?.role !== 'admin') {
        throw new functions.https.HttpsError("permission-denied", "Enterprise plan required.");
    }
    // Generate Key (Simple SHA/Random for demo)
    const key = `pb_live_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    // Store
    const newKeyRef = await db.collection('api_keys').add({
        userId: uid,
        key: key,
        label: label || 'Default Key',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        lastUsed: null
    });
    return { id: newKeyRef.id, key, label };
});
// List API Keys
exports.listApiKeys = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    const uid = context.auth.uid;
    const snap = await db.collection('api_keys')
        .where('userId', '==', uid)
        .where('active', '==', true)
        .orderBy('createdAt', 'desc')
        .get();
    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
});
exports.revokeApiKey = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "Auth required");
    const { id } = data;
    // Ensure ownership
    const docRef = db.collection('api_keys').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.userId !== context.auth.uid) {
        throw new functions.https.HttpsError("permission-denied", "Not allowed");
    }
    await docRef.update({ active: false });
    return { success: true };
});
