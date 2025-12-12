import { Router } from "express";
import { firestore } from "../lib/firestore";
import { scraperClient } from "../clients/scraper-client";
import { pricingClient } from "../clients/pricing-client";

export const priceTrackingRouter = Router();

/**
 * POST /price-tracking/track
 * 상품 URL을 받아서 가격을 추적 시작
 */
priceTrackingRouter.post("/track", async (req, res, next) => {
  try {
    const { url, marketplace, productId } = req.body;

    if (!url || !marketplace) {
      return res.status(400).json({ error: "Missing url or marketplace" });
    }

    // 스크래퍼로 현재 가격 가져오기
    const scraped = await scraperClient.scrapeSingle(marketplace, url);

    // 가격 계산
    const basePrice = scraped.price || scraped.basePrice || 0;
    const priced = await pricingClient.compute(
      {
        marketplace,
        country: "KR",
        basePrice,
        currency: scraped.currency,
        weightKg: scraped.weightKg || 1,
      },
      {} // offer merge
    );

    // Offer 저장 또는 업데이트
    let offerId: string;
    const existingOffer = await firestore
      .collection("offers")
      .where("productId", "==", productId || "")
      .where("marketplace", "==", marketplace)
      .where("externalId", "==", scraped.externalId || "")
      .limit(1)
      .get();

    if (!existingOffer.empty) {
      // 기존 offer 업데이트
      offerId = existingOffer.docs[0].id;
      const oldData = existingOffer.docs[0].data();
      
      // 가격 히스토리에 저장 (가격이 변경된 경우)
      if (oldData.totalPriceKrw !== priced.totalPriceKrw) {
        await firestore
          .collection("price_history")
          .doc(offerId)
          .collection("history")
          .add({
            priceKrw: oldData.totalPriceKrw,
            timestamp: oldData.lastFetchedAt || new Date().toISOString(),
          });
      }

      const basePriceForUpdate = scraped.price || scraped.basePrice || oldData.basePrice || 0;
      await firestore.collection("offers").doc(offerId).update({
        basePrice: basePriceForUpdate,
        currency: scraped.currency || oldData.currency,
        shippingFee: scraped.shippingFee || oldData.shippingFee || 0,
        totalPriceKrw: priced.totalPriceKrw,
        lastFetchedAt: new Date().toISOString(),
      });
    } else {
      // 새 offer 생성
      const basePrice = scraped.price || scraped.basePrice || 0;
      const newOffer = {
        productId: productId || "",
        marketplace,
        externalId: scraped.externalId || scraped.title || "",
        url,
        basePrice,
        currency: scraped.currency,
        shippingFee: scraped.shippingFee || 0,
        totalPriceKrw: priced.totalPriceKrw,
        lastFetchedAt: new Date().toISOString(),
      };

      const docRef = await firestore.collection("offers").add(newOffer);
      offerId = docRef.id;

      // 초기 가격 히스토리 저장
      await firestore
        .collection("price_history")
        .doc(offerId)
        .collection("history")
        .add({
          priceKrw: priced.totalPriceKrw,
          timestamp: new Date().toISOString(),
          productId: productId || "",
        });
    }

    res.json({
      success: true,
      offerId,
      price: priced.totalPriceKrw,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /price-tracking/history/:offerId
 * 특정 offer의 가격 히스토리 조회
 */
priceTrackingRouter.get("/history/:offerId", async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;

    const historySnap = await firestore
      .collection("price_history")
      .doc(offerId)
      .collection("history")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const history = historySnap.docs.map((doc: any) => ({
      ts: doc.data().timestamp,
      totalPriceKrw: doc.data().priceKrw,
    }));

    res.json({ history });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /price-tracking/product/:productId/history
 * 상품의 모든 offer 가격 히스토리 조회
 */
priceTrackingRouter.get("/product/:productId/history", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;

    // 방법 1: price_history 컬렉션에서 직접 조회 (productId로 인덱싱된 경우)
    try {
      const historySnap = await firestore
        .collection("price_history")
        .where("productId", "==", productId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      if (!historySnap.empty) {
        const history = historySnap.docs.map((doc: any) => ({
          ts: doc.data().timestamp,
          totalPriceKrw: doc.data().priceKrw,
        }));
        return res.json({ history });
      }
    } catch (e) {
      // 인덱스가 없으면 방법 2로 fallback
    }

    // 방법 2: 상품의 모든 offer를 통해 히스토리 조회
    const offersSnap = await firestore
      .collection("offers")
      .where("productId", "==", productId)
      .get();

    const allHistory: { ts: string; totalPriceKrw: number }[] = [];

    for (const offerDoc of offersSnap.docs) {
      try {
        const historySnap = await firestore
          .collection("price_history")
          .doc(offerDoc.id)
          .collection("history")
          .orderBy("timestamp", "desc")
          .limit(limit)
          .get();

      historySnap.docs.forEach((doc: any) => {
        allHistory.push({
          ts: doc.data().timestamp,
          totalPriceKrw: doc.data().priceKrw,
        });
      });
      } catch (e) {
        // 개별 offer 히스토리 조회 실패 시 스킵
        continue;
      }
    }

    // 시간순 정렬
    allHistory.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    res.json({ history: allHistory.slice(-limit) });
  } catch (e) {
    next(e);
  }
});

