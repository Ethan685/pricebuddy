import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const toggleWishlist = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const uid = context.auth.uid;
    const { productId, productData } = data; // productData needed for minimal display info

    const wishRef = db.collection('users').doc(uid).collection('wishlist').doc(productId);
    const docSnap = await wishRef.get();

    if (docSnap.exists) {
        // Remove
        await wishRef.delete();
        return { added: false, message: "Removed from wishlist" };
    } else {
        // Add
        await wishRef.set({
            ...productData,
            addedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { added: true, message: "Added to wishlist" };
    }
});

export const getWishlist = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const uid = context.auth.uid;

    const snap = await db.collection('users').doc(uid).collection('wishlist').orderBy('addedAt', 'desc').get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return { items };
});
