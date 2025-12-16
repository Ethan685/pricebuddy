import admin from "firebase-admin";

let _app: admin.app.App | null = null;

export function getAdminApp() {
  if (_app) return _app;

  if (!admin.apps.length) {
    admin.initializeApp();
  }
  _app = admin.app();
  return _app;
}

export function getFirestore() {
  getAdminApp();
  return admin.firestore();
}
