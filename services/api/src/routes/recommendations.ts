import { Router } from "express";
import { firestore } from "../lib/firestore";

export const recommendationsRouter = Router();

/**
 * GET /recommendations
 * AI 기반 개인화 추천
 */
recommendationsRouter.get("/", async (req, res, next) => {
  try {
    const userId = req.query.userId as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // 사용자 위시리스트 조회
    const wishlistSnap = await firestore
      .collection("wishlist")
      .where("userId", "==", userId)
      .get();

    // 사용자 구매 히스토리 조회
    const purchasesSnap = await firestore
      .collection("purchases")
      .where("userId", "==", userId)
      .limit(10)
      .get();

    // 간단한 추천 로직 (실제로는 ML 모델 사용)
    // 1. 위시리스트 상품과 유사한 상품 찾기
    // 2. 구매 패턴 기반 추천
    // 3. 인기 상품 추천

    const recommendations = [
      {
        productId: "1",
        title: "Apple iPhone 17 Pro 256GB",
        reason: "최근 관심 상품과 유사하며, 현재 최저가 구간입니다.",
        confidence: 0.85,
        minPrice: 1590000,
      },
    ];

    res.json({ recommendations: recommendations.slice(0, limit) });
  } catch (e) {
    next(e);
  }
});

