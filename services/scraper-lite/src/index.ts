import express from "express";
import * as cheerio from "cheerio";

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

async function fetchHtml(url: string) {
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

  const maxTry = 5;
  let lastStatus = 0;
  let lastText = "";

  for (let i = 0; i < maxTry; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);

    try {
      const res = await fetch(url, { headers, redirect: "follow", signal: ctrl.signal });
      lastStatus = res.status;
      lastText = await res.text();

      if (res.ok) return lastText;

      if ([418, 403, 429, 503].includes(res.status)) {
        await sleep(500 * (i + 1));
        continue;
      }

      throw new Error(`fetch failed: ${res.status}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("aborted")) {
        await sleep(300 * (i + 1));
        continue;
      }
      await sleep(300 * (i + 1));
    } finally {
      clearTimeout(t);
    }
  }

  if (lastStatus) {
    throw new Error(`fetch failed: ${lastStatus}`);
  }
  throw new Error("fetch failed");
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

async function scrapeSingle(_marketplace: Marketplace, url: string): Promise<ParsedOfferOutput> {
  const html = await fetchHtml(url);
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
