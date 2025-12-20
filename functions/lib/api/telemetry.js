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
exports.logEvent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.logEvent = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        functions.logger.error("Telemetry logging failed", error);
        // We don't want to crash the client for logging errors
        return { success: false };
    }
});
