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
exports.trackPackage = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Track a package using a carrier and tracking number.
 * Pro+ Feature Only.
 */
exports.trackPackage = functions.https.onCall(async (data, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
    }
    const userId = context.auth.uid;
    const db = admin.firestore();
    // 2. Pro+ Permission Check
    const userDoc = await db.collection("users").doc(userId).get();
    const role = userDoc.data()?.role;
    // Allow 'admin' to test as well
    if (role !== 'pro_plus' && role !== 'admin') {
        throw new functions.https.HttpsError("permission-denied", "This feature is available for Pro+ users only.");
    }
    const { carrier, trackingNumber } = data;
    if (!carrier || !trackingNumber) {
        throw new functions.https.HttpsError("invalid-argument", "Carrier and Tracking Number are required.");
    }
    // 3. Mock Tracking Logic (Simulating Ship24 / AfterShip)
    // In production, fetch(https://api.ship24.com/public/v1/trackers...)
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));
    // Determinstic mock based on tracking number length
    const statusOpts = ['In_Transit', 'Out_for_Delivery', 'Delivered', 'Exception'];
    const status = statusOpts[trackingNumber.length % 4];
    return {
        carrier,
        trackingNumber,
        status: status,
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
        events: [
            {
                status: 'Sorted at Facility',
                location: 'Incheon Terminal',
                timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
            },
            {
                status: 'Picked up by Courier',
                location: 'Seoul Gangnam',
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
            }
        ]
    };
});
