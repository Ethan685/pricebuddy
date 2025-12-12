import { Router } from "express";
import { firestore } from "../lib/firestore";

export const purchasesRouter = Router();

/**
 * GET /purchases
 * 사용자 구매 히스토리 조회
 */
purchasesRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const snapshot = await firestore
      .collection("purchases")
      .where("userId", "==", userId)
      .orderBy("purchasedAt", "desc")
      .limit(limit)
      .get();

    const purchases = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 통계 계산
    const totalSaved = purchases.reduce(
      (sum, p: any) => sum + (p.savedAmount || 0),
      0
    );
    const totalExpected = purchases.reduce(
      (sum, p: any) => sum + (p.expectedPrice || 0),
      0
    );

    res.json({
      purchases,
      stats: {
        totalCount: purchases.length,
        totalSaved,
        averageSavingsRate:
          totalExpected > 0 ? (totalSaved / totalExpected) * 100 : 0,
      },
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /purchases
 * 새 구매 기록 저장
 */
purchasesRouter.post("/", async (req, res, next) => {
  try {
    const {
      userId,
      productId,
      productTitle,
      purchasePrice,
      expectedPrice,
      marketplace,
    } = req.body;

    if (!userId || !productId || !purchasePrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const savedAmount = (expectedPrice || purchasePrice) - purchasePrice;

    const purchase = {
      userId,
      productId,
      productTitle: productTitle || "",
      purchasePrice: Number(purchasePrice),
      expectedPrice: Number(expectedPrice || purchasePrice),
      savedAmount,
      marketplace: marketplace || "",
      purchasedAt: new Date().toISOString(),
    };

    const docRef = await firestore.collection("purchases").add(purchase);

    res.json({ id: docRef.id, ...purchase });
  } catch (e) {
    next(e);
  }
});

