import React from 'react';

interface PriceDisplayProps {
    price: number;
    currency: string;
    priceKRW?: number;
    showConversion?: boolean;
}

const CURRENCY_SYMBOLS: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    KRW: '₩',
    SGD: 'S$',
    AUD: 'A$',
    CAD: 'C$'
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
    price,
    currency,
    priceKRW,
    showConversion = true
}) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const isKRW = currency === 'KRW';

    const formatPrice = (amount: number, curr: string) => {
        if (curr === 'KRW' || curr === 'JPY') {
            return Math.round(amount).toLocaleString();
        }
        return amount.toFixed(2);
    };

    return (
        <div className="inline-flex flex-col items-start">
            {/* Original Price */}
            {!isKRW && (
                <div className="text-[#9BA7B4] text-sm">
                    {symbol}{formatPrice(price, currency)}
                </div>
            )}

            {/* KRW Price (Main) */}
            <div className="text-white font-bold text-xl">
                ₩{formatPrice(priceKRW || price, 'KRW')}
            </div>

            {/* Conversion Note */}
            {!isKRW && showConversion && (
                <div className="text-xs text-[#9BA7B4]">
                    * 환율 적용 예상가
                </div>
            )}
        </div>
    );
};

interface ShippingInfoProps {
    productPrice: number;
    currency: string;
    priceKRW?: number;  // Use server-calculated price
    destination?: string;
}

export const ShippingCalculator: React.FC<ShippingInfoProps> = ({
    productPrice,
    currency,
    priceKRW,
    // destination = 'KR'
}) => {
    // Proper exchange rates (fallback only if priceKRW not provided)
    const EXCHANGE_RATES: { [key: string]: number } = {
        USD: 1330,
        EUR: 1450,
        GBP: 1680,
        JPY: 8.9,
        CNY: 184,
        SGD: 990,
        AUD: 875,
        CAD: 978
    };

    // Simple shipping estimation
    const calculate = () => {
        if (currency === 'KRW') {
            return { shipping: 0, customs: 0, vat: 0, total: productPrice };
        }

        // Use server-calculated priceKRW if available, otherwise calculate
        const convertedPrice = priceKRW || Math.round(productPrice * (EXCHANGE_RATES[currency] || 1000));

        // Shipping estimate
        const shipping = 25000; // ~₩25,000 average

        // Customs (if > ₩150,000)
        const customs = convertedPrice > 150000 ? Math.round(convertedPrice * 0.08) : 0;

        // VAT 10%
        const vat = Math.round((convertedPrice + customs) * 0.1);

        const total = Math.round(convertedPrice + shipping + customs + vat);

        return { shipping, customs, vat, total, priceKRW: convertedPrice };
    };

    const costs = calculate();

    if (currency === 'KRW') {
        return null; // No shipping info for domestic
    }

    return (
        <div className="mt-3 p-4 bg-[#161B22] border border-[#30363D] rounded-lg">
            <h4 className="font-bold text-white mb-3 text-sm">🚚 직구 시 예상 비용</h4>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-[#9BA7B4]">제품 가격:</span>
                    <span className="text-white">₩{costs.priceKRW?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-[#9BA7B4]">배송비:</span>
                    <span className="text-white">₩{costs.shipping.toLocaleString()}</span>
                </div>

                {costs.customs > 0 && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-[#9BA7B4]">관세 (8%):</span>
                            <span className="text-orange-400">₩{costs.customs.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#9BA7B4]">부가세 (10%):</span>
                            <span className="text-orange-400">₩{costs.vat.toLocaleString()}</span>
                        </div>
                    </>
                )}

                <div className="border-t border-[#30363D] pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                        <span className="text-white">총 예상 비용:</span>
                        <span className="text-[#4F7EFF] text-lg">₩{costs.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="mt-3 text-xs text-[#9BA7B4]">
                * 실제 비용은 변동될 수 있습니다
            </div>
        </div>
    );
};
