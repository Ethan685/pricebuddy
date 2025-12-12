import { Router } from "express";
import type { TypedRequestQuery } from "../types/http";
import { detectMarketplaceFromUrl } from "../lib/marketplace";
import { scraperClient } from "../clients/scraper-client";
import { firestore } from "../lib/firestore";
import { pricingClient } from "../clients/pricing-client";
import type { Marketplace } from "@pricebuddy/core";

export const extRouter = Router();

// 간단한 타이틀 정규화 유틸
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9가-힣 ]/g, "")
    .trim();
}

/**
 * GET /ext/inspect?url=...
 * Chrome 확장에서 호출하는 엔드포인트
 */
extRouter.get(
  "/inspect",
  async (req: TypedRequestQuery<{ url?: string; country?: string }>, res, next) => {
    try {
      const url = req.query.url;
      const country = req.query.country ?? "KR";

      if (!url) {
        return res.status(400).json({ error: "Missing url" });
      }

      const marketplace = detectMarketplaceFromUrl(url);
      if (!marketplace) {
        return res.status(400).json({ error: "Unsupported marketplace" });
      }

      // 1) 해당 URL 스크랩 (현재 페이지의 가격)
      const parsed = await scraperClient.scrapeSingle(marketplace, url);

      // 2) DB에서 동일/유사 상품 찾기 (단순 버전: title 기반)
      const productSnap = await firestore
        .collection("products")
        .where("normalizedTitle", "==", normalizeTitle(parsed.title))
        .limit(1)
        .get();

      let productDoc = productSnap.docs[0];
      let productId: string;
      if (!productDoc) {
        // 아직 없는 상품이면 신규 product 생성 (선택 사항)
        const newProductRef = firestore.collection("products").doc();
        await newProductRef.set({
          id: newProductRef.id,
          title: parsed.title,
          normalizedTitle: normalizeTitle(parsed.title),
          createdAt: new Date().toISOString(),
        });
        productId = newProductRef.id;
      } else {
        productId = productDoc.id;
      }

      // 3) 해당 Product의 Offers 로드
      const offersSnap = await firestore
        .collection("offers")
        .where("productId", "==", productId)
        .get();

      const offersRaw = offersSnap.docs.map((d) => d.data());

      // 현재 URL의 Offer도 후보에 넣기
      const currentOfferBase = {
        productId,
        marketplace,
        externalId: url,
        url,
        basePrice: parsed.price,
        currency: parsed.currency,
        weightKg: 1,
      };

      const allOffers = [
        currentOfferBase,
        ...offersRaw.map((o) => ({
          productId: o.productId,
          marketplace: o.marketplace as Marketplace,
          externalId: o.externalId,
          url: o.url,
          basePrice: o.basePrice,
          currency: o.currency,
          weightKg: o.weightKg ?? 1,
        })),
      ];

      // 4) Pricing 엔진으로 실결제가 계산
      const pricedOffers = allOffers.map((o) =>
        pricingClient.compute(
          {
            marketplace: o.marketplace,
            country,
            basePrice: o.basePrice,
            currency: o.currency,
            weightKg: o.weightKg,
          },
          o
        )
      );

      // 5) 최저가 / 상대 절약율 계산
      const sorted = pricedOffers.sort(
        (a, b) => a.totalPriceKrw - b.totalPriceKrw
      );

      const best = sorted[0];
      const current = pricedOffers.find((o) => o.url === url) ?? best;

      const saving = current.totalPriceKrw - best.totalPriceKrw;
      const savingPct =
        current.totalPriceKrw > 0
          ? saving / current.totalPriceKrw
          : 0;

      res.json({
        product: {
          id: productId,
          title: parsed.title,
        },
        currentOffer: current,
        bestOffer: best,
        offers: sorted,
        bestPriceKrw: best.totalPriceKrw,
        baselinePriceKrw: current.totalPriceKrw,
        savingKrw: saving,
        savingPct: savingPct, // 0.18 → 18% 절약
      });
    } catch (e) {
      next(e);
    }
  }
);

