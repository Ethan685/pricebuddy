/**
 * Firebase Cloud Messaging (FCM) 푸시 알림
 */

import * as admin from "firebase-admin";

/**
 * FCM 푸시 알림 발송
 */
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    if (!admin.apps.length) {
      // Firebase Admin 초기화 (이미 초기화되어 있으면 스킵)
      return false;
    }

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: "high",
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("FCM message sent:", response);
    return true;
  } catch (error) {
    console.error("FCM error:", error);
    return false;
  }
}

/**
 * 여러 기기에 푸시 알림 발송
 */
export async function sendMulticastPushNotification(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<admin.messaging.BatchResponse> {
  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin not initialized");
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: "high",
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return response;
  } catch (error) {
    console.error("FCM multicast error:", error);
    throw error;
  }
}

