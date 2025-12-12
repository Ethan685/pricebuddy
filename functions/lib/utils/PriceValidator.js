"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceValidator = exports.PriceValidator = void 0;
/**
 * Price Validator
 * Validates price data and detects anomalies
 */
class PriceValidator {
    /**
     * Validate if price is reasonable
     */
    validate(price, currency = 'KRW') {
        var _a;
        // Price must be positive
        if (price <= 0) {
            console.warn(`Invalid price: ${price} (must be positive)`);
            return false;
        }
        // Price must not be unreasonably high
        const maxPrices = {
            KRW: 100000000,
            USD: 100000,
            EUR: 100000,
            JPY: 10000000,
            CNY: 1000000 // 100만위안
        };
        const maxPrice = maxPrices[currency] || maxPrices.KRW;
        if (price > maxPrice) {
            console.warn(`Price too high: ${price} ${currency}`);
            return false;
        }
        // Check decimal places (should be reasonable)
        const decimalPlaces = ((_a = price.toString().split('.')[1]) === null || _a === void 0 ? void 0 : _a.length) || 0;
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
    detectAnomalies(prices) {
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
    validatePriceChange(oldPrice, newPrice, maxChangePercent = 50) {
        if (oldPrice <= 0 || newPrice <= 0)
            return false;
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
    sanitizePrice(priceString) {
        if (!priceString)
            return null;
        // Remove currency symbols and thousands separators
        const cleaned = priceString
            .replace(/[₩$€£¥,]/g, '')
            .replace(/\s+/g, '')
            .trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
    }
}
exports.PriceValidator = PriceValidator;
// Singleton instance
exports.priceValidator = new PriceValidator();
//# sourceMappingURL=PriceValidator.js.map