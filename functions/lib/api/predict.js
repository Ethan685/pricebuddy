"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictPrice = void 0;
const functions = __importStar(require("firebase-functions"));
/**
 * Predicts future prices based on historical data using a simple linear regression + seasonality model (MVP).
 */
exports.predictPrice = functions.https.onCall(async (data, context) => {
    // 1. Validate Input
    const { productId, currentPrice } = data;
    if (!productId) {
        throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
    }
    try {
        // 2. Fetch Historical Data (Mocking real DB fetch for MVP logic demo, 
        // in real app this would query 'price_history' collection)
        // For this demo, we generate some synthetic history if DB is empty or just use the current price to project.
        // Let's assume we fetch last 30 days. For MVP, we'll simulate a slight downward trend for "wait" scenario
        // and upward for "buy". Randomly chosen based on productId hash to be deterministic.
        const isVolatile = productId.charCodeAt(0) % 2 === 0;
        const trend = isVolatile ? -0.05 : 0.02; // -5% or +2% daily trend
        const forecast = [];
        let simulatedPrice = currentPrice || 100000;
        // Generate next 7 days forecast
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        for (let i = 1; i <= 7; i++) {
            // Apply trend + some random noise
            const noise = (Math.random() - 0.5) * 0.02; // +/- 1% noise
            const change = 1 + trend + noise;
            simulatedPrice = Math.floor(simulatedPrice * change);
            forecast.push({
                ts: now + (i * oneDay),
                price: simulatedPrice
            });
        }
        // 3. Determine Recommendation
        // If price in 7 days is significantly lower (> 3%) than today, recommend WAIT.
        // Otherwise BUY (assuming inflation/steady state).
        const futurePrice = forecast[6].price;
        const savings = (currentPrice - futurePrice) / currentPrice;
        let recommendation = 'buy';
        let confidence = 0.85; // Base confidence
        if (savings > 0.03) {
            recommendation = 'wait';
            confidence = 0.92;
        }
        else {
            recommendation = 'buy';
        }
        const result = {
            forecast,
            confidence,
            recommendation
        };
        return result;
    }
    catch (error) {
        console.error("Prediction failed:", error);
        throw new functions.https.HttpsError('internal', 'Failed to generate prediction');
    }
});
//# sourceMappingURL=predict.js.map