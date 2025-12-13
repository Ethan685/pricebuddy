import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// HTTP 엔드포인트: 특가 딜 조회
export const deals = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
    // CORS 설정
    const origin = req.headers.origin;
    const allowedOrigins = [
        "https://pricebuddy-5a869.web.app",
        "https://pricebuddy-5a869.firebaseapp.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
    } else {
        res.set("Access-Control-Allow-Origin", "*");
    }
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
    }

    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        const category = req.query.category as string | undefined;
        const limit = parseInt(req.query.limit as string) || 20;

        functions.logger.info("HTTP Deals request", { category, limit });

        const db = admin.firestore();
        const now = new Date().toISOString();

        let dealsList: any[] = [];

        // deals 컬렉션 조회 시도 (인덱스가 없을 수 있으므로 try-catch)
        try {
            let dealsQuery = db.collection("deals")
                .where("isActive", "==", true)
                .where("validUntil", ">", now)
                .orderBy("validUntil", "asc")
                .orderBy("discountPercent", "desc")
                .limit(limit);

            if (category) {
                dealsQuery = dealsQuery.where("category", "==", category) as any;
            }

            const dealsSnap = await dealsQuery.get();

            if (!dealsSnap.empty) {
                // deals 컬렉션에서 가져오기
                dealsList = dealsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            }
        } catch (error: any) {
            // deals 컬렉션이 없거나 인덱스가 없으면 products에서 생성
            functions.logger.info("Deals collection not available, generating from products", error.message);
        }

        // deals 컬렉션에서 가져온 데이터가 없으면 products에서 할인 정보 생성
        if (dealsList.length === 0) {
            // deals 컬렉션이 없으면 products에서 할인 정보 생성
            const productsSnap = await db.collection("products")
                .limit(limit * 2)
                .get();

            for (const productDoc of productsSnap.docs) {
                const product = productDoc.data();
                const offersSnap = await productDoc.ref.collection("offers").get();

                // KRW offers만 사용 (통화 일치)
                const krwOffers = offersSnap.docs
                    .map(doc => doc.data())
                    .filter(offer => offer.currency === "KRW" || !offer.currency);

                if (krwOffers.length > 0) {
                    // 가장 낮은 가격 찾기
                    const lowestOffer = krwOffers.reduce((min, offer) => {
                        const price = offer.totalPrice || offer.price || 0;
                        const minPrice = min.totalPrice || min.price || 0;
                        return price < minPrice ? offer : min;
                    });

                    const originalPrice = product.maxPriceKrw || product.minPriceKrw || 0;
                    const discountedPrice = lowestOffer.totalPrice || lowestOffer.price || originalPrice;
                    
                    // 원래 가격보다 낮은 경우만 할인으로 계산
                    const discountPercent = originalPrice > 0 && discountedPrice < originalPrice
                        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                        : 0;

                    // 할인이 5% 이상인 경우만 딜로 표시
                    if (discountPercent >= 5 && discountPercent < 100) {
                        dealsList.push({
                            id: `deal-${productDoc.id}`,
                            productId: productDoc.id,
                            title: product.title || "Product",
                            imageUrl: product.imageUrl || "", // 이미지 URL 추가
                            originalPrice,
                            discountedPrice,
                            discountPercent,
                            marketplace: lowestOffer.marketplace || "unknown",
                            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후
                            isFlashDeal: discountPercent >= 20,
                        });
                    }
                }
            }

            // 할인율 순으로 정렬
            dealsList.sort((a, b) => b.discountPercent - a.discountPercent);
            dealsList = dealsList.slice(0, limit);
        }

        res.json({ deals: dealsList });
    } catch (error: any) {
        functions.logger.error("Get Deals failed", error);
        res.status(500).json({ error: "Failed to fetch deals", message: error.message });
    }
});

