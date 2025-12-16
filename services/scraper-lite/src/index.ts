import express from "express";
import * as cheerio from "cheerio";
import { chromium } from "playwright";

type Marketplace =
  | "naver"
  | "coupang"
  | "amazon"
  | "aliexpress"
  | "ebay"
  | "rakuten"
  | "mercari"
  | "yahoojp";

type ParsedOfferOutput = {
  title: string;
  price?: number;
  basePrice?: number;
  currency: string;
  imageUrl?: string;
  shippingFee?: number;
  externalId?: string;
  inStock?: boolean;
  attributes: Record<string, string>;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseGeneric(html: string): ParsedOfferOutput {
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").text().trim() ||
    "item";

  const imageUrl = $('meta[property="og:image"]').attr("content")?.trim();

  const text = $.text().replace(/,/g, "");
  const m = text.match(/(\d{2,9})\s*원/);
  const price = m ? Number(m[1]) : undefined;

  return {
    title,
    price,
    basePrice: price,
    currency: "KRW",
    imageUrl,
    attributes: {},
  };
}

async function fetchHtmlHttp(url: string) {
  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-User": "?1",
    "Sec-Fetch-Dest": "document",
    "Referer": "https://search.shopping.naver.com/",
  };

  const maxTry = 3;
  let lastStatus = 0;

  for (let i = 0; i < maxTry; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);

    try {
      const res = await fetch(url, { headers, redirect: "follow", signal: ctrl.signal });
      lastStatus = res.status;
      const text = await res.text();
      if (res.ok) return { html: text, status: res.status };
      if ([418, 403, 429, 503].includes(res.status)) {
        await sleep(400 * (i + 1));
        continue;
      }
      throw new Error(`fetch failed: ${res.status}`);
    } catch {
      await sleep(300 * (i + 1));
    } finally {
      clearTimeout(t);
    }
  }

  return { html: "", status: lastStatus || 0 };
}

async function fetchHtmlPlaywright(url: string) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    locale: "ko-KR",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1200);
    const html = await page.content();
    return html;
  } finally {
    await page.close().catch(() => {});
    await ctx.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

async function scrapeSingle(_marketplace: Marketplace, url: string): Promise<ParsedOfferOutput> {
  const http = await fetchHtmlHttp(url);
  if (http.status && http.status !== 418 && http.html) return parseGeneric(http.html);

  const html = await fetchHtmlPlaywright(url);
  if (!html) throw new Error(`fetch failed: ${http.status || 418}`);
  return parseGeneric(html);
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.post("/scrape", async (req, res) => {
  try {
    const { marketplace, url } = req.body as { marketplace: Marketplace; url: string };
    if (!marketplace || !url) return res.status(400).json({ error: "missing marketplace/url" });
    const out = await scrapeSingle(marketplace, url);
    res.json(out);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`scraper-lite listening on ${port}`));
