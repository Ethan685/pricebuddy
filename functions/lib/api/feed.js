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
exports.getUserFeed = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const FirestoreFeedRepository_1 = require("../infrastructure/firestore/FirestoreFeedRepository");
const GetPersonalizedFeed_1 = require("../domain/usecases/GetPersonalizedFeed");
exports.getUserFeed = functions.https.onCall(async (data, context) => {
    functions.logger.info("Fetching user feed (Clean Arch)", data);
    try {
        const db = admin.firestore();
        const limit = data.limit || 12;
        // Dependency Injection (Manual for now)
        const feedRepository = new FirestoreFeedRepository_1.FirestoreFeedRepository();
        const getPersonalizedFeed = new GetPersonalizedFeed_1.GetPersonalizedFeed(feedRepository);
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
    }
    catch (error) {
        functions.logger.error("Feed fetch failed", error);
        throw new functions.https.HttpsError("internal", `Feed fetch failed: ${error instanceof Error ? error.message : String(error)}`);
    }
});
