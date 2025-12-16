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

type DebugInfo = {
  finalUrl?: string;
  domTitle?: string;
  ogTitle?: string;
  ogImage?: string;
  h1?: string;
  htmlLen?: number;
  contains: Record<string, boolean>;
  priceCandidates?: number[];
  ldjsonFound?: number;
  ldjsonPrice?: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function pickFirst<T>(...vals: Array<T | undefined | null | "">): T | undefined {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

function extractPriceCandidates(text: string): number[] {
  const s = text.replace(/,/g, "");
  const out: number[] = [];
  const re = /(\d{2,9})\s*원/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0) out.push(n);
    if (out.length >= 50) break;
  }
  const uniq = Array.from(new Set(out));
  uniq.sort((a, b) => a - b);
  return uniq;
}

function extractLdJsonPrice($: cheerio.CheerioAPI): { found: number; price?: number } {
  const nodes = $('script[type="application/ld+json"]');
  let found = 0;
  let best: number | undefined;

  nodes.each((_, el) => {
    const raw = $(el).text();
    if (!raw) return;
    try {
      const json = JSON.parse(raw);
      found += 1;

      const prices: any[] = [];
      const pushMaybe = (v: any) => {
        if (v === undefined || v === null) return;
        if (typeof v === "string") {
          const x = Number(v.replace(/,/g, "").trim());
          if (Number.isFinite(x)) prices.push(x);
        } else if (typeof v === "number" && Number.isFinite(v)) {
          prices.push(v);
        }
      };

      const walk = (obj: any) => {
        if (!obj) return;
        if (Array.isArray(obj)) return obj.forEach(walk);
        if (typeof obj !== "object") return;

        if (obj.offers) walk(obj.offers);
        if (obj.price) pushMaybe(obj.price);
        if (obj.lowPrice) pushMaybe(obj.lowPrice);
        if (obj.highPrice) pushMaybe(obj.highPrice);
        if (obj.minPrice) pushMaybe(obj.minPrice);
        if (obj.maxPrice) pushMaybe(obj.maxPrice);

        for (const k of Object.keys(obj)) {
          walk(obj[k]);
        }
      };

      walk(json);

      const nums = prices.filter((x) => typeof x === "number") as number[];
      for (const x of nums) {
        if (!best || x < best) best = x;
      }
    } catch {}
  });

  return { found, price: best };
}

function parseHtml(html: string): { out: ParsedOfferOutput; debug: DebugInfo } {
  const $ = cheerio.load(html);

  const domTitle = $("title").text().trim();
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim();
  const h1 = $("h1").first().text().trim();

  const ld = extractLdJsonPrice($);
  const textAll = $.text() || "";
  const candidates = extractPriceCandidates(textAll);

  const chosenPrice = pickFirst<number>(ld.price, candidates.length ? candidates[0] : undefined);

  const title = pickFirst<string>(ogTitle, h1, domTitle, "item") || "item";

  const contains: Record<string, boolean> = {
    naverShopping: html.includes("search.shopping.naver.com"),
    captchaLike: /captcha|robot|자동|비정상|접속이 제한|보안문자/i.test(html),
    adultGate: /성인인증|본인인증/i.test(html),
    loginGate: /로그인|sign in|account/i.test(html),
  };

  const out: ParsedOfferOutput = {
    title,
    price: chosenPrice,
    basePrice: chosenPrice,
    currency: "KRW",
    imageUrl: ogImage,
    attributes: {},
  };

  const debug: DebugInfo = {
    domTitle: domTitle || undefined,
    ogTitle: ogTitle || undefined,
    ogImage: ogImage || undefined,
    h1: h1 || undefined,
    htmlLen: html.length,
    contains,
    priceCandidates: candidates.slice(0, 12),
    ldjsonFound: ld.found,
    ldjsonPrice: ld.price,
  };

  return { out, debug };
}

async function fetchHtmlPlaywright(url: string): Promise<{ html: string; finalUrl: string }> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage"
    ],
  });

  const ctx = await browser.newContext({
    locale: "ko-KR",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1365, height: 900 },
  });

  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = await ctx.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1200);
    try { await page.waitForLoadState("networkidle", { timeout: 8000 }); } catch {}
    await page.waitForTimeout(800);

    const html = await page.content();
    const finalUrl = page.url();
    const status = resp?.status();

    if (!html || html.length < 1000) {
      throw new Error(`fetch failed: empty html (status=${status ?? "?"})`);
    }

    return { html, finalUrl };
  } finally {
    await page.close().catch(() => {});
    await ctx.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

async function scrapeSingle(marketplace: Marketplace, url: string, debugMode: boolean) {
  const { html, finalUrl } = await fetchHtmlPlaywright(url);
  const parsed = parseHtml(html);
  parsed.debug.finalUrl = finalUrl;

  if (debugMode) {
    return { ...parsed.out, debug: parsed.debug };
  }

  if (parsed.debug.contains.captchaLike || parsed.debug.contains.loginGate || parsed.debug.contains.adultGate) {
    throw new Error("blocked_or_gate_detected");
  }

  return parsed.out;
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.post("/scrape", async (req, res) => {
  try {
    const debugMode = String(req.query.debug ?? "") === "1";
    const { marketplace, url } = req.body as { marketplace: Marketplace; url: string };
    if (!marketplace || !url) return res.status(400).json({ error: "missing marketplace/url" });
    const out = await scrapeSingle(marketplace, url, debugMode);
    res.json(out);
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`scraper-lite listening on ${port}`));
