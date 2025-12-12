import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export const firebase = admin;

