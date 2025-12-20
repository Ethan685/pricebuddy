import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import * as crypto from "crypto";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

function normalizeApiKey(input: string): string {
  return (input || "")
    .trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "");
}

export async function validateApiKey(
  apiKeyRaw: string
): Promise<{ valid: boolean; userId?: string; keyId?: string }> {
  try {
    const apiKey = normalizeApiKey(apiKeyRaw);
    if (!apiKey) return { valid: false };

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

    if (snap.empty) return { valid: false };

    const doc = snap.docs[0];
    const data = doc.data() as any;

    // usage stats best-effort (FieldValue import로 안정화)
    await doc.ref.set(
      {
        lastUsed: FieldValue.serverTimestamp(),
        usageCount: FieldValue.increment(1),
      },
      { merge: true }
    );

    return { valid: true, userId: data.userId, keyId: doc.id };
  } catch (e) {
    functions.logger.error("[APIKEY] validation failed", e as any);
    return { valid: false };
  }
}
