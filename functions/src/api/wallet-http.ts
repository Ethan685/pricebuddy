import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * 지갑 잔액 및 거래 내역 조회 HTTP 엔드포인트
 * GET /wallet/balance?userId=...
 * GET /wallet/transactions?userId=...
 */
export const wallet = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
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
        const path = req.path || "";
        const urlPath = path.split("?")[0]; // 쿼리 파라미터 제거

        if (urlPath.includes("/balance") || req.query.balance !== undefined) {
            // 잔액 조회
            const walletDoc = await db.collection("cashback_wallet").doc(userId).get();
            
            if (!walletDoc.exists) {
                res.json({ balance: 0, pending: 0, currency: "KRW" });
                return;
            }

            const walletData = walletDoc.data();
            res.json({
                balance: walletData?.balance || 0,
                pending: walletData?.pending || 0,
                currency: walletData?.currency || "KRW",
            });
        } else if (urlPath.includes("/transactions") || req.query.transactions !== undefined) {
            // 거래 내역 조회
            const transactionsSnap = await db.collection("cashback_ledger")
                .where("userId", "==", userId)
                .orderBy("createdAt", "desc")
                .limit(50)
                .get();

            const transactions = transactionsSnap.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate?.()?.toISOString() || 
                                data.createdAt || 
                                new Date().toISOString();
                
                return {
                    id: doc.id,
                    type: data.type || "unknown",
                    amount: data.amount || 0,
                    description: data.description || "",
                    status: data.status || "completed",
                    createdAt: createdAt,
                    balanceAfter: data.balanceAfter || 0,
                };
            });

            res.json({ transactions });
        } else {
            // 기본: 잔액과 거래 내역 모두 반환
            const walletDoc = await db.collection("cashback_wallet").doc(userId).get();
            const transactionsSnap = await db.collection("cashback_ledger")
                .where("userId", "==", userId)
                .orderBy("createdAt", "desc")
                .limit(50)
                .get();

            const balance = walletDoc.exists ? (walletDoc.data()?.balance || 0) : 0;
            const transactions = transactionsSnap.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate?.()?.toISOString() || 
                                data.createdAt || 
                                new Date().toISOString();
                
                return {
                    id: doc.id,
                    type: data.type || "unknown",
                    amount: data.amount || 0,
                    description: data.description || "",
                    status: data.status || "completed",
                    createdAt: createdAt,
                    balanceAfter: data.balanceAfter || 0,
                };
            });

            res.json({
                balance,
                transactions,
            });
        }
    } catch (error: any) {
        functions.logger.error("Get wallet data failed", error);
        res.status(500).json({ error: "Failed to fetch wallet data", message: error.message });
    }
});

