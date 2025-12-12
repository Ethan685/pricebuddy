import * as admin from 'firebase-admin';

interface ExchangeRates {
    [currency: string]: number;
}

interface CachedRates {
    rates: ExchangeRates;
    timestamp: number;
}

/**
 * Currency Service for real-time exchange rate conversion
 * Uses exchangerate-api.com free tier (1,500 requests/month)
 */
export class CurrencyService {
    private static instance: CurrencyService;
    private cache: CachedRates | null = null;
    private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
    private readonly API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

    private constructor() { }

    static getInstance(): CurrencyService {
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
    async convert(amount: number, from: string, to: string = 'KRW'): Promise<number> {
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
    async convertBatch(
        prices: Array<{ amount: number; from: string }>,
        to: string = 'KRW'
    ): Promise<number[]> {
        const rates = await this.getRates();

        return prices.map(({ amount, from }) => {
            if (from === to) return amount;

            const usdPerFrom = from === 'USD' ? 1 : 1 / rates[from];
            const toPerUsd = to === 'USD' ? 1 : rates[to];
            const converted = amount * usdPerFrom * toPerUsd;

            return Math.round(converted);
        });
    }

    /**
     * Get current exchange rates (cached)
     */
    async getRates(): Promise<ExchangeRates> {
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
        } catch (error) {
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
    async getRate(from: string, to: string = 'KRW'): Promise<number> {
        if (from === to) return 1;

        const rates = await this.getRates();

        // Convert through USD
        const rateToUSD = from === 'USD' ? 1 : 1 / rates[from];
        const rateToTarget = to === 'USD' ? 1 : rates[to];

        return rateToUSD * rateToTarget;
    }

    /**
     * Cache rates to Firestore
     */
    private async cacheToFirestore(cache: CachedRates): Promise<void> {
        try {
            const db = admin.firestore();
            await db.collection('system').doc('exchange_rates').set({
                rates: cache.rates,
                timestamp: cache.timestamp,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Failed to cache rates to Firestore:', error);
        }
    }

    /**
     * Get cached rates from Firestore
     */
    private async getCachedFromFirestore(): Promise<CachedRates | null> {
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
        } catch (error) {
            console.error('Failed to get cached rates from Firestore:', error);
        }

        return null;
    }

    /**
     * Fallback exchange rates (updated manually)
     */
    private getFallbackRates(): ExchangeRates {
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
    formatPrice(amount: number, currency: string): string {
        const symbols: { [key: string]: string } = {
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

// Export singleton instance
export const currencyService = CurrencyService.getInstance();
