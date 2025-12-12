import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const logEvent = functions.https.onCall(async (data, context) => {
    const { eventName, params } = data;
    const uid = context.auth?.uid || "anonymous";

    functions.logger.info(`[Telemetry] ${eventName}`, { uid, ...params });

    try {
        await db.collection("telemetry").add({
            eventName,
            params: params || {},
            uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            userAgent: context.rawRequest.headers["user-agent"] || "unknown"
        });
        return { success: true };
    } catch (error) {
        functions.logger.error("Telemetry logging failed", error);
        // We don't want to crash the client for logging errors
        return { success: false };
    }
});
