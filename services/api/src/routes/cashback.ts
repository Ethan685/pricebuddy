import { Router } from "express";
import { firestore } from "../lib/firestore";
import { generateAffiliateLink } from "../lib/affiliate";

export const cashbackRouter = Router();

// 제휴 수수료율 (마켓플레이스별)
const AFFILIATE_RATES: Record<string, number> = {
  // 한국
  coupang: 0.05, // 5%
  naver: 0.03,    // 3%
  gmarket: 0.03,  // 3%
  "11st": 0.03,   // 3%
  auction: 0.03,  // 3%
  interpark: 0.03, // 3%
  tmon: 0.04,     // 4%
  wemakeprice: 0.04, // 4%
  // Amazon 계열
  amazon_jp: 0.02, // 2%
  amazon_us: 0.02, // 2%
  amazon_uk: 0.02, // 2%
  amazon_ca: 0.02, // 2%
  amazon_de: 0.02, // 2%
  amazon_fr: 0.02, // 2%
  amazon_it: 0.02, // 2%
  amazon_es: 0.02, // 2%
  amazon_au: 0.02, // 2%
  amazon_sg: 0.02, // 2%
  amazon_mx: 0.02, // 2%
  amazon_br: 0.02, // 2%
  // eBay 계열
  ebay: 0.015, // 1.5%
  ebay_us: 0.015,
  ebay_uk: 0.015,
  ebay_de: 0.015,
  ebay_fr: 0.015,
  ebay_it: 0.015,
  ebay_es: 0.015,
  ebay_au: 0.015,
  // 미국 소매업체
  walmart: 0.01, // 1%
  target: 0.01, // 1%
  bestbuy: 0.01, // 1%
  costco: 0.01, // 1%
  newegg: 0.015, // 1.5%
  // 일본
  rakuten: 0.02, // 2%
  mercari: 0.015, // 1.5%
  yahoo_jp: 0.015, // 1.5%
  // 유럽
  zalando: 0.02, // 2%
  mediamarkt: 0.015, // 1.5%
  saturn: 0.015, // 1.5%
  otto: 0.015, // 1.5%
  bol: 0.015, // 1.5%
  cdiscount: 0.015, // 1.5%
  fnac: 0.015, // 1.5%
  asos: 0.02, // 2%
  // 아시아 태평양
  lazada: 0.02, // 2%
  shopee: 0.02, // 2%
  jd: 0.015, // 1.5%
  flipkart: 0.015, // 1.5%
  // 중국
  aliexpress: 0.03, // 3%
  taobao: 0.02, // 2%
  tmall: 0.02, // 2%
  // 라틴 아메리카
  mercadolibre: 0.02, // 2%
  // 기타
  etsy: 0.02, // 2%
  wish: 0.02, // 2%
  wayfair: 0.015, // 1.5%
  overstock: 0.015, // 1.5%
  allegro: 0.015, // 1.5%
};


/**
 * POST /cashback/click
 * Record user click and generate affiliate link
 */
cashbackRouter.post("/click", async (req, res, next) => {
  try {
    const { userId, productUrl, marketplace, productId } = req.body;

    if (!userId || !productUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate Affiliate Link
    const affiliateLink = await generateAffiliateLink(marketplace, productUrl, userId);

    // Record Click
    const linkDoc = await firestore.collection("affiliate_links").add({
      userId,
      originalUrl: productUrl,
      affiliateLink,
      marketplace,
      productId: productId || null,
      createdAt: new Date().toISOString(),
      clicks: 1,
      conversions: 0,
      status: "clicked"
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


