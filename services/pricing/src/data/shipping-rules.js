"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIPPING_RULES = void 0;
exports.SHIPPING_RULES = [
    // 한국
    { marketplace: "coupang", baseFee: 3000, perKgFee: 800 },
    { marketplace: "naver", baseFee: 2500, perKgFee: 700 },
    { marketplace: "gmarket", baseFee: 3000, perKgFee: 800 },
    { marketplace: "11st", baseFee: 3000, perKgFee: 800 },
    { marketplace: "auction", baseFee: 3000, perKgFee: 800 },
    { marketplace: "interpark", baseFee: 3000, perKgFee: 800 },
    { marketplace: "tmon", baseFee: 2500, perKgFee: 700 },
    { marketplace: "wemakeprice", baseFee: 2500, perKgFee: 700 },
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
    // 추가 해외 마켓플레이스 (최적화된 배송비)
    // Amazon 지역별 최적화
    { marketplace: "amazon_jp", baseFee: 7000, perKgFee: 1200 }, // 일본 → 한국
    { marketplace: "amazon_uk", baseFee: 12000, perKgFee: 1800 }, // 영국 → 한국
    { marketplace: "amazon_ca", baseFee: 14000, perKgFee: 1900 }, // 캐나다 → 한국
    { marketplace: "amazon_de", baseFee: 13000, perKgFee: 1900 }, // 독일 → 한국
    { marketplace: "amazon_fr", baseFee: 13000, perKgFee: 1900 }, // 프랑스 → 한국
    { marketplace: "amazon_it", baseFee: 13000, perKgFee: 1900 }, // 이탈리아 → 한국
    { marketplace: "amazon_es", baseFee: 13000, perKgFee: 1900 }, // 스페인 → 한국
    { marketplace: "amazon_au", baseFee: 12000, perKgFee: 1800 }, // 호주 → 한국
    { marketplace: "amazon_sg", baseFee: 8000, perKgFee: 1200 }, // 싱가포르 → 한국
    { marketplace: "amazon_mx", baseFee: 10000, perKgFee: 1500 }, // 멕시코 → 한국
    { marketplace: "amazon_br", baseFee: 11000, perKgFee: 1600 }, // 브라질 → 한국
];
//# sourceMappingURL=shipping-rules.js.map