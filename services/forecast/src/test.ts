import { predictPrice, ForecastInput } from './forecast';
import { PriceHistoryPoint } from '@pricebuddy/core';

const mockHistory: PriceHistoryPoint[] = [
    { offerId: '1', ts: '2023-01-01T00:00:00Z', price: 100, totalPriceKrw: 100000 },
    { offerId: '1', ts: '2023-01-02T00:00:00Z', price: 100, totalPriceKrw: 105000 },
    { offerId: '1', ts: '2023-01-03T00:00:00Z', price: 100, totalPriceKrw: 110000 },
];
// Trend: +5000 per day. Day 4 should be 115000. Day 10 (7 days ahead from last) -> 110 + 7*5 = 145000?
// wait, logic is daysAhead from LAST point.
// last point is day 2 (0-indexed days: 0, 1, 2). target is 2 + 7 = 9.
// slope = 5000. intercept = 100000.
// y = 5000x + 100000.
// x=9 -> 45000 + 100000 = 145000. Correct.

const input: ForecastInput = {
    history: mockHistory,
    daysAhead: 7
};

console.log('Running Forecast Test...');
const result = predictPrice(input);
console.log('Result:', result);

if (result.predictedPrice === 145000 && result.trend === 'UP') {
    console.log('[PASS] Forecast Logic Verified');
} else {
    console.error('[FAIL] Forecast output incorrect');
}
