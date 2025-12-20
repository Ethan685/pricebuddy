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
exports.getMyAlerts = exports.createPriceAlert = void 0;
const functions = __importStar(require("firebase-functions"));
const FirestoreAlertRepository_1 = require("../infrastructure/firestore/FirestoreAlertRepository");
const ManageAlerts_1 = require("../domain/usecases/ManageAlerts");
exports.createPriceAlert = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to set alerts");
    }
    const { productId, targetPrice, currentPrice, email } = data;
    if (!productId || !targetPrice) {
        throw new functions.https.HttpsError("invalid-argument", "Missing productId or targetPrice");
    }
    const uid = context.auth.uid;
    try {
        // Dependency Injection
        const alertRepository = new FirestoreAlertRepository_1.FirestoreAlertRepository();
        const manageAlerts = new ManageAlerts_1.ManageAlerts(alertRepository);
        // 2. Execute Use Case
        const result = await manageAlerts.createAlert(uid, productId, targetPrice, currentPrice || 0, email || context.auth.token.email);
        return {
            success: true,
            data: {
                alertId: result.alertId,
                status: result.status, // Explicit cast to match API type
                message: result.message
            }
        };
    }
    catch (error) {
        functions.logger.error("Create Alert Error", error);
        throw new functions.https.HttpsError("internal", "Failed to set alert");
    }
});
exports.getMyAlerts = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    try {
        const alertRepository = new FirestoreAlertRepository_1.FirestoreAlertRepository();
        const manageAlerts = new ManageAlerts_1.ManageAlerts(alertRepository);
        const alerts = await manageAlerts.getMyAlerts(context.auth.uid);
        return { alerts };
    }
    catch (error) {
        functions.logger.error("Get Alerts Error", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch alerts");
    }
});
