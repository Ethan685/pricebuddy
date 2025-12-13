import { Router } from "express";
import { firestore } from "../lib/firestore";

export const autoMarketingRouter = Router();

/**
 * 자동 마케팅 시스템
 * SEO 자동화, 콘텐츠 생성, SNS 자동 포스팅 등
 */

/**
 * POST /auto-marketing/generate-content
 * 자동 콘텐츠 생성 (블로그, SNS 등)
 */
autoMarketingRouter.post("/generate-content", async (req, res, next) => {
  try {
    const { type, topic, productId } = req.body;

    // 상품 정보 조회
    let productData: any = null;
    if (productId) {
      const productDoc = await firestore.collection("products").doc(productId as string).get();
      if (productDoc.exists) {
        productData = productDoc.data() || null;
      }
    }

    // 콘텐츠 타입별 자동 생성
    let content: string | object = "";
    switch (type) {
      case "blog":
        content = generateBlogPost(topic, productData);
        break;
      case "sns":
        content = generateSNSPost(topic, productData);
        break;
      case "seo":
        content = generateSEOContent(topic, productData);
        break;
    }

    // 생성된 콘텐츠 저장
    const contentDoc = await firestore.collection("marketing_content").add({
      type,
      topic,
      productId: productId || null,
      content,
      generatedAt: new Date().toISOString(),
      status: "draft",
    });

    res.json({
      success: true,
      contentId: contentDoc.id,
      content,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * 자동 블로그 포스트 생성
 */
function generateBlogPost(topic: string, productData: any): string {
  const title = productData?.title || topic;
  const price = productData?.price || "확인 필요";

  return `# ${title} 최저가 비교 가이드

## 개요
${title}의 최저가를 찾는 방법과 주요 쇼핑몰 가격 비교 정보를 제공합니다.

## 가격 비교
현재 확인된 최저가: ${price}원

## 주요 쇼핑몰 가격
- 쿠팡: 확인 필요
- 네이버: 확인 필요
- 지마켓: 확인 필요

## 구매 팁
1. 가격 알림 설정으로 최적의 구매 시점 파악
2. 여러 쇼핑몰 가격 비교
3. 캐시백 혜택 활용

## 결론
PriceBuddy를 통해 ${title}의 최저가를 찾고 캐시백까지 받으세요!`;
}

/**
 * 자동 SNS 포스트 생성
 */
function generateSNSPost(topic: string, productData: any): string {
  const title = productData?.title || topic;
  const price = productData?.price || "확인 필요";

  return `🎯 ${title} 최저가 발견!

💰 현재 최저가: ${price}원
🛒 여러 쇼핑몰 가격 비교
💵 캐시백까지 받으세요!

#가격비교 #최저가 #쇼핑 #PriceBuddy`;
}

/**
 * 자동 SEO 콘텐츠 생성
 */
function generateSEOContent(topic: string, productData: any): object {
  const title = productData?.title || topic;
  const keywords = `${title} 최저가, ${title} 가격 비교, ${title} 구매 가이드`;

  return {
    title: `${title} 최저가 비교 - PriceBuddy`,
    description: `${title}의 최저가를 찾고 여러 쇼핑몰 가격을 비교하세요. 캐시백까지 받는 스마트 쇼핑!`,
    keywords,
    ogTitle: `${title} 최저가 비교`,
    ogDescription: `${title}의 최저가를 찾고 캐시백까지 받으세요!`,
  };
}

/**
 * POST /auto-marketing/schedule-post
 * SNS 자동 포스팅 스케줄링
 */
autoMarketingRouter.post("/schedule-post", async (req, res, next) => {
  try {
    const { contentId, platforms, scheduledAt } = req.body;

    // 포스팅 스케줄 저장
    const scheduleDoc = await firestore.collection("marketing_schedules").add({
      contentId,
      platforms: platforms || ["twitter", "facebook", "instagram"],
      scheduledAt: scheduledAt || new Date().toISOString(),
      status: "scheduled",
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, scheduleId: scheduleDoc.id });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /auto-marketing/seo-keywords
 * 자동 SEO 키워드 추천
 */
autoMarketingRouter.get("/seo-keywords", async (req, res, next) => {
  try {
    const { productId } = req.query;

    // 상품 정보 조회
    let keywords: string[] = [];
    if (productId) {
      const productDoc = await firestore.collection("products").doc(productId as string).get();
      if (productDoc.exists) {
        const product = productDoc.data();
        const title = product?.title || "";
        
        // 제목에서 키워드 추출
        keywords = [
          `${title} 최저가`,
          `${title} 가격 비교`,
          `${title} 구매 가이드`,
          `${title} 할인`,
          `${title} 쿠팡`,
          `${title} 네이버`,
        ];
      }
    }

    res.json({ keywords });
  } catch (e) {
    next(e);
  }
});

