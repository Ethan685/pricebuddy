import { Router } from "express";
import { firestore } from "../lib/firestore";
import { pricingClient } from "../clients/pricing-client";
import { getDailyHistory } from "../repositories/getHistory";
import type { Marketplace, ProductDetailResponse, ProductDTO, OfferDTO, PriceHistoryPointDTO, AISignalDTO } from "@pricebuddy/core";

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

      const productData = productSnap.data();
      if (!productData) {
        return res.status(404).json({ error: "Product data not found" });
      }

      const product: ProductDTO = {
        id: productId,
        title: productData.title ?? "",
        brand: productData.brand,
        imageUrl: productData.imageUrl,
        categoryPath: productData.categoryPath ?? [],
        attributes: productData.attributes ?? {},
      };

      // 해당 product의 offers 가져오기
      const offersSnap = await firestore
        .collection("offers")
        .where("productId", "==", productId)
        .get();

      // 가격 엔진 재계산 (나라/선호 통화에 맞춰)
      const country = (req.query.country as string) || "KR";
      const offers: OfferDTO[] = offersSnap.docs.map((doc) => {
        const o = doc.data();
        const marketplace = o.marketplace as Marketplace;
        const computed = pricingClient.compute(
          {
            marketplace,
            country: o.country || country,
            basePrice: o.basePrice ?? 0,
            currency: o.currency ?? "KRW",
            weightKg: o.weightKg ?? 1,
          },
          o
        );

        return {
          id: doc.id,
          productId: o.productId ?? productId,
          marketplace,
          url: o.url ?? "",
          externalId: o.externalId ?? "",
          basePrice: o.basePrice ?? 0,
          currency: (o.currency ?? "KRW") as "KRW" | "USD" | "JPY" | "EUR",
          itemPriceKrw: computed.itemPriceKrw ?? 0,
          shippingFeeKrw: computed.shippingFeeKrw ?? 0,
          taxFeeKrw: computed.taxFeeKrw ?? 0,
          totalPriceKrw: computed.totalPriceKrw ?? 0,
          lastFetchedAt: o.lastFetchedAt ?? new Date().toISOString(),
        };
      });

      // 가격 히스토리 가져오기 (새로운 구조: price_history_daily)
      // 각 offer의 히스토리를 가져와서 병합
      let historyDaily: PriceHistoryPointDTO[] = [];
      
      if (offers.length > 0) {
        // 첫 번째 offer의 히스토리 사용 (또는 모든 offer의 히스토리 병합 가능)
        const firstOfferId = offers[0].id;
        try {
          historyDaily = await getDailyHistory(firstOfferId, 30);
        } catch (e) {
          console.warn(`Failed to fetch history for offer ${firstOfferId}:`, e);
          // Fallback: 기존 price_history 컬렉션 사용
          const historySnap = await firestore
            .collection("price_history")
            .where("productId", "==", productId)
            .orderBy("timestamp", "desc")
            .limit(30)
            .get()
            .catch(() => null);
          
          if (historySnap) {
            historyDaily = historySnap.docs.map((doc) => {
              const data = doc.data();
              return {
                ts: data.timestamp ?? new Date().toISOString(),
                totalPriceKrw: data.priceKrw ?? 0,
              };
            });
          }
        }
      }

      // AI 신호 (간단한 로직 - 실제로는 별도 서비스)
      let aiSignal: AISignalDTO | undefined = undefined;
      if (historyDaily.length >= 7) {
        const recentPrices = historyDaily.slice(0, 7).map((h) => h.totalPriceKrw);
        const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
        const currentPrice = offers[0]?.totalPriceKrw || avgPrice;
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
        } else {
          aiSignal = {
            label: "NEUTRAL",
            confidence: 0.5,
            reason: "가격 변동이 크지 않습니다.",
          };
        }
      }

      const payload: ProductDetailResponse = {
        product,
        offers,
        historyDaily: historyDaily.length > 0 ? historyDaily : undefined,
        aiSignal,
      };

      res.json(payload);
    } catch (e) {
      next(e);
    }
  }
);

