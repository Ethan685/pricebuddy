import type { ScrapeRequest, ParsedOfferOutput } from "./types";
import { fetchPage } from "./fetch-page";
import { parseCoupang } from "./parsers/coupang";
import { parseNaver } from "./parsers/naver";
import { parseWithConfig } from "./parsers/base";
import { amazonUsSelectors } from "./config/amazon-us";
import { amazonUkSelectors } from "./config/amazon-uk";
import { amazonCaSelectors } from "./config/amazon-ca";
import { amazonItSelectors } from "./config/amazon-it";
import { amazonEsSelectors } from "./config/amazon-es";
import { amazonAuSelectors } from "./config/amazon-au";
import { amazonMxSelectors } from "./config/amazon-mx";
import { amazonBrSelectors } from "./config/amazon-br";
import { rakutenSelectors } from "./config/rakuten";
import { mercariSelectors } from "./config/mercari";
import { yahooJpSelectors } from "./config/yahoo-jp";
import { ebaySelectors } from "./config/ebay";
import { aliexpressSelectors } from "./config/aliexpress";
import { walmartSelectors } from "./config/walmart";
import { targetSelectors } from "./config/target";
import { bestbuySelectors } from "./config/bestbuy";
import { shopeeSelectors } from "./config/shopee";
import { lazadaSelectors } from "./config/lazada";
import { jdSelectors } from "./config/jd";
import { flipkartSelectors } from "./config/flipkart";
import { mercadolibreSelectors } from "./config/mercadolibre";
import { auctionSelectors } from "./config/auction";
import { interparkSelectors } from "./config/interpark";
import { tmonSelectors } from "./config/tmon";
import { wemakepriceSelectors } from "./config/wemakeprice";
import { costcoSelectors } from "./config/costco";
import { neweggSelectors } from "./config/newegg";
import { zalandoSelectors } from "./config/zalando";
import { asosSelectors } from "./config/asos";

export async function scrapeOffer(
  req: ScrapeRequest
): Promise<ParsedOfferOutput> {
  const raw = await fetchPage(req);

  switch (req.marketplace) {
    case "coupang":
      return parseCoupang(raw);
    case "naver":
      return parseNaver(raw);
    // 한국 추가 쇼핑몰
    case "auction":
      return parseWithConfig(raw, auctionSelectors, "KRW");
    case "interpark":
      return parseWithConfig(raw, interparkSelectors, "KRW");
    case "tmon":
      return parseWithConfig(raw, tmonSelectors, "KRW");
    case "wemakeprice":
      return parseWithConfig(raw, wemakepriceSelectors, "KRW");
    // Amazon 계열
    case "amazon_us":
      return parseWithConfig(raw, amazonUsSelectors, "USD");
    case "amazon_uk":
      return parseWithConfig(raw, amazonUkSelectors, "GBP");
    case "amazon_ca":
      return parseWithConfig(raw, amazonCaSelectors, "CAD");
    case "amazon_de":
      return parseWithConfig(raw, amazonUsSelectors, "EUR");
    case "amazon_fr":
      return parseWithConfig(raw, amazonUsSelectors, "EUR");
    case "amazon_it":
      return parseWithConfig(raw, amazonItSelectors, "EUR");
    case "amazon_es":
      return parseWithConfig(raw, amazonEsSelectors, "EUR");
    case "amazon_au":
      return parseWithConfig(raw, amazonAuSelectors, "AUD");
    case "amazon_sg":
      return parseWithConfig(raw, amazonAuSelectors, "SGD");
    case "amazon_mx":
      return parseWithConfig(raw, amazonMxSelectors, "MXN");
    case "amazon_br":
      return parseWithConfig(raw, amazonBrSelectors, "BRL");
    case "amazon_jp":
      return parseWithConfig(raw, amazonUsSelectors, "JPY");
    // 일본
    case "rakuten":
      return parseWithConfig(raw, rakutenSelectors, "JPY");
    case "mercari":
      return parseWithConfig(raw, mercariSelectors, "JPY");
    case "yahoo_jp":
      return parseWithConfig(raw, yahooJpSelectors, "JPY");
    // 미국 소매업체
    case "walmart":
      return parseWithConfig(raw, walmartSelectors, "USD");
    case "target":
      return parseWithConfig(raw, targetSelectors, "USD");
    case "bestbuy":
      return parseWithConfig(raw, bestbuySelectors, "USD");
    case "costco":
      return parseWithConfig(raw, costcoSelectors, "USD");
    case "newegg":
      return parseWithConfig(raw, neweggSelectors, "USD");
    // eBay 계열
    case "ebay":
    case "ebay_us":
      return parseWithConfig(raw, ebaySelectors, "USD");
    case "ebay_uk":
      return parseWithConfig(raw, ebaySelectors, "GBP");
    case "ebay_de":
    case "ebay_fr":
    case "ebay_it":
    case "ebay_es":
      return parseWithConfig(raw, ebaySelectors, "EUR");
    case "ebay_au":
      return parseWithConfig(raw, ebaySelectors, "AUD");
    // 동남아시아
    case "shopee":
      return parseWithConfig(raw, shopeeSelectors, "USD");
    case "lazada":
      return parseWithConfig(raw, lazadaSelectors, "USD");
    // 중국
    case "aliexpress":
      return parseWithConfig(raw, aliexpressSelectors, "USD");
    case "jd":
      return parseWithConfig(raw, jdSelectors, "CNY");
    case "taobao":
    case "tmall":
      return parseWithConfig(raw, aliexpressSelectors, "CNY");
    // 인도
    case "flipkart":
      return parseWithConfig(raw, flipkartSelectors, "INR");
    // 라틴 아메리카
    case "mercadolibre":
      return parseWithConfig(raw, mercadolibreSelectors, "USD");
    // 유럽
    case "zalando":
      return parseWithConfig(raw, zalandoSelectors, "EUR");
    case "asos":
      return parseWithConfig(raw, asosSelectors, "GBP");
    case "mediamarkt":
    case "saturn":
    case "otto":
    case "bol":
    case "cdiscount":
    case "fnac":
      return parseWithConfig(raw, amazonUsSelectors, "EUR"); // 기본 구조 사용
    // 기타
    case "etsy":
    case "wish":
    case "wayfair":
    case "overstock":
    case "g2a":
    case "allegro":
      return parseWithConfig(raw, ebaySelectors, "USD"); // 기본 구조 사용
    default:
      throw new Error(`Unsupported marketplace: ${req.marketplace}`);
  }
}

