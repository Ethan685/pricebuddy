import { predictPrice, ForecastInput } from './forecast';
import type { PriceHistoryPointDTO } from '@pricebuddy/core';

const mockHistory: PriceHistoryPointDTO[] = [
  { ts: '2023-01-01T00:00:00Z', totalPriceKrw: 100000 },
  { ts: '2023-01-02T00:00:00Z', totalPriceKrw: 105000 },
  { ts: '2023-01-03T00:00:00Z', totalPriceKrw: 110000 },
];

// Trend: +5000/day. last day index=2, target day=9 => 145000
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
  process.exit(1);
}
