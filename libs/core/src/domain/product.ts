export type Marketplace =
  // 한국
  | "coupang"
  | "naver"
  | "gmarket"
  | "11st"
  // 일본
  | "amazon_jp"
  | "rakuten"
  | "mercari"
  | "yahoo_jp"
  // 미국/캐나다
  | "amazon_us"
  | "amazon_ca"
  | "ebay"
  | "ebay_us"
  | "walmart"
  | "target"
  | "bestbuy"
  | "costco"
  | "newegg"
  // 영국
  | "amazon_uk"
  | "ebay_uk"
  | "asos"
  // 유럽
  | "amazon_de"
  | "amazon_fr"
  | "amazon_it"
  | "amazon_es"
  | "ebay_de"
  | "ebay_fr"
  | "ebay_it"
  | "ebay_es"
  | "zalando"
  | "mediamarkt"
  | "saturn"
  | "otto"
  | "bol"
  | "cdiscount"
  | "fnac"
  // 아시아 태평양
  | "amazon_au"
  | "amazon_sg"
  | "ebay_au"
  | "lazada"
  | "shopee"
  | "jd"
  | "flipkart"
  // 라틴 아메리카
  | "amazon_mx"
  | "amazon_br"
  | "mercadolibre"
  // 중국
  | "aliexpress"
  | "taobao"
  | "tmall"
  // 기타
  | "etsy"
  | "wish"
  | "wayfair"
  | "overstock"
  | "g2a"
  | "allegro";

export interface Product {
  id: string; // 내부 SKU
  title: string;
  brand?: string;
  imageUrl?: string;
  categoryPath: string[];
  attributes: Record<string, string>;
}

