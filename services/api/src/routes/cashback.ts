import { Router } from "express";
import { firestore } from "../lib/firestore";
import { generateAffiliateLink } from "../lib/affiliate-clients";

export const cashbackRouter = Router();

// 제휴 수수료율 (마켓플레이스별)
const AFFILIATE_RATES: Record<string, number> = {
  coupang: 0.05, // 5%
  naver: 0.03,    // 3%
  amazon_jp: 0.02, // 2%
  amazon_us: 0.02,
};

/**
 * POST /cashback/generate-link
 * 제휴 링크 생성
 */
cashbackRouter.post("/generate-link", async (req, res, next) => {
  try {
    const { userId, productUrl, marketplace } = req.body;

    if (!userId || !productUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 제휴 링크 생성
    const affiliateLink = await generateAffiliateLink(marketplace, productUrl, userId);

    // 링크 저장
    const linkDoc = await firestore.collection("affiliate_links").add({
      userId,
      originalUrl: productUrl,
      affiliateLink,
      marketplace,
      createdAt: new Date().toISOString(),
      clicks: 0,
      conversions: 0,
    });

    res.json({
      id: linkDoc.id,
      affiliateLink,
      originalUrl: productUrl,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /cashback/track-purchase
 * 구매 추적 및 캐시백 적립
 */
cashbackRouter.post("/track-purchase", async (req, res, next) => {
  try {
    const {
      userId,
      linkId,
      orderId,
      purchaseAmount,
      marketplace,
    } = req.body;

    if (!userId || !orderId || !purchaseAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 제휴 링크 확인
    let linkData: any = null;
    if (linkId) {
      const linkDoc = await firestore.collection("affiliate_links").doc(linkId).get();
      if (linkDoc.exists) {
        linkData = linkDoc.data() || null;
        if (linkData) {
          await linkDoc.ref.update({
            conversions: (linkData.conversions || 0) + 1,
          });
        }
      }
    }

    // 캐시백 계산
    const rate = linkData && linkData.marketplace
      ? AFFILIATE_RATES[linkData.marketplace] || AFFILIATE_RATES[marketplace] || 0.02
      : AFFILIATE_RATES[marketplace] || 0.02;

    const cashbackAmount = Math.round(purchaseAmount * rate);

    // Wallet에 캐시백 적립
    if (cashbackAmount > 0) {
      await firestore.collection("wallet_ledger").add({
        userId,
        type: "cashback",
        amount: cashbackAmount,
        description: `${marketplace} 구매 캐시백`,
        relatedOrderId: orderId,
        createdAt: new Date().toISOString(),
        status: "completed",
      });
    }

    res.json({
      success: true,
      cashbackAmount,
      rate: rate * 100,
    });
  } catch (e) {
    next(e);
  }
});


