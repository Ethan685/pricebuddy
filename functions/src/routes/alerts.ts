/**
 * Alerts API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { FirestoreAlertRepository } from "../infrastructure/firestore/FirestoreAlertRepository";
import { ManageAlerts } from "../domain/usecases/ManageAlerts";

function getDb() {
  return admin.firestore();
}

// 인증 미들웨어 (Firebase Auth 토큰에서 사용자 ID 추출)
async function getUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

// 가격 알림 생성
export async function createAlertHandler(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const userId = await getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { productId, targetPrice, currentPrice, email } = req.body;

    if (!productId || !targetPrice) {
      res.status(400).json({ error: "Missing productId or targetPrice" });
      return;
    }

    const alertRepository = new FirestoreAlertRepository();
    const manageAlerts = new ManageAlerts(alertRepository);

    const result = await manageAlerts.createAlert(
      userId,
      productId,
      targetPrice,
      currentPrice || 0,
      email || ""
    );

    res.status(200).json({
      success: true,
      data: {
        alertId: result.alertId,
        status: result.status,
        message: result.message,
      },
    });
  } catch (error: any) {
    console.error("Create Alert Error:", error);
    res.status(500).json({ error: "Failed to create alert", message: error.message });
  }
}

// 내 알림 목록 조회
export async function getAlertsHandler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const userId = await getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const alertRepository = new FirestoreAlertRepository();
    const manageAlerts = new ManageAlerts(alertRepository);

    const alerts = await manageAlerts.getMyAlerts(userId);

    res.status(200).json({ alerts });
  } catch (error: any) {
    console.error("Get Alerts Error:", error);
    res.status(500).json({ error: "Failed to fetch alerts", message: error.message });
  }
}

// 알림 삭제
export async function deleteAlertHandler(req: Request, res: Response) {
  try {
    if (req.method !== "DELETE") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const userId = await getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const alertId = req.params.alertId;
    if (!alertId) {
      res.status(400).json({ error: "Alert ID required" });
      return;
    }

    const alertRepository = new FirestoreAlertRepository();
    const manageAlerts = new ManageAlerts(alertRepository);

    // 알림 삭제는 Firestore에서 직접 처리
    const db = getDb();
    const alertRef = db.collection("alerts").doc(alertId);
    const alertDoc = await alertRef.get();

    if (!alertDoc.exists) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }

    const alertData = alertDoc.data();
    if (alertData?.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await alertRef.update({ status: "cancelled" });

    res.status(200).json({ success: true, message: "Alert deleted" });
  } catch (error: any) {
    console.error("Delete Alert Error:", error);
    res.status(500).json({ error: "Failed to delete alert", message: error.message });
  }
}
