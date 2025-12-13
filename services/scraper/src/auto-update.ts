/**
 * 자동 스크래퍼 업데이트 시스템
 * 마켓플레이스 구조 변경 감지 및 셀렉터 자동 업데이트
 */

import * as cheerio from "cheerio";
import { fetchPage } from "./fetch-page";
import type { ScrapeRequest, ParsedOfferOutput } from "./types";

interface SelectorCandidate {
  selector: string;
  confidence: number;
  reason: string;
}

/**
 * 마켓플레이스 구조 변경 감지
 */
export async function detectStructureChange(
  req: ScrapeRequest,
  oldSelectors: any
): Promise<{ changed: boolean; newSelectors?: any; candidates?: SelectorCandidate[] }> {
  try {
    const raw = await fetchPage(req);
    const $ = cheerio.load(raw.html);

    // 기존 셀렉터로 파싱 시도
    const oldTitle = $(oldSelectors.title).first().text().trim();
    const oldPrice = $(oldSelectors.price).first().text().trim();

    // 구조 변경 감지
    if (!oldTitle || !oldPrice || oldPrice === "0") {
      // 구조 변경 감지됨 - 새 셀렉터 찾기
      const candidates = await findSelectorCandidates($, req.marketplace);
      return {
        changed: true,
        candidates,
      };
    }

    return { changed: false };
  } catch (e) {
    return { changed: true };
  }
}

/**
 * 새 셀렉터 후보 찾기
 */
async function findSelectorCandidates(
  $: cheerio.CheerioAPI,
  marketplace: string
): Promise<SelectorCandidate[]> {
  const candidates: SelectorCandidate[] = [];

  // 제목 후보 찾기
  const titleCandidates = [
    "h1",
    "h2",
    ".title",
    ".product-title",
    "[data-test*='title']",
    "[class*='title']",
  ];

  for (const selector of titleCandidates) {
    const text = $(selector).first().text().trim();
    if (text && text.length > 5 && text.length < 200) {
      candidates.push({
        selector: `title: "${selector}"`,
        confidence: calculateConfidence(text, "title"),
        reason: `제목 후보: "${text.substring(0, 50)}"`,
      });
    }
  }

  // 가격 후보 찾기
  const priceCandidates = [
    ".price",
    "[class*='price']",
    "[data-test*='price']",
    "[id*='price']",
    "span:contains('원')",
    "span:contains('$')",
  ];

  for (const selector of priceCandidates) {
    const text = $(selector).first().text().trim();
    const price = parseFloat(text.replace(/[^\d.]/g, ""));
    if (price > 0 && price < 100000000) {
      candidates.push({
        selector: `price: "${selector}"`,
        confidence: calculateConfidence(text, "price"),
        reason: `가격 후보: ${price}`,
      });
    }
  }

  // 신뢰도 순으로 정렬
  return candidates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * 신뢰도 계산
 */
function calculateConfidence(text: string, type: "title" | "price"): number {
  let confidence = 0.5;

  if (type === "title") {
    // 제목 특징
    if (text.length > 10 && text.length < 100) confidence += 0.2;
    if (!text.match(/^\d+$/)) confidence += 0.1; // 숫자만이 아님
    if (text.includes(" ") || text.includes("-")) confidence += 0.1;
  } else if (type === "price") {
    // 가격 특징
    if (text.match(/[\d,]+/)) confidence += 0.3;
    if (text.includes("원") || text.includes("$") || text.includes("€")) confidence += 0.2;
  }

  return Math.min(confidence, 1.0);
}

/**
 * 자동 셀렉터 업데이트 테스트
 */
export async function testSelectorUpdate(
  req: ScrapeRequest,
  newSelectors: any
): Promise<{ success: boolean; result?: ParsedOfferOutput; error?: string }> {
  try {
    const raw = await fetchPage(req);
    const $ = cheerio.load(raw.html);

    const title = $(newSelectors.title).first().text().trim();
    const priceText = $(newSelectors.price).first().text().trim();
    const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;

    if (title && price > 0) {
      return {
        success: true,
        result: {
          title,
          basePrice: price,
          currency: "KRW",
          shippingFee: 0,
          imageUrl: "",
          attributes: {},
        },
      };
    }

    return {
      success: false,
      error: "제목 또는 가격을 찾을 수 없습니다.",
    };
  } catch (e: any) {
    return {
      success: false,
      error: e.message,
    };
  }
}

