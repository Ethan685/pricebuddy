"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundMoney = exports.formatMoney = void 0;
/**
 * Formats a number as a currency string.
 * @param amount The numerical amount
 * @param currency The currency code (e.g., 'KRW', 'USD', 'JPY')
 * @param locale The locale string (e.g., 'ko-KR', 'en-US')
 */
const formatMoney = (amount, currency, locale = 'ko-KR') => {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2
        }).format(amount);
    }
    catch (error) {
        // Fallback formatting if Intl fails or invalid code
        return `${currency} ${amount.toFixed(2)}`;
    }
};
exports.formatMoney = formatMoney;
/**
 * rounds a number to a specific precision
 */
const roundMoney = (amount, precision = 2) => {
    const factor = Math.pow(10, precision);
    return Math.round(amount * factor) / factor;
};
exports.roundMoney = roundMoney;
//# sourceMappingURL=Money.js.map