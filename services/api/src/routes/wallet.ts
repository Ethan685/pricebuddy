import { Router } from "express";
import { firestore } from "../lib/firestore";
import type { WalletTransactionType } from "@pricebuddy/core";

export const walletRouter = Router();

/**
 * GET /wallet/balance
 * 사용자 잔고 조회 (ledger에서 계산)
 */
walletRouter.get("/balance", async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Ledger에서 모든 트랜잭션 합계
    const ledgerSnap = await firestore
      .collection("wallet_ledger")
      .where("userId", "==", userId)
      .where("status", "==", "completed")
      .get();

    const balance = ledgerSnap.docs.reduce((sum: number, doc: any) => {
      const data = doc.data();
      return sum + (data.amount || 0);
    }, 0);

    res.json({ userId, balance });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /wallet/transactions
 * 사용자 트랜잭션 히스토리
 */
walletRouter.get("/transactions", async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const snapshot = await firestore
      .collection("wallet_ledger")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const transactions = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ transactions });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /wallet/transactions
 * 새 트랜잭션 생성 (캐시백, 추천인 보너스 등)
 */
walletRouter.post("/transactions", async (req, res, next) => {
  try {
    const {
      userId,
      type,
      amount,
      description,
      relatedOrderId,
      relatedProductId,
    } = req.body;

    if (!userId || !type || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transaction = {
      userId,
      type: type as WalletTransactionType,
      amount: Number(amount),
      description: description || "",
      relatedOrderId,
      relatedProductId,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };

    const docRef = await firestore.collection("wallet_ledger").add(transaction);

    res.json({ id: docRef.id, ...transaction });
  } catch (e) {
    next(e);
  }
});

