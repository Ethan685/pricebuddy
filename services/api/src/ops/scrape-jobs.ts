import { firestore } from "../lib/firestore";

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
  query: string; // keyword or URL
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

// TODO: wire to real scraper client in this repo
async function scrapeOne(_market: Market, _query: string): Promise<Offer | null> {
  // placeholder that keeps pipeline alive. Next step: connect to existing scraper-client/adapters.
  return null;
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

    await doc.ref.set(
      {
        lastCheckedAt: checkedAt,
      },
      { merge: true }
    );

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

    // simple alert queue (dedupe can be added later)
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

  console.log(
    JSON.stringify(
      { processed, storedOffers, totalWatchlist: snap.size },
      null,
      2
    )
  );

  console.log("scrape_jobs: done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
