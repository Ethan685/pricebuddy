import type { PricingInput, PricingOutput, Marketplace } from "@pricebuddy/core";

// Pricing 엔진을 직접 구현 (pricing 서비스 의존성 완전 제거)

// 배송비 규칙
interface ShippingRule {
  marketplace: Marketplace;
  baseFee: number;
  perKgFee: number;
}

const SHIPPING_RULES: ShippingRule[] = [
  // 한국
  { marketplace: "coupang", baseFee: 3000, perKgFee: 800 },
  { marketplace: "naver", baseFee: 3000, perKgFee: 800 },
  { marketplace: "gmarket", baseFee: 3000, perKgFee: 800 },
  { marketplace: "11st", baseFee: 3000, perKgFee: 800 },
  { marketplace: "auction", baseFee: 3000, perKgFee: 800 },
  { marketplace: "interpark", baseFee: 3000, perKgFee: 800 },
  { marketplace: "tmon", baseFee: 2500, perKgFee: 700 },
  { marketplace: "wemakeprice", baseFee: 2500, perKgFee: 700 },
  // 일본
  { marketplace: "amazon_jp", baseFee: 7000, perKgFee: 1000 },
  { marketplace: "rakuten", baseFee: 8000, perKgFee: 1200 },
  // 미국/캐나다
  { marketplace: "amazon_us", baseFee: 15000, perKgFee: 2000 },
  { marketplace: "amazon_ca", baseFee: 16000, perKgFee: 2100 },
  { marketplace: "ebay", baseFee: 12000, perKgFee: 1800 },
  { marketplace: "walmart", baseFee: 14000, perKgFee: 2000 },
  { marketplace: "target", baseFee: 13000, perKgFee: 1900 },
  { marketplace: "bestbuy", baseFee: 15000, perKgFee: 2000 },
  { marketplace: "costco", baseFee: 14000, perKgFee: 2000 },
  { marketplace: "newegg", baseFee: 11000, perKgFee: 1700 },
  // 영국
  { marketplace: "amazon_uk", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "asos", baseFee: 9000, perKgFee: 1400 },
  // 유럽
  { marketplace: "amazon_de", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "amazon_fr", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "zalando", baseFee: 10000, perKgFee: 1500 },
  // 기타
  { marketplace: "aliexpress", baseFee: 5000, perKgFee: 800 },
];

// 세금 규칙
interface TaxRule {
  country: string;
  thresholdKrw: number;
  rate: number;
}

const TAX_RULES: TaxRule[] = [
  { country: "KR", thresholdKrw: 150000, rate: 0.0 },
  { country: "JP", thresholdKrw: 0, rate: 0.1 },
  { country: "US", thresholdKrw: 0, rate: 0.07 },
  { country: "GB", thresholdKrw: 0, rate: 0.2 },
  { country: "DE", thresholdKrw: 0, rate: 0.19 },
  { country: "FR", thresholdKrw: 0, rate: 0.2 },
  { country: "CN", thresholdKrw: 0, rate: 0.13 },
  { country: "CA", thresholdKrw: 0, rate: 0.13 },
  { country: "AU", thresholdKrw: 0, rate: 0.1 },
  { country: "SG", thresholdKrw: 0, rate: 0.07 },
];

// 환율 (간단한 하드코딩, 실제로는 API에서 가져와야 함)
function getRates(): Record<string, number> {
  return {
    USD: 1350,
    EUR: 1450,
    GBP: 1700,
    JPY: 9,
    CNY: 190,
    CAD: 1000,
    AUD: 900,
    SGD: 1000,
    KRW: 1,
  };
}

export const pricingClient = {
  compute(input: PricingInput, offer: any): any {
    const priced = computePrice(input);
    return {
      ...offer,
      itemPriceKrw: priced.itemPriceKrw,
      shippingFeeKrw: priced.shippingFeeKrw,
      taxFeeKrw: priced.taxFeeKrw,
      totalPriceKrw: priced.totalPriceKrw,
    };
  },
};

// Pricing 계산 함수
function computePrice(input: PricingInput): PricingOutput {
  const { marketplace, country, basePrice, currency, weightKg = 1 } = input;

  // 환율 조회
  const rates = getRates();
  const fx = currency === "KRW" ? 1 : (rates[currency] ?? 1);
  const itemPriceKrw = basePrice * fx;

  // 배송비 계산
  const shippingRule = SHIPPING_RULES.find(
    (r) => r.marketplace === marketplace
  );
  if (!shippingRule) {
    throw new Error(`No shipping rule for ${marketplace}`);
  }
  const shippingFeeKrw = shippingRule.baseFee + shippingRule.perKgFee * weightKg;

  // 세금 계산
  const taxRule = TAX_RULES.find((r) => r.country === country);
  if (!taxRule) {
    throw new Error(`No tax rule for ${country}`);
  }
  const taxable = Math.max(0, itemPriceKrw + shippingFeeKrw - taxRule.thresholdKrw);
  const taxFeeKrw = taxable * taxRule.rate;

  const totalPriceKrw = itemPriceKrw + shippingFeeKrw + taxFeeKrw;

  return {
    itemPriceKrw: Math.round(itemPriceKrw),
    shippingFeeKrw: Math.round(shippingFeeKrw),
    taxFeeKrw: Math.round(taxFeeKrw),
    totalPriceKrw: Math.round(totalPriceKrw),
  };
}
