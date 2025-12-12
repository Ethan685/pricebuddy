import type { Marketplace } from "@pricebuddy/core";

export interface ShippingRule {
  marketplace: Marketplace;
  baseFee: number;     // KRW
  perKgFee: number;    // 1kg 당 원화
}

export const SHIPPING_RULES: ShippingRule[] = [
  // 한국
  { marketplace: "coupang", baseFee: 3000, perKgFee: 800 },
  { marketplace: "naver", baseFee: 2500, perKgFee: 700 },
  { marketplace: "gmarket", baseFee: 3000, perKgFee: 800 },
  { marketplace: "11st", baseFee: 3000, perKgFee: 800 },
  
  // 일본
  { marketplace: "amazon_jp", baseFee: 7000, perKgFee: 1200 },
  { marketplace: "rakuten", baseFee: 5000, perKgFee: 1000 },
  { marketplace: "mercari", baseFee: 6000, perKgFee: 1100 },
  { marketplace: "yahoo_jp", baseFee: 5500, perKgFee: 1000 },
  
  // Amazon 계열
  { marketplace: "amazon_us", baseFee: 15000, perKgFee: 2000 },
  { marketplace: "amazon_uk", baseFee: 12000, perKgFee: 1800 },
  { marketplace: "amazon_ca", baseFee: 14000, perKgFee: 1900 },
  { marketplace: "amazon_de", baseFee: 13000, perKgFee: 1900 },
  { marketplace: "amazon_fr", baseFee: 13000, perKgFee: 1900 },
  { marketplace: "amazon_it", baseFee: 13000, perKgFee: 1900 },
  { marketplace: "amazon_es", baseFee: 13000, perKgFee: 1900 },
  { marketplace: "amazon_au", baseFee: 12000, perKgFee: 1800 },
  { marketplace: "amazon_sg", baseFee: 8000, perKgFee: 1200 },
  { marketplace: "amazon_mx", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "amazon_br", baseFee: 11000, perKgFee: 1600 },
  
  // 미국 소매업체
  { marketplace: "walmart", baseFee: 12000, perKgFee: 1800 },
  { marketplace: "target", baseFee: 12000, perKgFee: 1800 },
  { marketplace: "bestbuy", baseFee: 13000, perKgFee: 1900 },
  { marketplace: "costco", baseFee: 14000, perKgFee: 2000 },
  { marketplace: "newegg", baseFee: 11000, perKgFee: 1700 },
  
  // eBay 계열
  { marketplace: "ebay", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "ebay_us", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "ebay_uk", baseFee: 9000, perKgFee: 1400 },
  { marketplace: "ebay_de", baseFee: 9500, perKgFee: 1450 },
  { marketplace: "ebay_fr", baseFee: 9500, perKgFee: 1450 },
  { marketplace: "ebay_it", baseFee: 9500, perKgFee: 1450 },
  { marketplace: "ebay_es", baseFee: 9500, perKgFee: 1450 },
  { marketplace: "ebay_au", baseFee: 9000, perKgFee: 1400 },
  
  // 동남아시아
  { marketplace: "shopee", baseFee: 4000, perKgFee: 700 },
  { marketplace: "lazada", baseFee: 4500, perKgFee: 750 },
  
  // 중국
  { marketplace: "aliexpress", baseFee: 5000, perKgFee: 800 },
  { marketplace: "taobao", baseFee: 6000, perKgFee: 900 },
  { marketplace: "tmall", baseFee: 6000, perKgFee: 900 },
  { marketplace: "jd", baseFee: 5500, perKgFee: 850 },
  
  // 인도
  { marketplace: "flipkart", baseFee: 7000, perKgFee: 1100 },
  
  // 라틴 아메리카
  { marketplace: "mercadolibre", baseFee: 8000, perKgFee: 1200 },
  
  // 유럽
  { marketplace: "zalando", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "mediamarkt", baseFee: 11000, perKgFee: 1600 },
  { marketplace: "saturn", baseFee: 11000, perKgFee: 1600 },
  { marketplace: "otto", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "bol", baseFee: 9500, perKgFee: 1450 },
  { marketplace: "cdiscount", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "fnac", baseFee: 10000, perKgFee: 1500 },
  { marketplace: "asos", baseFee: 9000, perKgFee: 1400 },
  
  // 기타
  { marketplace: "etsy", baseFee: 8000, perKgFee: 1200 },
  { marketplace: "wish", baseFee: 5000, perKgFee: 800 },
  { marketplace: "wayfair", baseFee: 12000, perKgFee: 1800 },
  { marketplace: "overstock", baseFee: 11000, perKgFee: 1700 },
  { marketplace: "g2a", baseFee: 0, perKgFee: 0 }, // 디지털 상품
  { marketplace: "allegro", baseFee: 6000, perKgFee: 900 },
];

