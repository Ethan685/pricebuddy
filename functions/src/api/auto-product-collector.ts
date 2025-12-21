import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * 자동화된 상품 수집 스케줄러
 * 매일 특정 시간에 인기 상품을 자동으로 수집하여 Firestore에 저장
 */
export const autoCollectProducts = functions
    .region("asia-northeast3")
    .pubsub.schedule("every 24 hours")
    .timeZone("Asia/Seoul")
    .onRun(async (context) => {
        functions.logger.info("Starting automated product collection");

        try {
            const db = admin.firestore();
            
            // 인기 검색어 목록
            const popularQueries = [
                "스마트폰",
                "노트북",
                "이어폰",
                "태블릿",
                "스마트워치",
                "게임기",
                "카메라",
                "헤드폰",
            ];

            const SCRAPER_BASE_URL = process.env.SCRAPER_BASE_URL || 
                                      functions.config().scraper?.base_url;
            let totalCollected = 0;

            for (const query of popularQueries) {
                try {
                    functions.logger.info(`Collecting products for query: ${query}`);

                    // 스크래퍼 서비스가 배포되어 있으면 사용
                    if (SCRAPER_BASE_URL && SCRAPER_BASE_URL !== "http://localhost:8080") {
                        try {
                            const response = await fetch(`${SCRAPER_BASE_URL}/search`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    query,
                                    marketplaces: ["coupang", "naver"],
                                    limit: 10, // 각 쿼리당 10개씩
                                }),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                const results = (data as any).results || [];

                                // 결과를 Firestore에 저장
                                const batch = db.batch();
                                let added = 0;

                                for (const result of results) {
                                    // 중복 체크
                                    const existing = await db.collection("products")
                                        .where("titleLower", "==", result.title.toLowerCase())
                                        .limit(1)
                                        .get();

                                    if (existing.empty) {
                                        const ref = db.collection("products").doc();
                                        batch.set(ref, {
                                            title: result.title,
                                            titleLower: result.title.toLowerCase(),
                                            brand: extractBrand(result.title),
                                            category: "Electronics",
                                            imageUrl: result.imageUrl || getDefaultImageUrl(),
                                            minPriceKrw: result.price || 0,
                                            maxPriceKrw: result.price || 0,
                                            priceChangePct: 0,
                                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                                            isActive: true,
                                        });

                                        // Offer 추가
                                        const offerRef = ref.collection("offers").doc();
                                        batch.set(offerRef, {
                                            merchant: result.marketplace === "coupang" ? "Coupang" : "Naver",
                                            merchantName: result.marketplace === "coupang" ? "Coupang" : "Naver Shopping",
                                            marketplace: result.marketplace,
                                            url: result.url,
                                            price: result.price || 0,
                                            totalPrice: result.price || 0,
                                            currency: "KRW",
                                            shippingFee: 0,
                                            inStock: true,
                                            productId: ref.id,
                                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                                        });

                                        added++;
                                    }
                                }

                                await batch.commit();
                                totalCollected += added;
                                functions.logger.info(`Added ${added} products for query: ${query}`);
                            }
                        } catch (error: any) {
                            functions.logger.error(`Error calling scraper for ${query}:`, error);
                        }
                    } else {
                        functions.logger.warn("Scraper service not available, skipping automated collection");
                    }

                    // 요청 간 딜레이 (마켓플레이스 차단 방지)
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } catch (error: any) {
                    functions.logger.error(`Error processing query ${query}:`, error);
                    // 개별 쿼리 실패해도 계속 진행
                }
            }

            functions.logger.info(`Automated product collection completed. Total: ${totalCollected}`);
            return { success: true, totalCollected };
        } catch (error: any) {
            functions.logger.error("Automated product collection failed:", error);
            throw error;
        }
    });

function extractBrand(title: string): string {
    const brands = ["삼성", "LG", "Apple", "Samsung", "Sony", "Canon", "Nintendo", "Bose"];
    for (const brand of brands) {
        if (title.includes(brand)) {
            return brand;
        }
    }
    return "기타";
}

function getDefaultImageUrl(): string {
    return "/img/product-placeholder.svg";
}

