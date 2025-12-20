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
exports.validateApiKey = validateApiKey;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const crypto = __importStar(require("crypto"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
function normalizeApiKey(input) {
    return (input || "")
        .trim()
        .replace(/^Bearer\s+/i, "")
        .replace(/^"+|"+$/g, "")
        .replace(/^'+|'+$/g, "");
}
async function validateApiKey(apiKeyRaw) {
    try {
        const apiKey = normalizeApiKey(apiKeyRaw);
        if (!apiKey)
            return { valid: false };
        const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
        functions.logger.info("[APIKEY] FIRESTORE_EMULATOR_HOST", process.env.FIRESTORE_EMULATOR_HOST || "(not set)");
        functions.logger.info("[APIKEY] apiKey_head", apiKey.slice(0, 10));
        functions.logger.info("[APIKEY] hashedKey", hashedKey);
        const snap = await db
            .collection("api_keys")
            .where("hashedKey", "==", hashedKey)
            .where("active", "==", true)
            .limit(1)
            .get();
        if (snap.empty)
            return { valid: false };
        const doc = snap.docs[0];
        const data = doc.data();
        // usage stats best-effort (FieldValue import로 안정화)
        await doc.ref.set({
            lastUsed: firestore_1.FieldValue.serverTimestamp(),
            usageCount: firestore_1.FieldValue.increment(1),
        }, { merge: true });
        return { valid: true, userId: data.userId, keyId: doc.id };
    }
    catch (e) {
        functions.logger.error("[APIKEY] validation failed", e);
        return { valid: false };
    }
}
