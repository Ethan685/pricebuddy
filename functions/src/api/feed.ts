import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Product } from "../types";

import { GetFeedRequest, GetFeedResponse, ApiResponse } from "../types/api";
import { FirestoreFeedRepository } from "../infrastructure/firestore/FirestoreFeedRepository";
import { GetPersonalizedFeed } from "../domain/usecases/GetPersonalizedFeed";

export const getUserFeed = functions.https.onCall(async (data: GetFeedRequest, context): Promise<ApiResponse<GetFeedResponse>> => {
    functions.logger.info("Fetching user feed (Clean Arch)", data);

    try {
        const db = admin.firestore();
        const limit = data.limit || 12;

        // Dependency Injection (Manual for now)
        const feedRepository = new FirestoreFeedRepository();
        const getPersonalizedFeed = new GetPersonalizedFeed(feedRepository);

        let userPreferences = null;

        // 1. Get Preferences
        const personalized = !!context.auth;
        if (context.auth) {
            const uid = context.auth.uid;
            functions.logger.info(`Personalizing for user: ${uid}`);
            const userDoc = await db.collection("users").doc(uid).get();
            userPreferences = userDoc.data()?.preferences || null;
        }

        // 2. Execute Use Case
        const result = await getPersonalizedFeed.execute(userPreferences, limit);

        return {
            success: true,
            data: {
                products: result.products,
                personalized: result.personalized,
                timestamp: Date.now()
            }
        };

    } catch (error) {
        functions.logger.error("Feed fetch failed", error);
        throw new functions.https.HttpsError("internal", `Feed fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
});
