import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const checkPriceAlerts = functions.firestore
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

        } catch (error) {
            functions.logger.error("Error processing alerts", error);
        }
    });
