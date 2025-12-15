import { computePrice } from './index';
import { Marketplace } from '@pricebuddy/core';

// Helper to log test
function test(name: string, actual: any, expected: any) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        console.error(`[FAIL] ${name}\nExpected: ${JSON.stringify(expected)}\nActual:   ${JSON.stringify(actual)}`);
    } else {
        console.log(`[PASS] ${name}`);
    }
}

// 1. KR Import with Tax (Expensive item)
const res1 = computePrice({
    marketplace: Marketplace.AMAZON,
    country: 'KR',
    basePrice: 200, // $200 USD
    currency: 'USD',
    weightKg: 2
});
// 200 * 1400 = 280,000 KRW
// Shipping: 7000 + 2*1200 = 9400 KRW
// Taxable: 289,400. Threshold 150,000.
// BUT tax rate is 0.1 for KR? My rule said over 150k gets taxed. 
// Let's check logic: taxableValue = item + shipping. if > 150k, tax = total * 0.1
// 289,400 * 0.1 = 28,940
console.log('Result 1:', res1);

// 2. KR Domestic (Coupang)
const res2 = computePrice({
    marketplace: 'coupang',
    country: 'KR',
    basePrice: 50000,
    currency: 'KRW',
    weightKg: 1
});
// 50000 * 1 = 50000
// Shipping: 2500 + 0 = 2500
// Taxable: 52500 < 150000 -> 0 tax? Or domestic tax logic?
// My code currently applies Import rules to KR generically. 
// Domestic items usually include VAT. Let's assume input price is pre-tax or tax-included?
// Current logic: if > 150k, 10%. So 50k -> 0 tax added by engine.
console.log('Result 2:', res2);
