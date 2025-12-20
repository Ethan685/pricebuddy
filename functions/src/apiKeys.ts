import * as functions from "firebase-functions";
import * as crypto from "crypto";

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function ensureAdmin() {
  if (!getApps().length) {
    initializeApp();
  }
  return getFirestore();
}

function normalizeKey(raw: string): string {
  return (raw || "").trim();
}

/**
 * Generate a secure random API key
 */
function generateApiKey(): string {
  const prefix = "pk_live_";
  const randomBytes = crypto.randomBytes(32).toString("hex");
  return prefix + randomBytes;
}

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Create a new API key for Enterprise customers
 */
export const createApiKey = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const label = (data?.label || "").toString().trim();
  if (!label) {
    throw new functions.https.HttpsError("invalid-argument", "Label is required");
  }

  const db = ensureAdmin();

  // Role check - only Enterprise and Admin
  const userRef = db.collection("users").doc(context.auth.uid);
  const userSnap = await userRef.get();
  const userData = userSnap.data();

  if (userData?.role !== "enterprise" && userData?.role !== "admin") {
    throw new functions.https.HttpsError("permission-denied", "Enterprise plan required");
  }

  try {
    const apiKey = generateApiKey();
    const hashedKey = sha256Hex(apiKey);

    functions.logger.info("[APIKEY] project", process.env.GCLOUD_PROJECT);
    functions.logger.info("[APIKEY] FIRESTORE_EMULATOR_HOST", process.env.FIRESTORE_EMULATOR_HOST || "");
    functions.logger.info("[APIKEY] apiKey_head", apiKey.slice(0, 10));
    functions.logger.info("[APIKEY] hashedKey", hashedKey);

    const existing = await db
      .collection("api_keys")
      .where("hashedKey", "==", hashedKey)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new functions.https.HttpsError("already-exists", "API key collision. Try again.");
    }

    const keyData = {
      userId: context.auth.uid,
      label,
      hashedKey,
      createdAt: FieldValue.serverTimestamp(),
      lastUsed: null,
      usageCount: 0,
      active: true,
    };

    const keyRef = await db.collection("api_keys").add(keyData);

    functions.logger.info(`API Key created: ${keyRef.id} for user ${context.auth.uid}`);

    // Return the plain key ONLY ONCE (not stored)
    return {
      id: keyRef.id,
      key: apiKey,
      label,
      createdAt: new Date().toISOString(),
    };
  } catch (err: any) {
    functions.logger.error("Failed to create API key", err);
    throw new functions.https.HttpsError("internal", "Failed to create API key");
  }
});

/**
 * List all API keys for the current user (without showing the actual keys)
 */
export const listApiKeys = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const db = ensureAdmin();

  try {
    const keysSnap = await db
      .collection("api_keys")
      .where("userId", "==", context.auth.uid)
      .where("active", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    const keys = keysSnap.docs.map((doc) => {
      const d: any = doc.data();
      return {
        id: doc.id,
        label: d.label,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() || null,
        lastUsed: d.lastUsed?.toDate?.()?.toISOString?.() || "Never",
        usageCount: d.usageCount || 0,
        keyPreview: "pk_live_••••••" + doc.id.substring(0, 6),
      };
    });

    return { keys };
  } catch (err: any) {
    functions.logger.error("Failed to list API keys", err);
    throw new functions.https.HttpsError("internal", "Failed to list keys");
  }
});

/**
 * Revoke an API key (soft delete)
 */
export const revokeApiKey = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const keyId = (data?.keyId || "").toString().trim();
  if (!keyId) {
    throw new functions.https.HttpsError("invalid-argument", "Key ID required");
  }

  const db = ensureAdmin();

  try {
    const keyRef = db.collection("api_keys").doc(keyId);
    const keySnap = await keyRef.get();

    if (!keySnap.exists) {
      throw new functions.https.HttpsError("not-found", "API key not found");
    }

    const keyData: any = keySnap.data();
    if (keyData?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError("permission-denied", "Not your key");
    }

    await keyRef.set(
      {
        active: false,
        revokedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    functions.logger.info(`API Key revoked: ${keyId}`);
    return { success: true, message: "API key revoked" };
  } catch (err: any) {
    functions.logger.error("Failed to revoke API key", err);
    throw new functions.https.HttpsError("internal", "Failed to revoke key");
  }
});

/**
 * Validate an API key (used by REST API middleware)
 * - expects header "X-API-Key: <plain key>"
 */
export async function validateApiKey(
  apiKeyRaw: string
): Promise<{ valid: boolean; userId?: string; keyId?: string; label?: string }> {
  try {
    const apiKey = normalizeKey(apiKeyRaw);
    if (!apiKey || apiKey.length < 16) return { valid: false };

    const db = ensureAdmin();
    const hashedKey = sha256Hex(apiKey);

    functions.logger.info("[APIKEY] FIRESTORE_EMULATOR_HOST", process.env.FIRESTORE_EMULATOR_HOST || "");
    functions.logger.info("[APIKEY] apiKey_head", apiKey.slice(0, 10));
    functions.logger.info("[APIKEY] hashedKey", hashedKey);

    const keysSnap = await db
      .collection("api_keys")
      .where("hashedKey", "==", hashedKey)
      .where("active", "==", true)
      .limit(1)
      .get();

    if (keysSnap.empty) return { valid: false };

    const keyDoc = keysSnap.docs[0];
    const keyData: any = keyDoc.data();

    // best-effort usage stats
    await keyDoc.ref.set(
      {
        lastUsed: FieldValue.serverTimestamp(),
        usageCount: FieldValue.increment(1),
      },
      { merge: true }
    );

    return {
      valid: true,
      userId: keyData.userId,
      keyId: keyDoc.id,
      label: keyData.label,
    };
  } catch (err: any) {
    functions.logger.error("[APIKEY] validation failed", err);
    return { valid: false };
  }
}
