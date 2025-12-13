import { Router } from "express";
import { firestore } from "../lib/firestore";
import { scraperClient } from "../clients/scraper-client";

export const monitoringRouter = Router();

/**
 * 자동 모니터링 시스템
 * 스크래퍼 오류 감지, 마켓플레이스 구조 변경 감지, 자동 재시도 등
 */

interface ScraperError {
  marketplace: string;
  url: string;
  error: string;
  timestamp: string;
  retryCount: number;
  status: "pending" | "resolved" | "failed";
}

/**
 * POST /monitoring/scraper-error
 * 스크래퍼 오류 기록 및 자동 재시도
 */
monitoringRouter.post("/scraper-error", async (req, res, next) => {
  try {
    const { marketplace, url, error, retryCount = 0 } = req.body;

    // 오류 기록
    const errorDoc = await firestore.collection("scraper_errors").add({
      marketplace,
      url,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      retryCount,
      status: "pending",
    });

    // 자동 재시도 (최대 3회)
    if (retryCount < 3) {
      setTimeout(async () => {
        try {
          await scraperClient.scrapeSingle(marketplace, url);
          // 성공 시 오류 해결 처리
          await firestore.collection("scraper_errors").doc(errorDoc.id).update({
            status: "resolved",
            resolvedAt: new Date().toISOString(),
          });
        } catch (retryError) {
          // 재시도 실패 시 재시도 횟수 증가
          await firestore.collection("scraper_errors").doc(errorDoc.id).update({
            retryCount: retryCount + 1,
            lastRetryAt: new Date().toISOString(),
          });
        }
      }, 5000); // 5초 후 재시도
    } else {
      // 최대 재시도 횟수 초과 시 알림
      await firestore.collection("scraper_errors").doc(errorDoc.id).update({
        status: "failed",
        failedAt: new Date().toISOString(),
      });
    }

    res.json({ success: true, errorId: errorDoc.id });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /monitoring/scraper-health
 * 스크래퍼 건강 상태 확인
 */
monitoringRouter.get("/scraper-health", async (req, res, next) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // 최근 24시간 오류 통계
    const errorsSnap = await firestore
      .collection("scraper_errors")
      .where("timestamp", ">=", oneDayAgo.toISOString())
      .get();

    const errors = errorsSnap.docs.map((doc) => doc.data());
    const pendingErrors = errors.filter((e) => e.status === "pending");
    const failedErrors = errors.filter((e) => e.status === "failed");

    // 마켓플레이스별 오류 통계
    const marketplaceErrors: Record<string, number> = {};
    errors.forEach((error) => {
      marketplaceErrors[error.marketplace] =
        (marketplaceErrors[error.marketplace] || 0) + 1;
    });

    res.json({
      totalErrors: errors.length,
      pendingErrors: pendingErrors.length,
      failedErrors: failedErrors.length,
      marketplaceErrors,
      health: errors.length < 10 ? "healthy" : errors.length < 50 ? "warning" : "critical",
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /monitoring/selector-update
 * 마켓플레이스 구조 변경 감지 및 셀렉터 자동 업데이트 제안
 */
monitoringRouter.post("/selector-update", async (req, res, next) => {
  try {
    const { marketplace, url, oldSelectors, newSelectors } = req.body;

    // 구조 변경 감지 기록
    await firestore.collection("selector_changes").add({
      marketplace,
      url,
      oldSelectors,
      newSelectors,
      detectedAt: new Date().toISOString(),
      status: "pending_review",
    });

    // 자동으로 새 셀렉터 테스트
    try {
      const testResult = await scraperClient.scrapeSingle(marketplace, url);
      if (testResult.price && testResult.title) {
        // 성공 시 자동 업데이트 제안
        await firestore.collection("selector_updates").add({
          marketplace,
          selectors: newSelectors,
          testedAt: new Date().toISOString(),
          testResult: "success",
          status: "auto_approved",
        });
      }
    } catch (testError) {
      // 테스트 실패 시 수동 검토 필요
    }

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

