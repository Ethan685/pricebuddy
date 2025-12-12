import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const createUserProfile = functions.auth.user().onCreate(async (user) => {
    const db = admin.firestore();

    // Fraud ML Mock
    let fraudScore = Math.floor(Math.random() * 10); // Base low risk
    if (user.email?.includes('spam') || user.email?.includes('test')) {
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
    } catch (error) {
        functions.logger.error(`Error creating profile for ${user.uid}`, error);
    }
});
