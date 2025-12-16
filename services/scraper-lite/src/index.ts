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

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"
    },
    redirect: "follow"
  });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return res.text();
}

function parseGeneric(html: string): ParsedOfferOutput {
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr("content")?.trim() || $("title").text().trim() || "item";
  const imageUrl = $('meta[property="og:image"]').attr("content")?.trim();
  const text = $.text().replace(/,/g, "");
  const m = text.match(/(\d{2,9})\s*원/);
  const price = m ? Number(m[1]) : undefined;
  return { title, price, basePrice: price, currency: "KRW", imageUrl, attributes: {} };
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
