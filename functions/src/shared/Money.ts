/**
 * Formats a number as a currency string.
 * @param amount The numerical amount
 * @param currency The currency code (e.g., 'KRW', 'USD', 'JPY')
 * @param locale The locale string (e.g., 'ko-KR', 'en-US')
 */
export const formatMoney = (amount: number, currency: string, locale: string = 'ko-KR'): string => {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: currency === 'KRW' || currency === 'JPY' ? 0 : 2
        }).format(amount);
    } catch (error) {
        // Fallback formatting if Intl fails or invalid code
        return `${currency} ${amount.toFixed(2)}`;
    }
};

/**
 * rounds a number to a specific precision
 */
export const roundMoney = (amount: number, precision: number = 2): number => {
    const factor = Math.pow(10, precision);
    return Math.round(amount * factor) / factor;
};
