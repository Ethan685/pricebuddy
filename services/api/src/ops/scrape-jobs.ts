import { firestore } from "../lib/firestore";
import { scraperClient } from "../clients/scraper-client";

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

function offerFromFallback(item: WatchlistItem): Offer | null {
  const price = Number(item.targetPriceKrw ?? 0);
  if (!price) return null;
  return {
    market: (item.market ?? "unknown") as any,
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

function nowTs() {
  return new Date();
}

function shouldRun(item: WatchlistItem, last: Date | null) {
  const every = item.pollEveryMin ?? 180;
  if (!last) return true;
  const diffMin = (Date.now() - last.getTime()) / 60000;
  return diffMin >= every;
}

function offerFromSearchResult(market, first) {
  const price = Number(first?.minPriceKrw ?? first?.priceKrw ?? first?.price ?? 0);
  if (!price) return null;
  const title = String(first?.title ?? first?.name ?? "item");
  const url = String(first?.url ?? first?.link ?? (first?.productId ? `https://pricebuddy.app/p/${first.productId}` : ""));
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
    inStock: true,
  };
}

async function scrapeOne(market, query) {
  const isUrl = /^https?:\/\//i.test(query);

  try {
    if (isUrl) {
      const scraped = await scraperClient.scrapeSingle(market, query);
      const basePrice = Number(scraped.price ?? scraped.basePrice ?? 0);
      if (!basePrice) return null;
      const currency = String(scraped.currency ?? "KRW");
      const shippingKrw = Number(scraped.shippingFee ?? 0);
      const priceKrw = currency === "KRW" ? basePrice : basePrice;
      return {
        market,
        title: String(scraped.title ?? scraped.externalId ?? "item"),
        url: String(query),
        currency,
        priceRaw: basePrice,
        priceKrw,
        shippingKrw,
        taxKrw: 0,
        totalKrw: priceKrw + shippingKrw,
        inStock: true,
      };
    }

    const results = await scraperClient.search(query, market === "naver" || market === "coupang" ? "KR" : "global");
    const first = results?.[0];
    const offer = offerFromSearchResult(market, first);
    return offer;
  } catch (e) {
    console.warn("scrapeOne failed:", market, query, (e instanceof Error ? e.message : String(e)));
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

    const offer = await scrapeOne(item.market ?? "unknown", item.query);
const checkedAt = nowTs();
const fallback = offer ?? offerFromFallback(item);

    await doc.ref.set({ lastCheckedAt: checkedAt }, { merge: true });

    if (!fallback) continue;

    const offerRef = firestore.collection("offers").doc();
    await offerRef.set({
  watchlistId: doc.id,
  ...fallback,
  capturedAt: checkedAt,
});
    storedOffers += 1;

    const histRef = firestore.collection("price_history").doc();
    await histRef.set({
      watchlistId: doc.id,
      totalKrw: fallback.totalKrw,
      capturedAt: checkedAt,
      market: fallback.market,
      offerId: offerRef.id,
    });

    if (item.targetPriceKrw && fallback.totalKrw <= item.targetPriceKrw) {
      await firestore.collection("notifications_queue").add({
        userId: item.userId,
        watchlistId: doc.id,
        type: "PRICE_DROP",
        payload: {
          totalKrw: fallback.totalKrw,
          targetPriceKrw: item.targetPriceKrw,
          title: fallback.title,
          url: fallback.url,
          market: fallback.market,
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
