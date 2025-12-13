import { Router } from "express";
import { firestore } from "../lib/firestore";
import { pricingClient } from "../clients/pricing-client";
import type { Marketplace } from "@pricebuddy/core";

export const productDetailRouter = Router();

/**
 * GET /api/products/:productId
 */
productDetailRouter.get(
  "/:productId",
  async (req, res, next) => {
    try {
      const { productId } = req.params;

      const productSnap = await firestore
        .collection("products")
        .doc(productId)
        .get();

      if (!productSnap.exists) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product = productSnap.data();

      // 해당 product의 offers 가져오기
      const offersSnap = await firestore
        .collection("offers")
        .where("productId", "==", productId)
        .get();

      const offers = offersSnap.docs.map((d: any) => d.data());

      // 가격 엔진 재계산 (나라/선호 통화에 맞춰)
      // 쿼리 파라미터에서 country 가져오기, 없으면 기본값 KR
      const country = (req.query.country as string) || "KR";
      const pricedOffers = offers.map((o: any) =>
        pricingClient.compute(
          {
            marketplace: o.marketplace,
            country: o.country || country, // offer에 저장된 country 우선, 없으면 쿼리 파라미터 사용
            basePrice: o.basePrice,
            currency: o.currency,
            weightKg: o.weightKg || 1,
          },
          o // 원 offer merge
        )
      );

      // 가격 히스토리 가져오기
      const historySnap = await firestore
        .collection("price_history")
        .where("productId", "==", productId)
        .orderBy("timestamp", "desc")
        .limit(30)
        .get();

      const history = historySnap.docs.map((doc: any) => ({
        ts: doc.data().timestamp,
        totalPriceKrw: doc.data().priceKrw,
      }));

      // AI 신호 (간단한 로직 - 실제로는 별도 서비스)
      let aiSignal: { label: "BUY" | "WAIT"; confidence: number; reason: string } | null = null;
      if (history.length >= 7) {
        const recentPrices = history.slice(0, 7).map((h: any) => h.totalPriceKrw);
        const avgPrice = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length;
        const currentPrice = pricedOffers[0]?.totalPriceKrw || avgPrice;
        const priceChange = ((currentPrice - avgPrice) / avgPrice) * 100;

        if (priceChange < -10) {
          aiSignal = {
            label: "BUY",
            confidence: 0.85,
            reason: `최근 가격이 ${Math.abs(priceChange).toFixed(1)}% 하락했습니다. 구매 추천합니다.`,
          };
        } else if (priceChange > 5) {
          aiSignal = {
            label: "WAIT",
            confidence: 0.75,
            reason: `최근 가격이 ${priceChange.toFixed(1)}% 상승했습니다. 잠시 기다리는 것을 추천합니다.`,
          };
        }
      }

      res.json({ product, offers: pricedOffers, history, aiSignal });
    } catch (e) {
      next(e);
    }
  }
);

