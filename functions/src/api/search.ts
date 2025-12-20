import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Product } from "../types";
import { ScraperService } from "../services/scraper";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

// Callable function (기존 호환성 유지)
export const searchProducts = functions.https.onCall(async (data, context) => {
    const query = data.query || "";
    functions.logger.info("Searching products", { query });

    if (!query) return [];

    try {
        const logs: string[] = [];
        const log = (msg: string) => {
            functions.logger.info(msg);
            logs.push(msg);
        };

        const queryLower = query.toLowerCase();
        log(`[DEBUG] Query: ${query}, Lower: ${queryLower}, Project: ${process.env.GCLOUD_PROJECT}`);

        // Use simpler approach: fetch all and filter in-memory for emulator testing
        // Production should use full-text search (Algolia, Elasticsearch, etc.)
        const allProducts = await admin.firestore().collection("products").limit(100).get();

        log(`[DEBUG] Fetched ${allProducts.size} total products`);

        // Filter products that contain the search term
        const matchingDocs = allProducts.docs.filter(doc => {
            const data = doc.data();
            const titleLower = (data.titleLower || '').toLowerCase();
            return titleLower.includes(queryLower);
        });

        log(`[DEBUG] Found ${matchingDocs.length} matching products`);

        if (matchingDocs.length > 0) {
            const firstData = matchingDocs[0].data();
            log(`[DEBUG] First match ID: ${matchingDocs[0].id}`);
            log(`[DEBUG] First match title: ${firstData.title}`);
            log(`[DEBUG] First match titleLower: ${firstData.titleLower}`);
        }

        const products: Product[] = matchingDocs.slice(0, 20).map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));

        return products;
    } catch (error) {
        functions.logger.error("Search failed", error);
        throw new functions.https.HttpsError("internal", "Search failed");
    }
});

// HTTP 엔드포인트 추가 (웹 앱에서 사용)
export const search = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
    // CORS 설정 - 특정 origin 허용
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
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
    }

    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        const query = String((req.query as any)?.q || (req.query as any)?.query || "").trim();
        const region = req.query.region as string || "global";

        functions.logger.info("HTTP Search request", { query, region });

        if (!query) {
            res.status(400).json({ error: "Missing query parameter 'q'" });
            return;
        }
        // 1단계: 스크래퍼 서비스 호출은 GA 정식 스크래퍼로 대체됨 (Cloud Run 경로 404 이슈로 비활성화)
        let scraperResults: any[] = [];

        // GA ScraperService (in-repo merchant adapters)
        try {
            const r = String(region || "global").toUpperCase();
            const regions = (r === "GLOBAL" || r === "ALL") ? ["KR","JP"] : [r];
            const resultsAll: any[] = [];
            for (const rr of regions) {
                try {
                    const part = await ScraperService.search(String(query || ""), rr);
                    if (Array.isArray(part)) resultsAll.push(...part);
                } catch (e) {}
            }
            const products = resultsAll;
            scraperResults = (products || []).map((item: any) => ({
                productId: item.productId || item.id || `m-${Date.now()}-${Math.random()}`,
                title: item.title || item.name || "",
                imageUrl: item.imageUrl || item.image || item.image_url || "",
                minPriceKrw: item.minPriceKrw || item.priceKrw || item.price || 0,
                maxPriceKrw: item.maxPriceKrw || item.priceKrw || item.price || 0,
                priceChangePct: item.priceChangePct || 0,
                url: item.url || item.link,
                marketplace: item.marketplace || item.merchant || item.source,
            })).filter((x: any) => x.title);
            functions.logger.info(`GA ScraperService returned ${scraperResults.length} results`);
        } catch (e: any) {
            functions.logger.warn("GA ScraperService failed, falling back to Firestore", { error: e?.message || String(e) });
        }

        // 2단계: Firestore에서도 검색 (스크래퍼 결과가 없거나 보완)
        const queryLower = query.toLowerCase();
        const allProducts = await admin.firestore().collection("products").limit(100).get();

        const matchingDocs = allProducts.docs.filter(doc => {
            const data = doc.data();
            const titleLower = (data.titleLower || data.title || '').toLowerCase();
            return titleLower.includes(queryLower);
        });

        const firestoreResults = matchingDocs.slice(0, 20).map(doc => {
            const data = doc.data();
            return {
                productId: doc.id,
                title: data.title || "",
                imageUrl: data.imageUrl,
                minPriceKrw: data.minPriceKrw || data.price || 0,
                maxPriceKrw: data.maxPriceKrw || data.price || 0,
                priceChangePct: data.priceChangePct,
            };
        });

        // 3단계: 결과 병합 (스크래퍼 결과 우선, Firestore 결과 보완)
        const combinedResults = [...scraperResults, ...firestoreResults];
        
        // 중복 제거 (제목 기준)
        const uniqueResults = combinedResults.reduce((acc: any[], current: any) => {
            const exists = acc.find(item => 
                item.title.toLowerCase() === current.title.toLowerCase()
            );
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, []).slice(0, 20);

        functions.logger.info(`Returning ${uniqueResults.length} results (${scraperResults.length} from scraper, ${firestoreResults.length} from Firestore)`);

        res.json({
            query,
            region,
            results: uniqueResults,
        });
    } catch (error: any) {
        functions.logger.error("Search failed", error);
        res.status(500).json({ error: "Search failed", message: error.message });
    }
});

