import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface PricePoint {
    price: number;
    date: Date;
}

interface PredictionResult {
    signal: 'BUY_NOW' | 'WAIT' | 'NEUTRAL';
    confidence: number; // 0.0 to 1.0
    targetPrice?: number;
    reason: string;
}

export const predictPrice = functions.https.onCall(async (data, context) => {
    // In production, this might be an internal helper, or cached.
    // exposed as onCall for direct client usage or testing.

    const { productId, currentPrice } = data;
    if (!productId || !currentPrice) {
        throw new functions.https.HttpsError("invalid-argument", "Missing productId or currentPrice");
    }

    const db = admin.firestore();

    // Fetch History (Simplified: getting last 50 entries)
    // Real implementation would query a dedicated subcollection or time-series DB
    const historySnap = await db.collection("price_history")
        .where("productId", "==", productId)
        .orderBy("ts", "desc")
        .limit(50)
        .get();

    if (historySnap.empty) {
        return {
            signal: 'NEUTRAL',
            confidence: 0.1,
            reason: "Not enough data"
        };
    }

    const prices: PricePoint[] = historySnap.docs.map(doc => ({
        price: doc.data().price,
        date: doc.data().ts.toDate()
    }));

    // Add current price to head if not present
    if (prices.length === 0 || prices[0].price !== currentPrice) {
        prices.unshift({ price: currentPrice, date: new Date() });
    }

    // Analysis
    // 1. Calculate Averages
    const pricesIs = prices.map(p => p.price);
    const avg7 = average(pricesIs.slice(0, 7));
    const avg30 = average(pricesIs.slice(0, 30));
    const min30 = Math.min(...pricesIs.slice(0, 30));
    const max30 = Math.max(...pricesIs.slice(0, 30));

    let signal: PredictionResult['signal'] = 'NEUTRAL';
    let confidence = 0.5;
    let reason = "Market is stable.";

    // Logic Rules
    if (currentPrice <= min30) {
        // All time low (last 30 days)
        signal = 'BUY_NOW';
        confidence = 0.95;
        reason = "Lowest price in 30 days!";
    } else if (currentPrice < avg30 * 0.9) {
        // Significantly below average
        signal = 'BUY_NOW';
        confidence = 0.8;
        reason = "10% below 30-day average.";
    } else if (currentPrice > avg7 * 1.1) {
        // Spike detected
        signal = 'WAIT';
        confidence = 0.85;
        reason = `Price spiked above recent average (${Math.round(avg7)}).`;
    } else if (currentPrice > max30 * 0.95) {
        // Near highs
        signal = 'WAIT';
        confidence = 0.9;
        reason = "Near 30-day high.";
    } else {
        // Middle of the range
        // Check trend?
        if (avg7 < avg30) {
            signal = 'BUY_NOW';
            confidence = 0.6; // Weak buy, downtrend
            reason = "Price is trending down.";
        } else {
            signal = 'NEUTRAL';
            reason = "Price is within normal range.";
        }
    }

    return {
        signal,
        confidence,
        targetPrice: signal === 'WAIT' ? Math.min(avg30, min30 * 1.05) : undefined,
        reason
    };
});

function average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}
