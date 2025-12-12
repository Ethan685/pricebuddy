import { Router } from "express";
import { firestore } from "../lib/firestore";

export const alertsRouter = Router();

/**
 * GET /alerts
 * 사용자의 모든 알림 조회
 */
alertsRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const snapshot = await firestore
      .collection("price_alerts")
      .where("userId", "==", userId)
      .where("isActive", "==", true)
      .get();

    const alerts = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ alerts });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /alerts
 * 새 가격 알림 생성
 */
alertsRouter.post("/", async (req, res, next) => {
  try {
    const { userId, productId, targetPrice, condition, currentPrice } = req.body;

    if (!userId || !productId || !targetPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const alert = {
      userId,
      productId,
      targetPrice: Number(targetPrice),
      currentPrice: Number(currentPrice || 0),
      condition: condition || "below",
      notificationEnabled: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await firestore.collection("price_alerts").add(alert);

    res.json({ id: docRef.id, ...alert });
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /alerts/:alertId
 * 알림 삭제 (비활성화)
 */
alertsRouter.delete("/:alertId", async (req, res, next) => {
  try {
    const { alertId } = req.params;

    await firestore.collection("price_alerts").doc(alertId).update({
      isActive: false,
      triggeredAt: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

