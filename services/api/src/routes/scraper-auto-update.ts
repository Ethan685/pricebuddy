import * as functions from "firebase-functions";
import { scraperClient } from "../clients/scraper-client";
import { firestore } from "../lib/firestore";

const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
};

/**
 * 스크래퍼 자동 업데이트 스케줄러
 * 매일 실행되어 마켓플레이스 구조 변경을 감지하고 자동 업데이트
 */
export const autoUpdateScrapers = functions
  .region("asia-northeast3")
  .pubsub.schedule("every 24 hours")
  .onRun(async (context) => {
    logger.info("Starting scraper auto-update check");

    try {
      // 최근 오류가 많은 마켓플레이스 확인
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const errorsSnap = await firestore
        .collection("scraper_errors")
        .where("timestamp", ">=", oneDayAgo.toISOString())
        .where("status", "==", "failed")
        .get();

      // 마켓플레이스별 오류 그룹화
      const marketplaceErrors: Record<string, number> = {};
      errorsSnap.docs.forEach((doc) => {
        const error = doc.data();
        marketplaceErrors[error.marketplace] =
          (marketplaceErrors[error.marketplace] || 0) + 1;
      });

      // 오류가 많은 마켓플레이스 (10개 이상) 자동 업데이트 시도
      for (const [marketplace, errorCount] of Object.entries(marketplaceErrors)) {
        if (errorCount >= 10) {
          logger.info(`Detected high error rate for ${marketplace}: ${errorCount} errors`);
          
          // 테스트 URL로 구조 변경 감지
          const testUrl = getTestUrl(marketplace);
          try {
            await scraperClient.scrapeSingle(marketplace as any, testUrl);
            logger.info(`Scraper for ${marketplace} is working correctly`);
          } catch (error) {
            logger.error(`Scraper for ${marketplace} needs update:`, error);
            
            // 구조 변경 알림 저장
            await firestore.collection("scraper_update_alerts").add({
              marketplace,
              errorCount,
              detectedAt: new Date().toISOString(),
              status: "needs_update",
              testUrl,
            });
          }
        }
      }

      logger.info("Scraper auto-update check completed");
    } catch (error) {
      logger.error("Error in scraper auto-update check:", error);
      throw error;
    }
  });

/**
 * 마켓플레이스별 테스트 URL
 */
function getTestUrl(marketplace: string): string {
  const testUrls: Record<string, string> = {
    coupang: "https://www.coupang.com/vp/products/123456",
    naver: "https://shopping.naver.com/catalog/123456",
    amazon_us: "https://www.amazon.com/dp/B08N5WRWNW",
    amazon_jp: "https://www.amazon.co.jp/dp/B08N5WRWNW",
  };
  return testUrls[marketplace] || "https://example.com";
}

