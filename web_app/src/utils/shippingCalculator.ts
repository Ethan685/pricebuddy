/**
 * Calculate shipping cost and customs duties for international purchases
 */

interface ShippingCalculation {
    shipping: number;      // 배송비
    customs: number;       // 관세
    vat: number;          // 부가세
    total: number;        // 총 비용
    breakdown: string[];  // 비용 상세
}

/**
 * Calculate total cost including shipping and customs
 */
export function calculateInternationalCost(
    priceKRW: number,
    country: 'JP' | 'US' | 'CN' | 'EU'
): ShippingCalculation {
    let shipping = 0;
    let customsRate = 0;

    // Shipping costs by country (estimated)
    switch (country) {
        case 'JP':
            shipping = 15000; // 일본 → 한국 배송비 (평균)
            break;
        case 'US':
            shipping = 25000; // 미국 → 한국 배송비
            break;
        case 'CN':
            shipping = 8000;  // 중국 → 한국 배송비
            break;
        case 'EU':
            shipping = 30000; // 유럽 → 한국 배송비
            break;
    }

    // Customs duty calculation
    // 면세 한도: USD 150 이하는 면세
    const TAX_FREE_LIMIT_KRW = 200000; // 약 USD 150

    if (priceKRW <= TAX_FREE_LIMIT_KRW) {
        // 면세
        customsRate = 0;
    } else {
        // 일반적인 관세율 (제품에 따라 다름)
        customsRate = 0.08; // 8% (전자제품 평균)
    }

    const customs = Math.round((priceKRW + shipping) * customsRate);
    const vat = Math.round((priceKRW + shipping + customs) * 0.1); // 부가세 10%
    const total = priceKRW + shipping + customs + vat;

    const breakdown = [
        `제품 가격: ₩${priceKRW.toLocaleString()}`,
        `배송비: ₩${shipping.toLocaleString()}`,
    ];

    if (customs > 0) {
        breakdown.push(`관세 (8%): ₩${customs.toLocaleString()}`);
    }
    breakdown.push(`부가세 (10%): ₩${vat.toLocaleString()}`);

    return {
        shipping,
        customs,
        vat,
        total,
        breakdown
    };
}

/**
 * Get country code from merchant name
 */
export function getCountryFromMerchant(merchantName: string): 'JP' | 'US' | 'CN' | 'EU' | 'KR' {
    const name = merchantName.toLowerCase();

    if (name.includes('jp') || name.includes('japan') || name.includes('mercari') || name.includes('yahoo')) {
        return 'JP';
    }
    if (name.includes('amazon us') || name.includes('walmart') || name.includes('target')) {
        return 'US';
    }
    if (name.includes('taobao') || name.includes('jd.com') || name.includes('tmall')) {
        return 'CN';
    }
    if (name.includes('amazon uk') || name.includes('amazon de') || name.includes('amazon fr')) {
        return 'EU';
    }

    return 'KR';
}
