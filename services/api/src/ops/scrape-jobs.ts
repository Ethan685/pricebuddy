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

function nowTs() {
  return new Date();
}

function shouldRun(item: WatchlistItem, last: Date | null) {
  const every = item.pollEveryMin ?? 180;
  if (!last) return true;
  const diffMin = (Date.now() - last.getTime()) / 60000;
  return diffMin >= every;
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
      const scraped: any = await scraperClient.scrapeSingle(toMarketplace(market), query);
      const basePrice = Number(scraped.price ?? scraped.basePrice ?? 0);
      if (!basePrice) return null;

      const currency = String(scraped.currency ?? "KRW");
      const shippingKrw = Number(scraped.shippingFee ?? scraped.shippingKrw ?? 0);

      const priceKrw = currency === "KRW" ? basePrice : basePrice;

      return {
        market,
        title: String(scraped.title ?? scraped.name ?? scraped.externalId ?? "item"),
        url: String(query),
        currency,
        priceRaw: basePrice,
        priceKrw,
        shippingKrw,
        taxKrw: 0,
        totalKrw: priceKrw + shippingKrw,
        inStock: scraped.inStock ?? true,
      };
    }

    const region: any = market === "naver" || market === "coupang" ? "KR" : "global";
    const results: any[] = await (scraperClient as any).search?.(query, region);
    const first = results?.[0];
    const url = first?.url || first?.productUrl || first?.link;
    if (!url) return null;

    const scraped: any = await scraperClient.scrapeSingle(toMarketplace(market), url);
    const basePrice = Number(scraped.price ?? scraped.basePrice ?? first?.price ?? 0);
    if (!basePrice) return null;

    const currency = String(scraped.currency ?? first?.currency ?? "KRW");
    const shippingKrw = Number(scraped.shippingFee ?? first?.shippingFee ?? 0);

    const priceKrw = currency === "KRW" ? basePrice : basePrice;

    return {
      market,
      title: String(scraped.title ?? first?.title ?? first?.name ?? scraped.externalId ?? "item"),
      url: String(url),
      currency,
      priceRaw: basePrice,
      priceKrw,
      shippingKrw,
      taxKrw: 0,
      totalKrw: priceKrw + shippingKrw,
      inStock: scraped.inStock ?? first?.inStock ?? true,
    };
  } catch (e: any) {
    console.warn("scrapeOne failed:", market, query, e?.message ?? e);
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

    await doc.ref.set({ lastCheckedAt: checkedAt }, { merge: true });

    if (!offer) continue;

    const offerRef = firestore.collection("offers").doc();
    await offerRef.set({
      watchlistId: doc.id,
      ...offer,
      capturedAt: checkedAt,
    });
    storedOffers += 1;

    const histRef = firestore.collection("price_history").doc();
    await histRef.set({
      watchlistId: doc.id,
      totalKrw: offer.totalKrw,
      capturedAt: checkedAt,
      market: offer.market,
      offerId: offerRef.id,
    });

    if (item.targetPriceKrw && offer.totalKrw <= item.targetPriceKrw) {
      await firestore.collection("notifications_queue").add({
        userId: item.userId,
        watchlistId: doc.id,
        type: "PRICE_DROP",
        payload: {
          totalKrw: offer.totalKrw,
          targetPriceKrw: item.targetPriceKrw,
          title: offer.title,
          url: offer.url,
          market: offer.market,
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
