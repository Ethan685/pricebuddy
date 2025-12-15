import admin from "firebase-admin";

function ensureApp() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin.app();
}

export const firestore = (() => {
  ensureApp();
  return admin.firestore();
})();
