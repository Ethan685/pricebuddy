import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Create new API Key
export const createApiKey = functions.https.onCall(async (data, context) => {
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
export const listApiKeys = functions.https.onCall(async (data, context) => {
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

export const revokeApiKey = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required");
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
