import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { scraperClient } from "../clients/scraper-client";
import { pricingClient } from "../clients/pricing-client";

// Firebase Admin 초기화 (이미 초기화되어 있다면 생략)
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args),
};

/**
 * 주기적으로 상품 가격 업데이트하는 스케줄러
 * 매 시간마다 활성화된 상품들의 가격을 업데이트
 */
export const updateProductPrices = functions
  .region("asia-northeast3")
  .pubsub.schedule("every 1 hours")
  .onRun(async (context) => {
    logger.info("Starting product price update");

    try {
      // 활성화된 상품들 조회 (최근 7일 내 업데이트된 상품)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const productsSnap = await firestore
        .collection("products")
        .where("isActive", "==", true)
        .limit(100) // 한 번에 100개씩 처리
        .get();

      logger.info(`Found ${productsSnap.size} active products to update`);

      for (const productDoc of productsSnap.docs) {
        try {
          const product = productDoc.data();
          const productId = productDoc.id;

          // 해당 상품의 모든 offer 가져오기
          const offersSnap = await firestore
            .collection("offers")
            .where("productId", "==", productId)
            .get();

          for (const offerDoc of offersSnap.docs) {
            const offer = offerDoc.data();
            
            if (!offer.url) continue;

            try {
              // 스크래퍼로 현재 가격 가져오기
              const scraped = await scraperClient.scrapeSingle(
                offer.marketplace,
                offer.url
              );

              // 가격 계산
              const basePrice = scraped.price || scraped.basePrice || offer.basePrice || 0;
              const priced = await pricingClient.compute(
                {
                  marketplace: offer.marketplace,
                  country: "KR",
                  basePrice,
                  currency: scraped.currency || offer.currency,
                  weightKg: scraped.weightKg || offer.weightKg || 1,
                },
                offer
              );

              const oldPrice = offer.totalPriceKrw || 0;
              const newPrice = priced.totalPriceKrw;

              // 가격이 변경된 경우 히스토리에 저장
              if (oldPrice !== newPrice) {
                await firestore
                  .collection("price_history")
                  .doc(offerDoc.id)
                  .collection("history")
                  .add({
                    priceKrw: oldPrice,
                    timestamp: offer.lastFetchedAt || new Date().toISOString(),
                    productId,
                  });

                await firestore
                  .collection("price_history")
                  .doc(offerDoc.id)
                  .collection("history")
                  .add({
                    priceKrw: newPrice,
                    timestamp: new Date().toISOString(),
                    productId,
                  });

                logger.info(`Price updated for offer ${offerDoc.id}: ${oldPrice} -> ${newPrice}`);
              }

              // Offer 업데이트
              const basePriceForUpdate = scraped.price || scraped.basePrice || offer.basePrice || 0;
              await offerDoc.ref.update({
                basePrice: basePriceForUpdate,
                currency: scraped.currency || offer.currency,
                shippingFee: scraped.shippingFee || offer.shippingFee || 0,
                totalPriceKrw: newPrice,
                lastFetchedAt: new Date().toISOString(),
              });
            } catch (error) {
              logger.error(`Error updating offer ${offerDoc.id}:`, error);
              // 개별 offer 실패해도 계속 진행
            }
          }
        } catch (error) {
          logger.error(`Error processing product ${productDoc.id}:`, error);
          // 개별 상품 실패해도 계속 진행
        }
      }

      logger.info("Product price update completed");
    } catch (error) {
      logger.error("Error in product price update:", error);
      throw error;
    }
  });

