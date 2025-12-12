export type Marketplace = "coupang" | "naver" | "gmarket" | "11st" | "amazon_jp" | "rakuten" | "mercari" | "yahoo_jp" | "amazon_us" | "amazon_ca" | "ebay" | "ebay_us" | "walmart" | "target" | "bestbuy" | "costco" | "newegg" | "amazon_uk" | "ebay_uk" | "asos" | "amazon_de" | "amazon_fr" | "amazon_it" | "amazon_es" | "ebay_de" | "ebay_fr" | "ebay_it" | "ebay_es" | "zalando" | "mediamarkt" | "saturn" | "otto" | "bol" | "cdiscount" | "fnac" | "amazon_au" | "amazon_sg" | "ebay_au" | "lazada" | "shopee" | "jd" | "flipkart" | "amazon_mx" | "amazon_br" | "mercadolibre" | "aliexpress" | "taobao" | "tmall" | "etsy" | "wish" | "wayfair" | "overstock" | "g2a" | "allegro";
export interface Product {
    id: string;
    title: string;
    brand?: string;
    imageUrl?: string;
    categoryPath: string[];
    attributes: Record<string, string>;
}
//# sourceMappingURL=product.d.ts.map