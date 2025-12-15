import { Router } from "express";
import type { TypedRequestQuery } from "../types/http";
import { detectMarketplaceFromUrl } from "../lib/marketplace";
import { scraperClient } from "../clients/scraper-client";
import { firestore } from "../lib/firestore";
import { pricingClient } from "../clients/pricing-client";
import { isFresh } from "../lib/cache";
import { enqueueScrapeJob } from "../jobs/enqueueScrapeJob";
import type { Marketplace, ExtInspectResponse, ExtOfferDTO } from "@pricebuddy/core";

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

      // 1) DB에서 기존 offer 찾기 (URL 기반)
      const existingOfferSnap = await firestore
        .collection("offers")
        .where("url", "==", url)
        .limit(1)
        .get();

      let parsed: { title: string; price?: number; basePrice?: number; currency: string; imageUrl?: string; shippingFee?: number; weightKg?: number; externalId?: string; attributes: Record<string, string> };
      let offerId: string | null = null;
      let shouldEnqueueJob = false;

      if (existingOfferSnap.docs.length > 0) {
        const existingOffer = existingOfferSnap.docs[0].data();
        offerId = existingOfferSnap.docs[0].id;

        // 캐시 확인: 5분 이내면 스크랩 생략
        if (!isFresh(existingOffer.lastFetchedAt, 5 * 60 * 1000)) {
          // 캐시가 오래되었으면 job enqueue
          shouldEnqueueJob = true;
        }

        // 캐시된 데이터 사용
        parsed = {
          title: existingOffer.title ?? "",
          price: existingOffer.basePrice,
          basePrice: existingOffer.basePrice,
          currency: existingOffer.currency ?? "KRW",
          imageUrl: existingOffer.imageUrl,
          shippingFee: existingOffer.shippingFee,
          weightKg: existingOffer.weightKg,
          externalId: existingOffer.externalId,
          attributes: existingOffer.attributes ?? {},
        };
      } else {
        // 기존 offer가 없으면 즉시 스크랩 (첫 요청)
        parsed = await scraperClient.scrapeSingle(marketplace, url);
        shouldEnqueueJob = true; // 다음 갱신을 위해 job enqueue
      }

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

      // offerId가 없으면 생성
      if (!offerId) {
        const newOfferRef = firestore.collection("offers").doc();
        offerId = newOfferRef.id;
        await newOfferRef.set({
          id: offerId,
          productId,
          marketplace,
          url,
          externalId: url,
          basePrice: parsed.price ?? parsed.basePrice ?? 0,
          currency: parsed.currency ?? "KRW",
          lastFetchedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }

      // Job enqueue (캐시가 오래되었거나 새 offer인 경우)
      if (shouldEnqueueJob && offerId) {
        await enqueueScrapeJob({
          marketplace,
          url,
          productId,
          offerId,
        }).catch((e) => {
          console.warn("Failed to enqueue scrape job:", e);
          // Job enqueue 실패해도 응답은 계속 진행
        });
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

      const currentOffer: ExtOfferDTO = {
        marketplace: current.marketplace as Marketplace,
        url: current.url,
        basePrice: current.basePrice,
        currency: (current.currency ?? "KRW") as "KRW" | "USD" | "JPY" | "EUR",
        totalPriceKrw: current.totalPriceKrw,
        lastFetchedAt: current.lastFetchedAt,
      };

      const bestOffer: ExtOfferDTO = {
        marketplace: best.marketplace as Marketplace,
        url: best.url,
        basePrice: best.basePrice,
        currency: (best.currency ?? "KRW") as "KRW" | "USD" | "JPY" | "EUR",
        totalPriceKrw: best.totalPriceKrw,
        lastFetchedAt: best.lastFetchedAt,
      };

      const payload: ExtInspectResponse = {
        product: {
          id: productId,
          title: parsed.title,
        },
        currentOffer,
        bestOffer,
        bestPriceKrw: best.totalPriceKrw,
        baselinePriceKrw: current.totalPriceKrw,
        savingKrw: saving,
        savingPct: savingPct, // 0.18 → 18% 절약
      };

      res.json(payload);
    } catch (e) {
      next(e);
    }
  }
);

