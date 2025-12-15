import * as functions from "firebase-functions";
import type { FirebaseFirestore } from "firebase-admin";
import { firestore } from "@pricebuddy/infra/firestore";
import { logger } from "@pricebuddy/infra/logger";
import { sendEmail, createPriceAlertEmail } from "./email";
import { sendPushNotification } from "./fcm";

/**
 * 가격 알림 모니터링 스케줄러
 * 매 시간마다 실행되어 가격 변동을 확인하고 알림 발송
 */
export const checkPriceAlerts = functions
  .region("asia-northeast3")
  .pubsub.schedule("every 1 hours")
  .onRun(async (context) => {
    logger.info("Starting price alert check");

    try {
      // 활성 알림 조회
      const alertsSnap = await firestore
        .collection("price_alerts")
        .where("isActive", "==", true)
        .where("notificationEnabled", "==", true)
        .get();

      const alerts = alertsSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      }));

      logger.info(`Found ${alerts.length} active alerts`);

      for (const alert of alerts) {
        try {
          // 상품의 최신 가격 조회
          const offersSnap = await firestore
            .collection("offers")
            .where("productId", "==", alert.productId)
            .orderBy("totalPriceKrw", "asc")
            .limit(1)
            .get();

          if (offersSnap.empty) continue;

          const bestOffer = offersSnap.docs[0].data();
          const currentPrice = bestOffer.totalPriceKrw;

          // 알림 조건 확인
          let shouldNotify = false;
          if (alert.condition === "below" && currentPrice <= alert.targetPrice) {
            shouldNotify = true;
          } else if (
            alert.condition === "above" &&
            currentPrice >= alert.targetPrice
          ) {
            shouldNotify = true;
          } else if (
            alert.condition === "change" &&
            Math.abs(currentPrice - alert.currentPrice) / alert.currentPrice >
              0.05
          ) {
            // 5% 이상 변동
            shouldNotify = true;
          }

          if (shouldNotify) {
            // 알림 발송
            await sendPriceAlert(alert, currentPrice, bestOffer);
            
            // 알림 비활성화
            await firestore.collection("price_alerts").doc(alert.id).update({
              isActive: false,
              triggeredAt: new Date().toISOString(),
              currentPrice,
            });
          }
        } catch (error) {
          logger.error(`Error processing alert ${alert.id}:`, error);
        }
      }

      logger.info("Price alert check completed");
    } catch (error) {
      logger.error("Error in price alert check:", error);
      throw error;
    }
  });

async function sendPriceAlert(
  alert: any,
  currentPrice: number,
  offer: any
) {
  // 사용자 정보 조회
  const userDoc = await firestore.collection("users").doc(alert.userId).get();
  if (!userDoc.exists) return;

  const user = userDoc.data();
  const email = user?.email;

  if (!email) return;

  // 상품 정보 조회
  const productDoc = await firestore
    .collection("products")
    .doc(alert.productId)
    .get();
  const product = productDoc.data();

  const productUrl = `${process.env.WEB_APP_URL || "https://pricebuddy.com"}/products/${alert.productId}`;

  // 이메일 발송
  const emailMessage = createPriceAlertEmail(
    product?.title || "상품",
    alert.targetPrice,
    currentPrice,
    productUrl
  );
  emailMessage.to = email;

  const sent = await sendEmail(emailMessage);

  logger.info(`Price alert sent to ${email}`, {
    productId: alert.productId,
    targetPrice: alert.targetPrice,
    currentPrice,
    emailSent: sent,
  });

  // 푸시 알림도 발송 (FCM)
  if (user?.fcmToken) {
    const pushSent = await sendPushNotification(
      user.fcmToken,
      "🎉 가격 알림",
      `${product?.title || "상품"}이 목표 가격에 도달했습니다!`,
      {
        productId: alert.productId,
        currentPrice: currentPrice.toString(),
        url: productUrl,
      }
    );
    logger.info(`FCM push notification sent: ${pushSent}`);
  }
}

