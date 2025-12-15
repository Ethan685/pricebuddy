import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const firestore = admin.firestore();
export const db = firestore;
export const FieldValue = admin.firestore.FieldValue;

export default firestore;