// 임시: 샘플 데이터 추가 엔드포인트 (개발용)
export const seedProducts = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
    // CORS 설정
    const origin = req.headers.origin;
    const allowedOrigins = [
        "https://pricebuddy-5a869.web.app",
        "https://pricebuddy-5a869.firebaseapp.com",
        "http://localhost:5173",
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
    }
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(200).send("");
        return;
    }

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        const IPHONE_PRODUCTS = [
            {
                title: "Apple iPhone 15 Pro Max",
                titleLower: "apple iphone 15 pro max",
                brand: "Apple",
                category: "Electronics",
                imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
                minPriceKrw: 1890000,
                maxPriceKrw: 1990000,
                priceChangePct: -2.5,
            },
            {
                title: "Apple iPhone 15 Pro",
                titleLower: "apple iphone 15 pro",
                brand: "Apple",
                category: "Electronics",
                imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
                minPriceKrw: 1590000,
                maxPriceKrw: 1690000,
                priceChangePct: -1.8,
            },
            {
                title: "Apple iPhone 15",
                titleLower: "apple iphone 15",
                brand: "Apple",
                category: "Electronics",
                imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
                minPriceKrw: 1250000,
                maxPriceKrw: 1350000,
                priceChangePct: -3.2,
            },
            {
                title: "Apple iPhone 14 Pro",
                titleLower: "apple iphone 14 pro",
                brand: "Apple",
                category: "Electronics",
                imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
                minPriceKrw: 1390000,
                maxPriceKrw: 1490000,
                priceChangePct: -5.1,
            },
            {
                title: "Apple iPhone 13",
                titleLower: "apple iphone 13",
                brand: "Apple",
                category: "Electronics",
                imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop",
                minPriceKrw: 990000,
                maxPriceKrw: 1090000,
                priceChangePct: -7.3,
            },
        ];

        const batch = admin.firestore().batch();
        
        for (const product of IPHONE_PRODUCTS) {
            const ref = admin.firestore().collection("products").doc();
            batch.set(ref, {
                ...product,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            // 샘플 offers 추가 (실제 URL은 나중에 스크래퍼로 채워짐)
            // 주의: 가짜 URL이므로 실제로는 스크래퍼에서 가져온 URL을 사용해야 함
            const sampleOffers = [
                {
                    merchant: "Coupang",
                    merchantName: "Coupang",
                    marketplace: "coupang",
                    url: `https://www.coupang.com/np/search?q=${encodeURIComponent(product.title)}`,
                    price: product.minPriceKrw,
                    totalPrice: product.minPriceKrw,
                    currency: "KRW",
                    shippingFee: 0,
                    inStock: true,
                    isPlaceholder: true, // 플레이스홀더 표시
                },
                {
                    merchant: "Naver",
                    merchantName: "Naver Shopping",
                    marketplace: "naver",
                    url: `https://shopping.naver.com/search/all?query=${encodeURIComponent(product.title)}`,
                    price: product.minPriceKrw + 50000,
                    totalPrice: product.minPriceKrw + 50000,
                    currency: "KRW",
                    shippingFee: 3000,
                    inStock: true,
                    isPlaceholder: true, // 플레이스홀더 표시
                },
                {
                    merchant: "Amazon",
                    merchantName: "Amazon",
                    marketplace: "amazon_us",
                    url: `https://www.amazon.com/dp/${ref.id}`,
                    price: Math.floor(product.minPriceKrw / 1300),
                    totalPrice: Math.floor(product.minPriceKrw / 1300) + 25,
                    currency: "USD",
                    shippingFee: 25,
                    inStock: true,
                },
            ];
            
            for (const offer of sampleOffers) {
                const offerRef = ref.collection("offers").doc();
                batch.set(offerRef, {
                    ...offer,
                    productId: ref.id,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            
            // 샘플 가격 히스토리 추가
            const today = new Date();
            for (let i = 30; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const randomFluct = 1 + (Math.random() * 0.1 - 0.05); // ±5% 변동
                const dailyPrice = Math.floor(product.minPriceKrw * randomFluct);
                
                const histRef = ref.collection("price_history").doc(dateStr);
                batch.set(histRef, {
                    timestamp: admin.firestore.Timestamp.fromDate(date),
                    date: dateStr,
                    price: dailyPrice,
                    currency: "KRW",
                    lowestMerchant: "Coupang",
                });
            }
        }
        
        await batch.commit();
        
        // 기존 제품에 offers 추가
        const existingProducts = await admin.firestore().collection("products").limit(20).get();
        const updateBatch = admin.firestore().batch();
        let offersAdded = 0;
        
        for (const productDoc of existingProducts.docs) {
            const product = productDoc.data();
            const offersSnap = await productDoc.ref.collection("offers").limit(1).get();
            
            // offers가 없으면 추가
            if (offersSnap.empty) {
                const sampleOffers = [
                    {
                        merchant: "Coupang",
                        merchantName: "Coupang",
                        marketplace: "coupang",
                        url: `https://www.coupang.com/vp/products/${productDoc.id}`,
                        price: product.minPriceKrw || 1000000,
                        totalPrice: product.minPriceKrw || 1000000,
                        currency: "KRW",
                        shippingFee: 0,
                        inStock: true,
                    },
                    {
                        merchant: "Naver",
                        merchantName: "Naver Shopping",
                        marketplace: "naver",
                        url: `https://smartstore.naver.com/products/${productDoc.id}`,
                        price: (product.minPriceKrw || 1000000) + 50000,
                        totalPrice: (product.minPriceKrw || 1000000) + 50000,
                        currency: "KRW",
                        shippingFee: 3000,
                        inStock: true,
                    },
                ];
                
                for (const offer of sampleOffers) {
                    const offerRef = productDoc.ref.collection("offers").doc();
                    updateBatch.set(offerRef, {
                        ...offer,
                        productId: productDoc.id,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                    offersAdded++;
                }
                
                // 가격 히스토리도 추가
                const histSnap = await productDoc.ref.collection("price_history").limit(1).get();
                if (histSnap.empty) {
                    const today = new Date();
                    for (let i = 30; i >= 0; i--) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toISOString().split('T')[0];
                        const randomFluct = 1 + (Math.random() * 0.1 - 0.05);
                        const dailyPrice = Math.floor((product.minPriceKrw || 1000000) * randomFluct);
                        
                        const histRef = productDoc.ref.collection("price_history").doc(dateStr);
                        updateBatch.set(histRef, {
                            timestamp: admin.firestore.Timestamp.fromDate(date),
                            date: dateStr,
                            price: dailyPrice,
                            currency: "KRW",
                            lowestMerchant: "Coupang",
                        });
                    }
                }
            }
        }
        
        if (offersAdded > 0) {
            await updateBatch.commit();
        }
        
        res.json({ 
            success: true, 
            message: `Added ${IPHONE_PRODUCTS.length} iPhone products and ${offersAdded} offers to existing products` 
        });
    } catch (error: any) {
        functions.logger.error("Seed failed", error);
        res.status(500).json({ error: "Seed failed", message: error.message });
    }
});
