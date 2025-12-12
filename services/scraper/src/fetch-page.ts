import { chromium, Browser } from "playwright";
import type { ScrapeRequest, ScrapeResultRaw } from "./types";

let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function fetchPage(req: ScrapeRequest): Promise<ScrapeResultRaw> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();
  await page.goto(req.url, { waitUntil: "networkidle", timeout: 45000 });

  // 쿠팡/네이버 등 동적 로딩 고려해 잠깐 대기
  await page.waitForTimeout(1500);

  const html = await page.content();

  await page.close();
  await context.close();

  return {
    marketplace: req.marketplace,
    url: req.url,
    fetchedAt: new Date().toISOString(),
    html,
  };
}

