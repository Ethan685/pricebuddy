/**
 * Enterprise API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { validateApiKey } from "../api/apikeys";

function getDb() {
  return admin.firestore();
}

// Enterprise API 핸들러
export async function enterpriseApiHandler(req: Request, res: Response) {
  try {
    // API 키 검증
    const apiKey = (req.headers["x-api-key"] as string) || (req.query.api_key as string);

    if (!apiKey) {
      res.status(401).json({ error: "Missing API Key" });
      return;
    }

    const validation = await validateApiKey(apiKey);
    if (!validation.valid) {
      res.status(403).json({ error: "Invalid API Key" });
      return;
    }

    // 사용자 역할 확인
    const db = getDb();
    const userDoc = await db.collection("users").doc(validation.userId || "").get();
    const user = userDoc.data();

    if (user?.role !== "enterprise") {
      res.status(403).json({ error: "Enterprise plan required" });
      return;
    }

    // 요청 처리
    const path = req.path.replace("/enterprise", "") || "/";
    
    if (req.method === "GET" && (path === "/products" || path.startsWith("/products"))) {
      const limit = Number(req.query.limit) || 50;
      const productsSnap = await db.collection("products").limit(limit).get();
      const products = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({ data: products });
    } else if (req.method === "GET" && (path === "/bulk" || path.startsWith("/bulk"))) {
      // 대량 모니터링 엔드포인트
      const limit = Number(req.query.limit) || 100;
      const productsSnap = await db.collection("products").limit(limit).get();
      const products = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({ data: products, count: products.length });
    } else {
      res.status(404).json({ error: "Not Found" });
    }
  } catch (error: any) {
    console.error("Enterprise API Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
