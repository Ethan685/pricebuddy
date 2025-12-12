/**
 * Price Validator
 * Validates price data and detects anomalies
 */
export class PriceValidator {
    /**
     * Validate if price is reasonable
     */
    validate(price: number, currency: string = 'KRW'): boolean {
        // Price must be positive
        if (price <= 0) {
            console.warn(`Invalid price: ${price} (must be positive)`);
            return false;
        }

        // Price must not be unreasonably high
        const maxPrices: { [key: string]: number } = {
            KRW: 100000000,  // 1억원
            USD: 100000,     // $100k
            EUR: 100000,
            JPY: 10000000,   // 1천만엔
            CNY: 1000000     // 100만위안
        };

        const maxPrice = maxPrices[currency] || maxPrices.KRW;
        if (price > maxPrice) {
            console.warn(`Price too high: ${price} ${currency}`);
            return false;
        }

        // Check decimal places (should be reasonable)
        const decimalPlaces = price.toString().split('.')[1]?.length || 0;
        if (decimalPlaces > 2 && currency !== 'KRW') {
            console.warn(`Too many decimal places: ${price}`);
            return false;
        }

        return true;
    }

    /**
     * Detect price anomalies in history using statistical methods
     * @returns Array of booleans indicating if each price is an anomaly
     */
    detectAnomalies(prices: number[]): boolean[] {
        if (prices.length < 3) {
            return prices.map(() => false);
        }

        // Calculate mean and standard deviation
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);

        // Mark as anomaly if beyond 3 standard deviations
        return prices.map(price => {
            const zScore = Math.abs((price - mean) / stdDev);
            return zScore > 3;
        });
    }

    /**
     * Check if price change is reasonable
     */
    validatePriceChange(oldPrice: number, newPrice: number, maxChangePercent: number = 50): boolean {
        if (oldPrice <= 0 || newPrice <= 0) return false;

        const changePercent = Math.abs((newPrice - oldPrice) / oldPrice) * 100;

        if (changePercent > maxChangePercent) {
            console.warn(`Unusual price change: ${oldPrice} → ${newPrice} (${changePercent.toFixed(1)}%)`);
            return false;
        }

        return true;
    }

    /**
     * Sanitize price (remove invalid characters, parse)
     */
    sanitizePrice(priceString: string): number | null {
        if (!priceString) return null;

        // Remove currency symbols and thousands separators
        const cleaned = priceString
            .replace(/[₩$€£¥,]/g, '')
            .replace(/\s+/g, '')
            .trim();

        const parsed = parseFloat(cleaned);

        return isNaN(parsed) ? null : parsed;
    }
}

// Singleton instance
export const priceValidator = new PriceValidator();
