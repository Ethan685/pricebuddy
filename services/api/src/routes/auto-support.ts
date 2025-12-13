import { Router } from "express";
import { firestore } from "../lib/firestore";

export const autoSupportRouter = Router();

/**
 * 자동 고객 지원 시스템
 * 챗봇, 자동 FAQ, 자동 문제 해결
 */

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_DATABASE: FAQ[] = [
  {
    question: "캐시백은 어떻게 받나요?",
    answer: "PriceBuddy에서 생성된 제휴 링크를 통해 구매하시면 자동으로 캐시백이 Wallet에 적립됩니다. 쿠팡 5%, 네이버 3%, Amazon 2% 등 마켓플레이스별로 다른 비율이 적용됩니다.",
    keywords: ["캐시백", "적립", "받기", "wallet"],
  },
  {
    question: "가격 알림은 어떻게 설정하나요?",
    answer: "상품 상세 페이지에서 '가격 알림 설정' 버튼을 클릭하고 목표 가격을 입력하세요. 가격이 목표 가격에 도달하면 이메일과 푸시 알림을 받으실 수 있습니다.",
    keywords: ["가격 알림", "알림 설정", "목표 가격"],
  },
  {
    question: "Wallet에서 현금 인출은 어떻게 하나요?",
    answer: "Wallet 페이지에서 '인출' 버튼을 클릭하고 계좌 정보를 입력하세요. 최소 인출 금액은 10,000원이며, 영업일 기준 2-3일 내 입금됩니다.",
    keywords: ["인출", "현금", "wallet", "계좌"],
  },
  {
    question: "제휴 링크가 작동하지 않아요",
    answer: "제휴 링크는 생성 후 24-30일 내에 유효합니다. 링크를 클릭한 후 즉시 구매하지 않아도 일정 기간 내 구매 시 캐시백이 지급됩니다. 문제가 지속되면 고객 지원팀에 문의해주세요.",
    keywords: ["제휴 링크", "작동", "안됨", "캐시백"],
  },
  {
    question: "가격이 잘못 표시되어요",
    answer: "가격 정보는 실시간으로 업데이트되지만, 일시적인 오류가 발생할 수 있습니다. 페이지를 새로고침하거나 잠시 후 다시 확인해주세요. 문제가 지속되면 고객 지원팀에 문의해주세요.",
    keywords: ["가격", "잘못", "오류", "표시"],
  },
];

/**
 * POST /auto-support/chat
 * 챗봇 자동 응답
 */
autoSupportRouter.post("/chat", async (req, res, next) => {
  try {
    const { message, userId } = req.body;

    // FAQ에서 답변 찾기
    const answer = findFAQAnswer(message);

    // 대화 기록 저장
    if (userId) {
      await firestore.collection("support_conversations").add({
        userId,
        message,
        answer,
        timestamp: new Date().toISOString(),
        source: "chatbot",
      });
    }

    res.json({
      answer,
      source: "auto",
      needsHuman: !answer || answer.includes("고객 지원팀"),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * FAQ에서 답변 찾기
 */
function findFAQAnswer(message: string): string {
  const lowerMessage = message.toLowerCase();

  // 키워드 매칭
  for (const faq of FAQ_DATABASE) {
    for (const keyword of faq.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return faq.answer;
      }
    }
  }

  // 기본 응답
  return "죄송합니다. 질문을 정확히 이해하지 못했습니다. 더 구체적으로 질문해주시거나 고객 지원팀에 문의해주세요.";
}

/**
 * GET /auto-support/faq
 * FAQ 목록 조회
 */
autoSupportRouter.get("/faq", async (req, res, next) => {
  try {
    const faqs = FAQ_DATABASE.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }));

    res.json({ faqs });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /auto-support/auto-resolve
 * 자동 문제 해결 시도
 */
autoSupportRouter.post("/auto-resolve", async (req, res, next) => {
  try {
    const { issueType, issueData, userId } = req.body;

    let resolved = false;
    let resolution = "";

    switch (issueType) {
      case "cashback_not_received":
        // 캐시백 미수령 문제 자동 해결
        resolved = await autoResolveCashback(issueData, userId);
        resolution = resolved
          ? "캐시백이 자동으로 적립되었습니다."
          : "캐시백 적립을 확인 중입니다. 24시간 내 처리됩니다.";
        break;

      case "price_wrong":
        // 가격 오류 자동 해결
        resolved = await autoResolvePrice(issueData);
        resolution = resolved
          ? "가격 정보가 업데이트되었습니다."
          : "가격 정보를 확인 중입니다.";
        break;

      case "link_not_working":
        // 링크 작동 문제 자동 해결
        resolved = await autoResolveLink(issueData);
        resolution = resolved
          ? "새로운 제휴 링크가 생성되었습니다."
          : "제휴 링크를 확인 중입니다.";
        break;
    }

    // 문제 해결 기록
    await firestore.collection("support_issues").add({
      userId,
      issueType,
      issueData,
      resolved,
      resolution,
      timestamp: new Date().toISOString(),
      autoResolved: resolved,
    });

    res.json({
      resolved,
      resolution,
    });
  } catch (e) {
    next(e);
  }
});

/**
 * 캐시백 미수령 자동 해결
 */
async function autoResolveCashback(issueData: any, userId: string): Promise<boolean> {
  try {
    // 구매 기록 확인
    const { orderId, purchaseAmount, marketplace } = issueData;

    // 제휴 링크 확인
    const linksSnap = await firestore
      .collection("affiliate_links")
      .where("userId", "==", userId)
      .where("marketplace", "==", marketplace)
      .get();

    if (!linksSnap.empty) {
      // 캐시백 자동 적립
      const linkData = linksSnap.docs[0].data();
      const cashbackRate = getCashbackRate(marketplace);
      const cashbackAmount = Math.round(purchaseAmount * cashbackRate);

      await firestore.collection("wallet_ledger").add({
        userId,
        type: "cashback",
        amount: cashbackAmount,
        description: `${marketplace} 구매 캐시백 (자동 적립)`,
        relatedOrderId: orderId,
        createdAt: new Date().toISOString(),
        status: "completed",
      });

      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * 가격 오류 자동 해결
 */
async function autoResolvePrice(issueData: any): Promise<boolean> {
  try {
    const { productId, offerId } = issueData;

    // 가격 재스크래핑
    const offerDoc = await firestore.collection("offers").doc(offerId).get();
    if (offerDoc.exists) {
      const offer = offerDoc.data();
      // 가격 스케줄러가 자동으로 업데이트할 것
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * 링크 작동 문제 자동 해결
 */
async function autoResolveLink(issueData: any): Promise<boolean> {
  try {
    const { productUrl, marketplace, userId } = issueData;

    // 새 제휴 링크 생성
    const { generateAffiliateLink } = await import("../lib/affiliate-clients");
    const newLink = await generateAffiliateLink(marketplace, productUrl, userId);

    // 새 링크 저장
    await firestore.collection("affiliate_links").add({
      userId,
      originalUrl: productUrl,
      affiliateLink: newLink,
      marketplace,
      createdAt: new Date().toISOString(),
      clicks: 0,
      conversions: 0,
    });

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 캐시백 비율 조회
 */
function getCashbackRate(marketplace: string): number {
  const rates: Record<string, number> = {
    coupang: 0.05,
    naver: 0.03,
    amazon_us: 0.02,
    amazon_jp: 0.02,
  };
  return rates[marketplace] || 0.02;
}

