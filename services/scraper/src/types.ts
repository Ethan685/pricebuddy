// Marketplace 타입 직접 정의 (의존성 문제 해결)
export type Marketplace = 
  | "coupang" | "naver" | "auction" | "interpark" | "tmon" | "wemakeprice"
  | "amazon_us" | "amazon_uk" | "amazon_ca" | "amazon_de" | "amazon_fr" | "amazon_it" | "amazon_es" | "amazon_au" | "amazon_sg" | "amazon_mx" | "amazon_br" | "amazon_jp"
  | "rakuten" | "mercari" | "yahoo_jp"
  | "walmart" | "target" | "bestbuy" | "costco" | "newegg"
  | "ebay" | "ebay_us" | "ebay_uk" | "ebay_de" | "ebay_fr" | "ebay_it" | "ebay_es" | "ebay_au"
  | "shopee" | "lazada"
  | "aliexpress" | "jd" | "taobao" | "tmall"
  | "flipkart"
  | "mercadolibre"
  | "zalando" | "asos"
  | "mediamarkt" | "saturn" | "otto" | "bol" | "cdiscount" | "fnac"
  | "etsy" | "wish" | "wayfair" | "overstock" | "g2a" | "allegro";

export interface ScrapeRequest {
  marketplace: Marketplace;
  url: string;
}

export interface ScrapeResultRaw {
  marketplace: Marketplace;
  url: string;
  fetchedAt: string;
  html: string;
}

export interface ParsedOfferOutput {
  title: string;
  price?: number;
  basePrice?: number; // 호환성을 위해
  currency: string;
  imageUrl?: string;
  shippingFee?: number;
  attributes: Record<string, string>;
}

