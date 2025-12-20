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
/**
 * 가격 변동 알림 트리거
 * products 컬렉션의 문서가 업데이트될 때 실행되어 가격 하락 알림 발송
 */
exports.checkPriceAlerts = functions
    .region("asia-northeast3")
    .firestore
    .document("products/{productId}")
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const productId = context.params.productId;
    // 가격이 변경되지 않았거나 상승한 경우 무시
    const newMinPrice = newData.minPriceKrw || newData.minPrice || 0;
    const oldMinPrice = previousData.minPriceKrw || previousData.minPrice || 0;
    if (newMinPrice >= oldMinPrice || newMinPrice === 0) {
        return;
    }
    const currentPrice = newMinPrice;
    functions.logger.info(`Price dropped for ${productId}: ${oldMinPrice} -> ${currentPrice}`);
    const db = admin.firestore();
    try {
        // 활성화된 가격 알림 조회 (price_alerts 컬렉션 사용)
        const alertsSnap = await db.collection("price_alerts")
            .where("productId", "==", productId)
            .where("isActive", "==", true)
            .where("targetPrice", ">=", currentPrice)
            .get();
        if (alertsSnap.empty) {
            functions.logger.info(`No active alerts for product ${productId}`);
            return;
        }
        const batch = db.batch();
        const notifications = [];
        for (const doc of alertsSnap.docs) {
            const alert = doc.data();
            // 사용자 정보 조회
            const userDoc = await db.collection("users").doc(alert.userId).get();
            if (!userDoc.exists)
                continue;
            const user = userDoc.data();
            const productTitle = newData.title || "상품";
            // 인앱 알림 생성
            const notification = {
                userId: alert.userId,
                title: "🎉 가격 하락 알림",
                body: `${productTitle}의 가격이 ${currentPrice.toLocaleString()}원으로 하락했습니다!`,
                type: "price_drop",
                productId: productId,
                currentPrice: currentPrice,
                targetPrice: alert.targetPrice,
                data: {
                    productId: productId,
                    url: `${process.env.WEB_APP_URL || "https://pricebuddy-5a869.web.app"}/products/${productId}`
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false
            };
            // 사용자의 알림 컬렉션에 추가
            const notifRef = db.collection("users").doc(alert.userId).collection("notifications").doc();
            batch.set(notifRef, notification);
            // 알림을 트리거된 것으로 표시 (선택사항: 계속 활성화 유지 가능)
            batch.update(doc.ref, {
                lastTriggered: admin.firestore.FieldValue.serverTimestamp(),
                triggeredPrice: currentPrice
            });
            notifications.push(notification);
            // 이메일 알림 발송 (사용자 이메일이 있는 경우)
            if (user?.email) {
                try {
                    // TODO: 실제 이메일 발송 로직 구현
                    functions.logger.info(`Would send email to ${user.email} for product ${productId}`);
                }
                catch (emailError) {
                    functions.logger.error(`Failed to send email to ${user.email}:`, emailError);
                }
            }
            // FCM 푸시 알림 발송 (FCM 토큰이 있는 경우)
            if (user?.fcmToken) {
                try {
                    const messaging = admin.messaging();
                    await messaging.send({
                        token: user.fcmToken,
                        notification: {
                            title: "🎉 가격 하락 알림",
                            body: `${productTitle}의 가격이 ${currentPrice.toLocaleString()}원으로 하락했습니다!`,
                        },
                        data: {
                            productId: productId,
                            type: "price_drop",
                            url: `${process.env.WEB_APP_URL || "https://pricebuddy-5a869.web.app"}/products/${productId}`
                        },
                        webpush: {
                            fcmOptions: {
                                link: `${process.env.WEB_APP_URL || "https://pricebuddy-5a869.web.app"}/products/${productId}`
                            }
                        }
                    });
                    functions.logger.info(`FCM push sent to user ${alert.userId}`);
                }
                catch (fcmError) {
                    functions.logger.error(`Failed to send FCM to user ${alert.userId}:`, fcmError);
                }
            }
        }
        await batch.commit();
        functions.logger.info(`Sent ${notifications.length} alerts for product ${productId}`);
    }
    catch (error) {
        functions.logger.error("Error processing alerts", error);
    }
});
