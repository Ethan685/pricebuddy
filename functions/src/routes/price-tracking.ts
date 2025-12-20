/**
 * Price Tracking API Route Handler
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
      if (process.env.NODE_ENV !== "production") {
        return (req.query.userId as string) || null;
      }
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      return (req.query.userId as string) || null;
    }
    return null;
  }
}

// 가격 히스토리 조회
export async function getPriceHistoryHandler(req: Request, res: Response) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const productId = req.params.productId || (req.query.productId as string);
    const merchantName = req.query.merchantName as string | undefined;
    const daysBack = Number(req.query.daysBack) || 30;

    if (!productId) {
      res.status(400).json({ error: "Product ID required" });
      return;
    }

    const db = getDb();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    let query = db
      .collection("products")
      .doc(productId)
      .collection("priceHistory")
      .where("recordedAt", ">=", admin.firestore.Timestamp.fromDate(cutoffDate))
      .orderBy("recordedAt", "desc");

    if (merchantName) {
      query = query.where("merchantName", "==", merchantName);
    }

    const snapshot = await query.limit(100).get();

    const history = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 통계 계산
    const prices = history.map((h: any) => h.price).filter((p: any) => typeof p === "number");
    const stats = {
      current: prices[0] || 0,
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
      average: prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0,
      dataPoints: history.length,
      isLowestEver: prices.length > 0 && prices[0] === Math.min(...prices),
      priceChange:
        prices.length > 1 ? ((prices[0] - prices[prices.length - 1]) / prices[prices.length - 1]) * 100 : 0,
    };

    const firstItem = history[0] as any;
    const lastUpdated = firstItem?.recordedAt || null;

    res.status(200).json({
      history,
      stats,
      daysBack,
      lastUpdated,
    });
  } catch (error: any) {
    console.error("Get Price History Error:", error);
    res.status(500).json({ error: "Failed to get price history", message: error.message });
  }
}

// 가격 스냅샷 기록
export async function recordPriceSnapshotHandler(req: Request, res: Response) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { productId, merchantName, price, currency, source = "api" } = req.body;

    if (!productId || !merchantName || !price) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const db = getDb();
    const productRef = db.collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // 가격 히스토리 추가
    await productRef.collection("priceHistory").add({
      price,
      currency: currency || "KRW",
      merchantName,
      recordedAt: admin.firestore.FieldValue.serverTimestamp(),
      verified: source === "api",
      source,
      product: {
        title: productDoc.data()?.title,
        id: productId,
      },
    });

    // 마지막 체크 시간 업데이트
    await productRef.update({
      lastPriceCheck: admin.firestore.FieldValue.serverTimestamp(),
      [`merchants.${merchantName}.lastUpdated`]: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, message: "Price snapshot recorded" });
  } catch (error: any) {
    console.error("Record Price Snapshot Error:", error);
    res.status(500).json({ error: "Failed to record price snapshot", message: error.message });
  }
}
