import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { withCors } from "./cors";

type DealDoc = {
  title?: any;
  imageUrl?: any;
  price?: any;
  currency?: any;
  store?: any;
  url?: any;
  originalPrice?: any;
  discountRate?: any;
  updatedAt?: any;
};

function n(v: any, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function s(v: any, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

function fmtKR(v: number) {
  return v > 0 ? v.toLocaleString("ko-KR") : "";
}

async function getDeals(limit: number) {
  const db = admin.firestore();
  const snap = await db.collection("deals").orderBy("updatedAt", "desc").limit(limit).get();
  if (snap.empty) return [];

  return snap.docs.map((d) => {
    const v = d.data() as DealDoc;

    const price = n(v.price, 0);
    const originalPrice = n(v.originalPrice, 0);

    const discountRate =
      Number.isFinite(Number(v.discountRate))
        ? n(v.discountRate, 0)
        : (originalPrice > 0 && price > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    const title = s(v.title, "Deal");
    const imageUrl = s(v.imageUrl, "");
    const store = s(v.store, "");
    const url = s(v.url, "");
    const currency = s(v.currency, "KRW");
    const updatedAt = n(v.updatedAt, Date.now());

    const payload: any = {
      id: d.id,
      title,
      imageUrl,
      price,
      currency,
      store,
      url,
      originalPrice: originalPrice > 0 ? originalPrice : null,
      discountRate: discountRate > 0 ? discountRate : null,
      updatedAt,
      display: {
        priceText: fmtKR(price),
        originalPriceText: fmtKR(originalPrice),
        discountRateText: discountRate > 0 ? `${discountRate}%` : ""
      }
    };

    payload.image = imageUrl;
    payload.img = imageUrl;
    payload.thumbnail = imageUrl;
    payload.thumbnailUrl = imageUrl;

    payload.link = url;
    payload.productUrl = url;
    payload.deeplink = url;

    payload.merchant = store;
    payload.vendor = store;
    payload.market = store;

    payload.currentPrice = price;
    payload.salePrice = price;
    payload.finalPrice = price;
    payload.dealPrice = price;

    payload.listPrice = originalPrice > 0 ? originalPrice : null;
    payload.msrv = originalPrice > 0 ? originalPrice : null;

    payload.discountPercent = discountRate > 0 ? discountRate : null;
    payload.discountPct = discountRate > 0 ? discountRate : null;

    return payload;
  });
}

export const deals = functions.https.onRequest(async (req, res) => {
  await withCors(req as any, res as any, async () => {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const limitRaw = (req.query.limit as string | undefined) ?? "8";
    const limit = Math.max(1, Math.min(50, Number(limitRaw) || 8));

    const deals = await getDeals(limit);

    res.status(200).json({
      ok: true,
      deals,
      meta: { limit, count: deals.length, ts: Date.now() },
    });
  });
});
