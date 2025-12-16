import admin from "firebase-admin";

export async function initFirebaseAdmin() {
  if (admin.apps.length) return admin.app();
  admin.initializeApp();
  return admin.app();
}
