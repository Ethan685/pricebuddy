import { PriceHistoryPoint } from '@pricebuddy/core';
import * as ss from 'simple-statistics';

export interface ForecastInput {
    history: PriceHistoryPoint[];
    daysAhead?: number; // Default 7
}

export interface ForecastResult {
    currentPrice: number;
    predictedPrice: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    confidence: number; // 0-1, naive confidence based on r-squared
}

export function predictPrice(input: ForecastInput): ForecastResult {
    const { history, daysAhead = 7 } = input;

    if (history.length < 2) {
        throw new Error("Insufficient history for prediction");
    }

    // Sort by date
    const sorted = [...history].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    // Prepare data for regression: [timestamp, price]
    // Normalize timestamp to days from start to keep numbers manageable
    const startTime = new Date(sorted[0].ts).getTime();
    const data: number[][] = sorted.map(p => {
        const days = (new Date(p.ts).getTime() - startTime) / (1000 * 3600 * 24);
        return [days, p.totalPriceKrw];
    });

    // Calculate Linear Regression
    const line = ss.linearRegression(data);
    const lineFunc = ss.linearRegressionLine(line);
    const rSquared = ss.rSquared(data, lineFunc);

    // Predict future
    const lastDay = data[data.length - 1][0];
    const targetDay = lastDay + daysAhead;
    const predictedPrice = Math.round(lineFunc(targetDay));
    const currentPrice = sorted[sorted.length - 1].totalPriceKrw;

    // Determine Trend
    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (predictedPrice > currentPrice * 1.02) trend = 'UP';
    else if (predictedPrice < currentPrice * 0.98) trend = 'DOWN';

    return {
        currentPrice,
        predictedPrice,
        trend,
        confidence: Math.min(Math.max(rSquared, 0), 1) // Clamp 0-1
    };
}
