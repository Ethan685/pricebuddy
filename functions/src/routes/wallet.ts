/**
 * Wallet API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";

function getDb() {
  return admin.firestore();
}

// 인증 미들웨어
async function getUserId(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // 개발 환경에서는 query parameter 허용
      if (process.env.NODE_ENV !== "production") {
        return (req.query.userId as string) || null;
      }
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    // 개발 환경에서는 query parameter 허용
    if (process.env.NODE_ENV !== "production") {
      return (req.query.userId as string) || null;
    }
    return null;
  }
}

// 지갑 잔액 조회
export async function getWalletBalanceHandler(req: Request, res: Response) {
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

    const db = getDb();
    const walletDoc = await db.collection("cashback_wallet").doc(userId).get();

    if (!walletDoc.exists) {
      res.status(200).json({ balance: 0, pending: 0, currency: "KRW" });
      return;
    }

    const walletData = walletDoc.data();
    res.status(200).json({
      balance: walletData?.balance || 0,
      pending: walletData?.pending || 0,
      currency: walletData?.currency || "KRW",
    });
  } catch (error: any) {
    console.error("Get Wallet Balance Error:", error);
    res.status(500).json({ error: "Failed to fetch wallet balance", message: error.message });
  }
}

// 거래 내역 조회
export async function getWalletTransactionsHandler(req: Request, res: Response) {
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

    const limit = Number(req.query.limit) || 50;
    const db = getDb();
    const transactionsSnap = await db
      .collection("cashback_ledger")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const transactions = transactionsSnap.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString();

      return {
        id: doc.id,
        type: data.type || "unknown",
        amount: data.amount || 0,
        description: data.description || "",
        status: data.status || "completed",
        createdAt: createdAt,
        balanceAfter: data.balanceAfter || 0,
      };
    });

    res.status(200).json({ transactions });
  } catch (error: any) {
    console.error("Get Wallet Transactions Error:", error);
    res.status(500).json({ error: "Failed to fetch transactions", message: error.message });
  }
}

// 지갑 전체 정보 (잔액 + 거래 내역)
export async function getWalletHandler(req: Request, res: Response) {
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

    const limit = Number(req.query.limit) || 50;

    const db = getDb();
    
    // 잔액 조회
    const walletDoc = await db.collection("cashback_wallet").doc(userId).get();
    const balance = walletDoc.exists ? walletDoc.data()?.balance || 0 : 0;
    const pending = walletDoc.exists ? walletDoc.data()?.pending || 0 : 0;

    // 거래 내역 조회
    const transactionsSnap = await db
      .collection("cashback_ledger")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const transactions = transactionsSnap.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString();

      return {
        id: doc.id,
        type: data.type || "unknown",
        amount: data.amount || 0,
        description: data.description || "",
        status: data.status || "completed",
        createdAt: createdAt,
        balanceAfter: data.balanceAfter || 0,
      };
    });

    res.status(200).json({
      balance,
      pending,
      currency: "KRW",
      transactions,
    });
  } catch (error: any) {
    console.error("Get Wallet Error:", error);
    res.status(500).json({ error: "Failed to fetch wallet data", message: error.message });
  }
}
