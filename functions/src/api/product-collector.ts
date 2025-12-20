import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * 실제 마켓플레이스에서 인기 상품을 수집하는 함수
 * 쿠팡, 네이버 쇼핑 등에서 인기 상품을 가져와서 Firestore에 저장
 */
export const collectPopularProducts = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
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
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
    }

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        const { category = "electronics", limit = 50, query } = req.body;
        
        functions.logger.info("Collecting popular products", { category, limit, query });

        const db = admin.firestore();
        const batch = db.batch();
        let addedCount = 0;

        // 스크래퍼 서비스 URL (Cloud Run 배포 후 설정)
        const SCRAPER_BASE_URL = process.env.SCRAPER_BASE_URL || 
                                  functions.config().scraper?.base_url || 
                                  "http://localhost:8080";
        
        let searchResults: any[] = [];

        // 스크래퍼 서비스가 있으면 실제 검색 시도
        if (SCRAPER_BASE_URL !== "http://localhost:8080") {
            try {
                const searchQuery = query || getDefaultQueryForCategory(category);
                const response = await fetch(`${SCRAPER_BASE_URL}/search`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: searchQuery,
                        marketplaces: ["coupang", "naver"],
                        limit: limit,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    searchResults = (data as any).results || [];
                    functions.logger.info(`Found ${searchResults.length} products from scraper`);
                }
            } catch (error: any) {
                functions.logger.warn("Scraper service not available, using demo data", error.message);
            }
        }

        // 스크래퍼 결과가 없으면 데모 데이터 사용
        if (searchResults.length === 0) {
            searchResults = getDemoProducts(category, limit);
        }

        // 각 검색 결과를 Firestore에 저장
        for (const result of searchResults.slice(0, limit)) {
            // 중복 체크
            const existing = await db.collection("products")
                .where("titleLower", "==", result.title.toLowerCase())
                .limit(1)
                .get();

            const forceAdd = req.body.force === true;
            if (existing.empty || forceAdd) {
                const ref = db.collection("products").doc();
                const titleLower = result.title.toLowerCase();
                
                batch.set(ref, {
                    title: result.title,
                    titleLower,
                    brand: extractBrand(result.title),
                    category: category,
                    imageUrl: result.imageUrl || getDefaultImageUrl(),
                    minPriceKrw: result.price || 0,
                    maxPriceKrw: result.price || 0,
                    priceChangePct: (Math.random() * 10 - 5).toFixed(1), // -5% ~ +5%
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    isActive: true,
                });
                addedCount++;

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

                // 가격 히스토리 추가
                const today = new Date();
                for (let i = 30; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const randomFluct = 1 + (Math.random() * 0.1 - 0.05);
                    const dailyPrice = Math.floor((result.price || 1000000) * randomFluct);
                    
                    const histRef = ref.collection("price_history").doc(dateStr);
                    batch.set(histRef, {
                        timestamp: admin.firestore.Timestamp.fromDate(date),
                        date: dateStr,
                        price: dailyPrice,
                        currency: "KRW",
                        lowestMerchant: result.marketplace === "coupang" ? "Coupang" : "Naver",
                    });
                }
            }
        }

        await batch.commit();

        res.json({
            success: true,
            message: `Added ${addedCount} popular products`,
            total: searchResults.length,
            fromScraper: searchResults.length > 0 && SCRAPER_BASE_URL !== "http://localhost:8080",
        });
    } catch (error: any) {
        functions.logger.error("Collect products failed", error);
        res.status(500).json({ error: "Failed to collect products", message: error.message });
    }
});

function getDefaultQueryForCategory(category: string): string {
    const queries: Record<string, string> = {
        electronics: "스마트폰",
        fashion: "의류",
        home: "가구",
        beauty: "화장품",
        food: "식품",
    };
    return queries[category] || "인기상품";
}

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
    return "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop";
}

function getDemoProducts(category: string, limit: number): any[] {
    // 데모용 상품 데이터 (스크래퍼가 없을 때 사용)
    const allProducts = [
        { title: "삼성 갤럭시 S24 Ultra", price: 1390000, marketplace: "coupang", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
        { title: "삼성 갤럭시 S24", price: 999000, marketplace: "coupang", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
        { title: "갤럭시 Z 플립5", price: 1290000, marketplace: "naver", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop" },
        { title: "LG 그램 17인치 노트북", price: 1890000, marketplace: "coupang", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop" },
        { title: "맥북 프로 16인치 M3", price: 3290000, marketplace: "naver", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop" },
        { title: "맥북 에어 15인치 M3", price: 1990000, marketplace: "coupang", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop" },
        { title: "에어팟 프로 2세대", price: 390000, marketplace: "coupang", imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop" },
        { title: "갤럭시 버즈2 프로", price: 199000, marketplace: "naver", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop" },
        { title: "소니 WH-1000XM5 헤드폰", price: 499000, marketplace: "coupang", imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop" },
        { title: "아이패드 프로 12.9인치", price: 1290000, marketplace: "naver", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop" },
        { title: "갤럭시 워치6 클래식", price: 399000, marketplace: "coupang", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop" },
        { title: "플레이스테이션 5", price: 699000, marketplace: "naver", imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop" },
    ];
    
    return allProducts.slice(0, limit);
}
