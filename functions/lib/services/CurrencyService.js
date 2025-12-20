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
exports.currencyService = exports.CurrencyService = void 0;
const admin = __importStar(require("firebase-admin"));
/**
 * Currency Service for real-time exchange rate conversion
 * Uses exchangerate-api.com free tier (1,500 requests/month)
 */
class CurrencyService {
    constructor() {
        this.cache = null;
        this.CACHE_DURATION = 60 * 60 * 1000; // 1 hour
        this.API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new CurrencyService();
        }
        return this.instance;
    }
    /**
     * Convert amount from one currency to another
     * @param amount Amount to convert
     * @param from Source currency code (USD, EUR, etc.)
     * @param to Target currency code (default: KRW)
     * @returns Converted amount rounded to whole number
     */
    async convert(amount, from, to = 'KRW') {
        if (from === to) {
            return amount;
        }
        const rates = await this.getRates();
        // All rates are relative to USD
        // To convert from X to Y: (amount in X) × (USD/X) × (Y/USD)
        const usdPerFrom = from === 'USD' ? 1 : 1 / rates[from];
        const toPerUsd = to === 'USD' ? 1 : rates[to];
        const convertedAmount = amount * usdPerFrom * toPerUsd;
        return Math.round(convertedAmount);
    }
    /**
     * Convert multiple prices at once
     */
    async convertBatch(prices, to = 'KRW') {
        const rates = await this.getRates();
        return prices.map(({ amount, from }) => {
            if (from === to)
                return amount;
            const usdPerFrom = from === 'USD' ? 1 : 1 / rates[from];
            const toPerUsd = to === 'USD' ? 1 : rates[to];
            const converted = amount * usdPerFrom * toPerUsd;
            return Math.round(converted);
        });
    }
    /**
     * Get current exchange rates (cached)
     */
    async getRates() {
        // Check cache
        const now = Date.now();
        if (this.cache && (now - this.cache.timestamp) < this.CACHE_DURATION) {
            return this.cache.rates;
        }
        // Fetch new rates
        try {
            const response = await fetch(this.API_URL);
            const data = await response.json();
            if (data && data.rates) {
                this.cache = {
                    rates: data.rates,
                    timestamp: now
                };
                // Optionally cache in Firestore for persistence
                await this.cacheToFirestore(this.cache);
                return data.rates;
            }
            throw new Error('Invalid response from exchange rate API');
        }
        catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            // Fallback to Firestore cache
            const cached = await this.getCachedFromFirestore();
            if (cached) {
                this.cache = cached;
                return cached.rates;
            }
            // Ultimate fallback: hardcoded rates
            return this.getFallbackRates();
        }
    }
    /**
     * Get specific exchange rate
     */
    async getRate(from, to = 'KRW') {
        if (from === to)
            return 1;
        const rates = await this.getRates();
        // Convert through USD
        const rateToUSD = from === 'USD' ? 1 : 1 / rates[from];
        const rateToTarget = to === 'USD' ? 1 : rates[to];
        return rateToUSD * rateToTarget;
    }
    /**
     * Cache rates to Firestore
     */
    async cacheToFirestore(cache) {
        try {
            const db = admin.firestore();
            await db.collection('system').doc('exchange_rates').set({
                rates: cache.rates,
                timestamp: cache.timestamp,
                updatedAt: new Date()
            });
        }
        catch (error) {
            console.error('Failed to cache rates to Firestore:', error);
        }
    }
    /**
     * Get cached rates from Firestore
     */
    async getCachedFromFirestore() {
        try {
            const db = admin.firestore();
            const doc = await db.collection('system').doc('exchange_rates').get();
            if (doc.exists) {
                const data = doc.data();
                return {
                    rates: data?.rates || {},
                    timestamp: data?.timestamp || 0
                };
            }
        }
        catch (error) {
            console.error('Failed to get cached rates from Firestore:', error);
        }
        return null;
    }
    /**
     * Fallback exchange rates (updated manually)
     */
    getFallbackRates() {
        return {
            USD: 1,
            KRW: 1330,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149,
            CNY: 7.24,
            SGD: 1.34,
            AUD: 1.52,
            CAD: 1.36,
            HKD: 7.83,
            TWD: 31.5,
            THB: 35.5,
            VND: 24500,
            IDR: 15600,
            MYR: 4.72,
            PHP: 56
        };
    }
    /**
     * Format price with currency symbol
     */
    formatPrice(amount, currency) {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            JPY: '¥',
            CNY: '¥',
            KRW: '₩'
        };
        const symbol = symbols[currency] || currency;
        if (currency === 'KRW' || currency === 'JPY') {
            return `${symbol}${Math.round(amount).toLocaleString()}`;
        }
        return `${symbol}${amount.toFixed(2)}`;
    }
}
exports.CurrencyService = CurrencyService;
// Export singleton instance
exports.currencyService = CurrencyService.getInstance();
