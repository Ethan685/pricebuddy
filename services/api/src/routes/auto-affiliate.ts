import { Router } from "express";
import { firestore } from "../lib/firestore";
import { generateAffiliateLink } from "../lib/affiliate-clients";
import { detectMarketplaceFromUrl, type Marketplace } from "../lib/marketplace";

export const autoAffiliateRouter = Router();

/**
 * 자동 제휴 프로그램 관리 시스템
 * API 키 관리, 자동 정산, 제휴 링크 자동 생성 등
 */

/**
 * POST /auto-affiliate/check-keys
 * 제휴 API 키 상태 자동 확인
 */
autoAffiliateRouter.post("/check-keys", async (req, res, next) => {
  try {
    const marketplaces = [
      "coupang",
      "naver",
      "amazon_us",
      "amazon_jp",
      "rakuten",
      "ebay",
    ];

    const keyStatus: Record<string, any> = {};

    for (const marketplace of marketplaces) {
      const apiKey = process.env[`${marketplace.toUpperCase()}_API_KEY`] || "";
      const isValid = await checkApiKeyValidity(marketplace, apiKey);

      keyStatus[marketplace] = {
        hasKey: !!apiKey,
        isValid,
        lastChecked: new Date().toISOString(),
      };

      // 상태 저장
      await firestore.collection("affiliate_key_status").add({
        marketplace,
        hasKey: !!apiKey,
        isValid,
        checkedAt: new Date().toISOString(),
      });
    }

    res.json({ keyStatus });
  } catch (e) {
    next(e);
  }
});

/**
 * API 키 유효성 확인
 */
async function checkApiKeyValidity(marketplace: string, apiKey: string): Promise<boolean> {
  if (!apiKey) return false;

  try {
    // 테스트 URL로 제휴 링크 생성 시도
    const testUrl = String(req.query.url || req.query.testUrl || "https://www.coupang.com/vp/products/0");
const marketplace: Marketplace = detectMarketplaceFromUrl(testUrl);
const testLink = await generateAffiliateLink(marketplace, testUrl, "test");
    
    // 링크에 API 키가 포함되어 있으면 유효
    return testLink.includes(apiKey) || testLink !== testUrl;
  } catch (e) {
    return false;
  }
}

/**
 * 마켓플레이스별 테스트 URL
 */
function getTestUrl(marketplace: string): string {
  const testUrls: Record<string, string> = {
    coupang: "https://www.coupang.com/vp/products/test",
    naver: "https://shopping.naver.com/catalog/test",
    amazon_us: "https://www.amazon.com/dp/test",
    amazon_jp: "https://www.amazon.co.jp/dp/test",
  };
  return testUrls[marketplace] || "https://example.com";
}

/**
 * POST /auto-affiliate/auto-settle
 * 자동 정산 처리
 */
autoAffiliateRouter.post("/auto-settle", async (req, res, next) => {
  try {
    const { period = "monthly" } = req.body;

    // 기간 설정
    const now = new Date();
    const startDate = new Date();
    if (period === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    }

    // 제휴 링크 통계 조회
    const linksSnap = await firestore
      .collection("affiliate_links")
      .where("createdAt", ">=", startDate.toISOString())
      .get();

    const stats = {
      totalLinks: linksSnap.size,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
    };

    for (const linkDoc of linksSnap.docs) {
      const link = linkDoc.data();
      stats.totalClicks += link.clicks || 0;
      stats.totalConversions += link.conversions || 0;
    }

    // 정산 기록 저장
    await firestore.collection("affiliate_settlements").add({
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      stats,
      calculatedAt: new Date().toISOString(),
      status: "calculated",
    });

    res.json({ success: true, stats });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /auto-affiliate/auto-generate-links
 * 자동 제휴 링크 생성 (대량)
 */
autoAffiliateRouter.post("/auto-generate-links", async (req, res, next) => {
  try {
    const { productIds, userId } = req.body;

    const generatedLinks: Array<{
      productId: string;
      marketplace: string;
      linkId: string;
      affiliateLink: string;
    }> = [];

    for (const productId of productIds) {
      // 상품의 offers 조회
      const offersSnap = await firestore
        .collection("offers")
        .where("productId", "==", productId)
        .get();

      for (const offerDoc of offersSnap.docs) {
        const offer = offerDoc.data();
        if (offer.url) {
          // 제휴 링크 생성
          const affiliateLink = await generateAffiliateLink(
            offer.marketplace,
            offer.url,
            userId
          );

          // 링크 저장
          const linkDoc = await firestore.collection("affiliate_links").add({
            userId,
            originalUrl: offer.url,
            affiliateLink,
            marketplace: offer.marketplace,
            productId,
            createdAt: new Date().toISOString(),
            clicks: 0,
            conversions: 0,
          });

          generatedLinks.push({
            productId,
            marketplace: offer.marketplace,
            linkId: linkDoc.id,
            affiliateLink,
          });
        }
      }
    }

    res.json({ success: true, generatedLinks });
  } catch (e) {
    next(e);
  }
});

