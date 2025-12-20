/**
 * Search API Route Handler
 */
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { Product } from "../types";

export async function searchProductsHandler(req: Request, res: Response) {
  try {
    // 개발 환경에서는 API 키 검증 우회
    const isDevelopment =
      process.env.FUNCTIONS_EMULATOR === "true" ||
      process.env.FIRESTORE_EMULATOR_HOST !== undefined ||
      !process.env.GCLOUD_PROJECT ||
      (req.headers.host && (req.headers.host.includes("localhost") || req.headers.host.includes("127.0.0.1")));

    if (!isDevelopment) {
      // 프로덕션에서는 API 키 검증 필요
      // TODO: API 키 검증 로직 추가
    }

    const qFromQuery = String(req.query?.q || req.query?.query || "").trim();
    let q = qFromQuery;

    if (!q && req.body) {
      q = String(req.body.q || req.body.query || "").trim();
    }

    if (!q) {
      res.status(400).json({ error: "Search query required" });
      return;
    }

    const region = String(req.query?.region || req.body?.region || "KR").trim();

    // 검색 로직 직접 구현
    const queryLower = q.toLowerCase();
    const db = admin.firestore(); // search는 이미 함수 내부에서 호출
    
    // 간단한 검색: 제목에 검색어가 포함된 상품 찾기
    // 프로덕션에서는 Algolia/Elasticsearch 등 사용 권장
    const allProducts = await db.collection("products").limit(100).get();
    
    const matchingDocs = allProducts.docs.filter((doc) => {
      const data = doc.data();
      const titleLower = (data.titleLower || data.title || "").toLowerCase();
      return titleLower.includes(queryLower);
    });

    const results: Product[] = matchingDocs.slice(0, 20).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Product));

    res.status(200).json({
      ok: true,
      q,
      region,
      results,
    });
  } catch (error: any) {
    console.error("Search API Error:", error);
    res.status(500).json({ error: "Search failed", detail: String(error?.message || error) });
  }
}
