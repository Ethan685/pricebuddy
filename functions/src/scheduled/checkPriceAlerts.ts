import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { sendEmail, sendPushNotification } from "../lib/notifications";

// Check price alerts every hour
export const checkPriceAlerts = functions.pubsub
    .schedule("every 1 hours")
    .timeZone("Asia/Seoul")
    .onRun(async (context) => {
        const db = admin.firestore();
        functions.logger.info("Starting scheduled price alert check...");

        try {
            // 1. Get all active alerts
            // In a large scale system, we would need to paginate or shard this.
            // For now, we assume < 1000 active alerts for MVP.
            const alertsSnap = await db.collection("price_alerts")
                .where("isActive", "==", true)
                .get();

            if (alertsSnap.empty) {
                functions.logger.info("No active alerts found.");
                return null;
            }

            functions.logger.info(`Found ${alertsSnap.size} active alerts.`);

            // Group alerts by productId to minimize product fetches
            const alertsByProduct: Record<string, any[]> = {};
            alertsSnap.forEach(doc => {
                const data = doc.data();
                if (!alertsByProduct[data.productId]) {
                    alertsByProduct[data.productId] = [];
                }
                alertsByProduct[data.productId].push({ id: doc.id, ...data });
            });

            const productIds = Object.keys(alertsByProduct);
            let notificationsSent = 0;

            // Process each product
            for (const productId of productIds) {
                const productDoc = await db.collection("products").doc(productId).get();
                if (!productDoc.exists) continue;

                const product = productDoc.data();
                const currentPrice = product?.minPriceKrw || product?.minPrice || 0;

                if (currentPrice === 0) continue;

                // Check each alert for this product
                for (const alert of alertsByProduct[productId]) {
                    // Check if conditions are met
                    // Condition: BELOW
                    if (alert.condition === "BELOW" || alert.condition === "below") { // Handle legacy string
                        if (currentPrice > alert.targetPrice) continue;
                    }
                    // Condition: ABOVE (rare but possible)
                    else if (alert.condition === "ABOVE" || alert.condition === "above") {
                        if (currentPrice < alert.targetPrice) continue;
                    }
                    else {
                        // Default to BELOW if undefined
                        if (currentPrice > alert.targetPrice) continue;
                    }

                    // Check spam prevention (don't notify if notified in last 24h for same price?)
                    // For now, simple check: if lastNotifiedAt is less than 24h ago, skip
                    if (alert.lastNotifiedAt) {
                        const lastNotified = new Date(alert.lastNotifiedAt);
                        const now = new Date();
                        const diffHours = (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60);
                        if (diffHours < 24) continue;
                    }

                    // Send Notification
                    const userDoc = await db.collection("users").doc(alert.userId).get();
                    if (!userDoc.exists) continue;
                    const user = userDoc.data();

                    const productTitle = product?.title || "상품";
                    const notificationTitle = "📉 가격 도달 알림";
                    const notificationBody = `찜하신 ${productTitle} 가격이 목표가 ${alert.targetPrice.toLocaleString()}원에 도달했습니다! (현재: ${currentPrice.toLocaleString()}원)`;
                    const url = `${process.env.WEB_APP_URL || "https://pricebuddy-5a869.web.app"}/products/${productId}`;

                    // 1. In-app Notification
                    await db.collection("users").doc(alert.userId).collection("notifications").add({
                        title: notificationTitle,
                        body: notificationBody,
                        type: "price_alert",
                        productId,
                        currentPrice,
                        targetPrice: alert.targetPrice,
                        read: false,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        data: { url }
                    });

                    // 2. Email
                    if (user?.email) {
                        await sendEmail(
                            user.email,
                            notificationTitle,
                            `<p>${notificationBody}</p><p><a href="${url}">상품 보러가기</a></p>`
                        );
                    }

                    // 3. Push
                    if (user?.fcmToken) {
                        await sendPushNotification(user.fcmToken, {
                            title: notificationTitle,
                            body: notificationBody,
                            url
                        });
                    }

                    // Update Alert
                    await db.collection("price_alerts").doc(alert.id).update({
                        lastNotifiedAt: new Date().toISOString(),
                        triggeredAt: new Date().toISOString(),
                        currentPrice: currentPrice // Update cached price in alert
                    });

                    notificationsSent++;
                }
            }

            functions.logger.info(`Scheduled check complete. Sent ${notificationsSent} notifications.`);
            return null;

        } catch (error) {
            functions.logger.error("Error in checkPriceAlerts", error);
            return null;
        }
    });
