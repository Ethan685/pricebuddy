import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * 구매 내역 조회 HTTP 엔드포인트
 * GET /purchases?userId=...
 */
export const purchases = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
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
        const userId = req.query.userId as string;
        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        const db = admin.firestore();
        
        // 사용자의 구매 내역 조회
        const purchasesSnap = await db.collection("users")
            .doc(userId)
            .collection("purchases")
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        const purchases = purchasesSnap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                productId: data.productId || "",
                productTitle: data.productTitle || data.title || "",
                productImageUrl: data.productImageUrl || data.imageUrl || "",
                price: data.price || data.totalPrice || 0,
                originalPrice: data.originalPrice || data.price || 0,
                saved: data.saved || 0,
                savedPercent: data.savedPercent || 0,
                marketplace: data.marketplace || "",
                purchasedAt: data.purchasedAt || data.createdAt || new Date().toISOString(),
                status: data.status || "completed",
            };
        });

        // 통계 계산
        const totalCount = purchases.length;
        const totalSaved = purchases.reduce((sum, p) => sum + (p.saved || 0), 0);
        const averageSavedPercent = totalCount > 0 
            ? purchases.reduce((sum, p) => sum + (p.savedPercent || 0), 0) / totalCount 
            : 0;

        res.json({
            purchases,
            stats: {
                totalCount,
                totalSaved,
                averageSavingsRate: Math.round(averageSavedPercent * 10) / 10,
            },
        });
    } catch (error: any) {
        functions.logger.error("Get purchases failed", error);
        res.status(500).json({ error: "Failed to fetch purchases", message: error.message });
    }
});

