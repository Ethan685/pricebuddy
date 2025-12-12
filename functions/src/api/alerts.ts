import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { CreatePriceAlertRequest, CreatePriceAlertResponse, ApiResponse } from "../types/api";
import { FirestoreAlertRepository } from "../infrastructure/firestore/FirestoreAlertRepository";
import { ManageAlerts } from "../domain/usecases/ManageAlerts";

export const createPriceAlert = functions.https.onCall(async (data: CreatePriceAlertRequest, context): Promise<ApiResponse<CreatePriceAlertResponse>> => {
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
        const alertRepository = new FirestoreAlertRepository();
        const manageAlerts = new ManageAlerts(alertRepository);

        // 2. Execute Use Case
        const result = await manageAlerts.createAlert(
            uid,
            productId,
            targetPrice,
            currentPrice || 0,
            email || (context.auth.token.email as string)
        );

        return {
            success: true,
            data: {
                alertId: result.alertId,
                status: result.status as "active" | "cancelled" | "triggered", // Explicit cast to match API type
                message: result.message
            }
        };

    } catch (error) {
        functions.logger.error("Create Alert Error", error);
        throw new functions.https.HttpsError("internal", "Failed to set alert");
    }
});

export const getMyAlerts = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }

    try {
        const alertRepository = new FirestoreAlertRepository();
        const manageAlerts = new ManageAlerts(alertRepository);

        const alerts = await manageAlerts.getMyAlerts(context.auth.uid);

        return { alerts };
    } catch (error) {
        functions.logger.error("Get Alerts Error", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch alerts");
    }
});
