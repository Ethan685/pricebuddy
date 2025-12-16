import admin from "firebase-admin";

let app: admin.app.App | null = null;

function ensureApp() {
  if (app) return;
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  app = admin.app();
}

ensureApp();

export const firestore = admin.firestore();
