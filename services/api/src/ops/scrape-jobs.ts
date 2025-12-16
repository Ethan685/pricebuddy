import { firestore } from "../lib/firestore";
import { scraperClient } from "../clients/scraper-client";
import { naverShoppingSearch } from "../providers/naverShoppingSearch";

type Market =
  | "naver"
  | "coupang"
  | "amazon"
  | "aliexpress"
  | "ebay"
  | "rakuten"
  | "mercari"
  | "yahoojp"
  | "unknown";

type WatchlistItem = {
  userId: string;
  market: Market;
  query: string;
  targetPriceKrw?: number;
  pollEveryMin?: number;
  active?: boolean;
  lastCheckedAt?: FirebaseFirestore.Timestamp | null;
};

type Offer = {
  market: Market;
  title: string;
  url: string;
  currency: string;
  priceRaw: number;
  priceKrw: number;
  shippingKrw?: number;
  taxKrw?: number;
  totalKrw: number;
  inStock?: boolean;
};

function nowTs() {
  return new Date();
}

function shouldRun(item: WatchlistItem, last: Date | null) {
  const every = item.pollEveryMin ?? 180;
  if (!last) return true;
  const diffMin = (Date.now() - last.getTime()) / 60000;
  return diffMin >= every;
}

function offerFromSearchResult(market: Market, r: any): Offer | null {
  const price = Number(r?.minPriceKrw ?? r?.priceKrw ?? r?.price ?? r?.minPrice ?? 0);
  if (!price) return null;
  const title = String(r?.title ?? r?.name ?? "item");
  const url = String(r?.url ?? r?.link ?? r?.productUrl ?? "");
  return {
    market,
    title,
    url,
    currency: "KRW",
    priceRaw: price,
    priceKrw: price,
    shippingKrw: 0,
    taxKrw: 0,
    totalKrw: price,
    inStock: r?.inStock ?? true,
  };
}

async function naverFallbackOffer(query: string): Promise<Offer | null> {
  const items = await naverShoppingSearch(query);
  const it = items?.[0];
  const price = Number(it?.lprice ?? 0);
  if (!price) return null;
  return {
    market: "naver",
    title: String(it.title ?? query ?? "item"),
    url: String(it.link ?? ""),
    currency: "KRW",
    priceRaw: price,
    priceKrw: price,
    shippingKrw: 0,
    taxKrw: 0,
    totalKrw: price,
    inStock: true
  };
}

function offerFromFallback(item: WatchlistItem): Offer | null {
  const price = Number(item.targetPriceKrw ?? 0);
  if (!price) return null;
  return {
    market: (item.market ?? "unknown") as Market,
    title: String(item.query ?? "item"),
    url: "",
    currency: "KRW",
    priceRaw: price,
    priceKrw: price,
    shippingKrw: 0,
    taxKrw: 0,
    totalKrw: price,
    inStock: true,
  };
}

async function scrapeOne(market: Market, query: string): Promise<Offer | null> {
  const isUrl = /^https?:\/\//i.test(query);

  const toMarketplace = (m: Market) => {
    const map: Record<string, any> = {
      naver: "naver",
      coupang: "coupang",
      amazon: "amazon",
      aliexpress: "aliexpress",
      ebay: "ebay",
      rakuten: "rakuten",
      mercari: "mercari",
      yahoojp: "yahoojp",
    };
    return (map[m] ?? m) as any;
  };

  try {
    if (isUrl) {
      const scraped: any = await (scraperClient as any).scrapeSingle?.(toMarketplace(market), query);
      const basePrice = Number(scraped?.price ?? scraped?.basePrice ?? 0);
      if (!basePrice) return null;

      const currency = String(scraped?.currency ?? "KRW");
      const shippingKrw = Number(scraped?.shippingFee ?? scraped?.shippingKrw ?? 0);
      const priceKrw = currency === "KRW" ? basePrice : basePrice;

      return {
        market,
        title: String(scraped?.title ?? scraped?.name ?? scraped?.externalId ?? "item"),
        url: String(query),
        currency,
        priceRaw: basePrice,
        priceKrw,
        shippingKrw,
        taxKrw: 0,
        totalKrw: priceKrw + shippingKrw,
        inStock: scraped?.inStock ?? true,
      };
    }

    const region: any = market === "naver" || market === "coupang" ? "KR" : "global";
    const results: any[] = await (scraperClient as any).search?.(query, region);
    const first = results?.[0];
    return offerFromSearchResult(market, first);
  } catch (e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  console.warn("scrapeOne failed:", market, query, msg);

  const isBlocked =
    msg.includes("Scraper error: 409") ||
    msg.includes("blocked_or_gate_detected") ||
    msg.includes("captcha") ||
    msg.includes("robot");

  if (market === "naver" && !isUrl && isBlocked) {
    try {
      const fb = await naverFallbackOffer(query);
      if (fb) return fb;
    } catch (e2: unknown) {
      console.warn("naver openapi fallback failed:", e2 instanceof Error ? e2.message : String(e2));
    }
  }

  return null;
}
}

async function main() {
  console.log("scrape_jobs: start");

  const snap = await firestore
    .collection("watchlist_items")
    .where("active", "==", true)
    .limit(200)
    .get();

  console.log(`watchlist_items: ${snap.size}`);

  let processed = 0;
  let storedOffers = 0;

  for (const doc of snap.docs) {
    const item = doc.data() as WatchlistItem;

    const lastChecked = item.lastCheckedAt ? item.lastCheckedAt.toDate() : null;
    if (!shouldRun(item, lastChecked)) continue;

    processed += 1;

    const checkedAt = nowTs();
    const offer = await scrapeOne(item.market ?? "unknown", item.query);
    const finalOffer = offer ?? offerFromFallback(item);

    await doc.ref.set({ lastCheckedAt: checkedAt }, { merge: true });

    if (!finalOffer) continue;

    const offerRef = firestore.collection("offers").doc();
    await offerRef.set({
      watchlistId: doc.id,
      ...finalOffer,
      capturedAt: checkedAt,
    });
    storedOffers += 1;

    const histRef = firestore.collection("price_history").doc();
    await histRef.set({
      watchlistId: doc.id,
      totalKrw: finalOffer.totalKrw,
      capturedAt: checkedAt,
      market: finalOffer.market,
      offerId: offerRef.id,
    });

    if (item.targetPriceKrw && finalOffer.totalKrw <= item.targetPriceKrw) {
      await firestore.collection("notifications_queue").add({
        userId: item.userId,
        watchlistId: doc.id,
        type: "PRICE_DROP",
        payload: {
          totalKrw: finalOffer.totalKrw,
          targetPriceKrw: item.targetPriceKrw,
          title: finalOffer.title,
          url: finalOffer.url,
          market: finalOffer.market,
        },
        createdAt: checkedAt,
        status: "PENDING",
      });
    }
  }

  console.log(JSON.stringify({ processed, storedOffers, totalWatchlist: snap.size }, null, 2));
  console.log("scrape_jobs: done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
