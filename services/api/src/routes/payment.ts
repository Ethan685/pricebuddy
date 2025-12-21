import { Router } from "express";
import { firestore } from "../lib/firestore";
import {
  requestSubscriptionPayment,
  verifyPayment,
} from "../lib/payment";

export const paymentRouter = Router();

/**
 * POST /payment/subscribe
 * 구독 결제 요청
 */
paymentRouter.post("/subscribe", async (req, res, next) => {
  try {
    const { userId, planId, amount, currency, customerEmail, customerName } =
      req.body;

    if (!userId || !planId || !amount || !customerEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentResult = await requestSubscriptionPayment({
      userId,
      planId,
      amount: Number(amount),
      currency: currency || "KRW",
      customerEmail,
      customerName,
    });

    if (!paymentResult.success) {
      return res.status(400).json({ error: paymentResult.error });
    }

    // 결제 정보 저장
    await firestore.collection("payments").add({
      userId,
      planId,
      amount: Number(amount),
      currency: currency || "KRW",
      paymentId: paymentResult.paymentId,
      transactionId: paymentResult.transactionId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      paymentId: paymentResult.paymentId,
      transactionId: paymentResult.transactionId,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /payment/verify
 * 결제 확인
 */
paymentRouter.post("/verify", async (req, res, next) => {
  try {
    const { paymentId, transactionId } = req.body;

    if (!paymentId || !transactionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isValid = await verifyPayment(paymentId, transactionId);

    if (isValid) {
      // 결제 정보 업데이트
      const paymentQuery = await firestore
        .collection("payments")
        .where("paymentId", "==", paymentId)
        .limit(1)
        .get();

      if (!paymentQuery.empty) {
        const paymentDoc = paymentQuery.docs[0];
        const paymentData = paymentDoc.data();

        await paymentDoc.ref.update({
          status: "completed",
          verifiedAt: new Date().toISOString(),
        });

        // 사용자 구독 정보 업데이트
        await firestore.collection("users").doc(paymentData.userId).update({
          subscriptionPlan: paymentData.planId,
          subscriptionTier: "premium",
          subscriptionStatus: "active",
          subscriptionStartedAt: new Date().toISOString(),
        });
      }
    }

    res.json({ success: isValid });
  } catch (e) {
    next(e);
  }
});

