import { chromium, Browser } from "playwright";
import * as cheerio from "cheerio";

let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export interface SearchResult {
  title: string;
  url: string;
  price?: number;
  imageUrl?: string;
  marketplace: string;
}

/**
 * 쿠팡에서 상품 검색
 */
export async function searchCoupang(query: string, limit: number = 20): Promise<SearchResult[]> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  
  try {
    // 쿠팡 검색 URL
    const searchUrl = `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // 동적 로딩 대기

    const html = await page.content();
    const $ = cheerio.load(html);

    const results: SearchResult[] = [];
    
    // 쿠팡 검색 결과 파싱 (다양한 셀렉터 시도)
    const selectors = [
      "ul.search-product-list li",
      "li.search-product",
      ".search-product-wrap",
      "[data-product-id]",
      "li[class*='search']"
    ];
    
    let found = false;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        found = true;
        elements.slice(0, limit).each((_, element) => {
          const $el = $(element);
          const title = $el.find("a .name, .name, [class*='name'], [class*='title']").first().text().trim() ||
                       $el.find("a").first().attr("title") || "";
          const url = $el.find("a").first().attr("href");
          const priceText = $el.find(".price-value, [class*='price'], .price").first().text().trim();
          const imageUrl = $el.find("img").first().attr("src") || 
                           $el.find("img").first().attr("data-img-src") ||
                           $el.find("img").first().attr("data-lazy-src");

          if (title && url) {
            const price = priceText ? parseInt(priceText.replace(/[^\d]/g, "")) : undefined;
            const fullUrl = url.startsWith("http") ? url : `https://www.coupang.com${url}`;
            
            results.push({
              title,
              url: fullUrl,
              price,
              imageUrl: imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `https:${imageUrl}`) : undefined,
              marketplace: "coupang",
            });
          }
        });
        break;
      }
    }
    
    if (!found) {
      console.warn("No products found with any selector, HTML structure may have changed");
    }

    return results;
  } catch (error) {
    console.error("Error searching Coupang:", error);
    return [];
  } finally {
    await page.close();
    await context.close();
  }
}

/**
 * 네이버 쇼핑에서 상품 검색
 */
export async function searchNaver(query: string, limit: number = 20): Promise<SearchResult[]> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  
  try {
    // 네이버 쇼핑 검색 URL
    const searchUrl = `https://shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // 동적 로딩 대기

    const html = await page.content();
    const $ = cheerio.load(html);

    const results: SearchResult[] = [];
    
    // 네이버 쇼핑 검색 결과 파싱 (다양한 셀렉터 시도)
    const selectors = [
      "div.productList_item",
      ".product_item",
      "[class*='product']",
      "li[data-product-id]",
      "div[class*='item']"
    ];
    
    let found = false;
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        found = true;
        elements.slice(0, limit).each((_, element) => {
          const $el = $(element);
          const title = $el.find("a.product_title, [class*='title'], [class*='name']").first().text().trim() ||
                       $el.find("a").first().attr("title") || "";
          const url = $el.find("a").first().attr("href");
          const priceText = $el.find(".price_num, [class*='price'], .price").first().text().trim();
          const imageUrl = $el.find("img").first().attr("src") ||
                           $el.find("img").first().attr("data-src");

          if (title && url) {
            const price = priceText ? parseInt(priceText.replace(/[^\d]/g, "")) : undefined;
            const fullUrl = url.startsWith("http") ? url : `https://shopping.naver.com${url}`;
            
            results.push({
              title,
              url: fullUrl,
              price,
              imageUrl: imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `https:${imageUrl}`) : undefined,
              marketplace: "naver",
            });
          }
        });
        break;
      }
    }
    
    if (!found) {
      console.warn("No products found with any selector, HTML structure may have changed");
    }

    return results;
  } catch (error) {
    console.error("Error searching Naver:", error);
    return [];
  } finally {
    await page.close();
    await context.close();
  }
}

/**
 * 여러 마켓플레이스에서 동시 검색
 */
export async function searchMultipleMarketplaces(
  query: string,
  marketplaces: string[] = ["coupang", "naver"],
  limit: number = 20
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  for (const marketplace of marketplaces) {
    try {
      let marketplaceResults: SearchResult[] = [];
      
      if (marketplace === "coupang") {
        marketplaceResults = await searchCoupang(query, limit);
      } else if (marketplace === "naver") {
        marketplaceResults = await searchNaver(query, limit);
      }

      results.push(...marketplaceResults);
    } catch (error) {
      console.error(`Error searching ${marketplace}:`, error);
      // 하나의 마켓플레이스 실패해도 계속 진행
    }
  }

  return results;
}
