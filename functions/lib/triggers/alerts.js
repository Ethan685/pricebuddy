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
exports.checkPriceAlerts = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.checkPriceAlerts = functions.firestore
    .document("products/{productId}")
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const productId = context.params.productId;
    // Only check if price has changed and decreased
    if (newData.minPrice >= previousData.minPrice) {
        return;
    }
    const currentPrice = newData.minPrice;
    functions.logger.info(`Price dropped for ${productId}: ${previousData.minPrice} -> ${currentPrice}`);
    const db = admin.firestore();
    try {
        // Find active alerts for this product where targetPrice >= currentPrice
        const alertsSnap = await db.collection("alerts")
            .where("productId", "==", productId)
            .where("isActive", "==", true)
            .where("targetPrice", ">=", currentPrice)
            .get();
        if (alertsSnap.empty) {
            return;
        }
        const batch = db.batch();
        const notifications = [];
        for (const doc of alertsSnap.docs) {
            const alert = doc.data();
            // Create Notification (Mock FCM)
            // In real app: admin.messaging().send(...)
            const notification = {
                userId: alert.userId,
                title: "Price Drop Alert!",
                body: `${newData.title} is now ${currentPrice} ${newData.currency}!`,
                data: { productId: productId },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false
            };
            // Add to user's notification collection
            const notifRef = db.collection("users").doc(alert.userId).collection("notifications").doc();
            batch.set(notifRef, notification);
            // Mark alert as triggered (optional, or keep active for further drops)
            // batch.update(doc.ref, { lastTriggered: admin.firestore.FieldValue.serverTimestamp() });
            notifications.push(notification);
        }
        await batch.commit();
        functions.logger.info(`Sent ${notifications.length} alerts for ${productId}`);
    }
    catch (error) {
        functions.logger.error("Error processing alerts", error);
    }
});
//# sourceMappingURL=alerts.js.map