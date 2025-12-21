import { Router, Request, Response } from "express";

const router = Router();

type Currency = "KRW";

type Product = {
  id: string;
  title: string;
  imageUrl: string;
  store: string;
  currency: Currency;
};

type Offer = {
  seller: string;
  priceKrw: number;
  shippingKrw?: number;
  url: string;
};

type CostBreakdown = {
  basePrice: number;     // 상품가
  shipping: number;      // 배송비
  tax: number;           // 관/부가세 추정
  verdict: number;       // 최종 결제금액
  currency: Currency;
};

const PLACEHOLDER_IMG = "/img/product-placeholder.svg";

/**
 * DEV 데이터: 프론트가 기대하는 shape을 "항상" 만족시키도록 고정
 */
const PRODUCTS: Record<string, Product> = {
  d1: { id: "d1", title: "Apple iPhone 17 Pro 256GB", imageUrl: PLACEHOLDER_IMG, store: "Coupang", currency: "KRW" },
  p1: { id: "p1", title: "DEV Product — Best Price", imageUrl: PLACEHOLDER_IMG, store: "Coupang", currency: "KRW" },
  p2: { id: "p2", title: "DEV Product — Premium", imageUrl: PLACEHOLDER_IMG, store: "Naver Shopping", currency: "KRW" },
  p3: { id: "p3", title: "DEV Product — Value", imageUrl: PLACEHOLDER_IMG, store: "11st", currency: "KRW" },
  p4: { id: "p4", title: "DEV Product — Refurb", imageUrl: PLACEHOLDER_IMG, store: "Gmarket", currency: "KRW" },
  p5: { id: "p5", title: "DEV Product — New", imageUrl: PLACEHOLDER_IMG, store: "SSG", currency: "KRW" },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function seededNumber(seed: string) {
  // 아주 단순한 seed hash → 0..1
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const x = (h >>> 0) / 2 ** 32;
  return x;
}

function makeOffers(productId: string): Offer[] {
  const r = seededNumber(productId);
  const base = Math.round(500000 + r * 3000000); // 50만 ~ 350만
  const spread = Math.round(base * (0.04 + r * 0.06)); // 4%~10%
  const a = clamp(base - spread, 10000, 99999999);
  const b = clamp(base + spread, 10000, 99999999);

  return [
    { seller: "Coupang", priceKrw: a, shippingKrw: 0, url: "https://example.com/coupang" },
    { seller: "Naver Shopping", priceKrw: b, shippingKrw: 2500, url: "https://example.com/naver" },
  ];
}

function makeCostBreakdown(minOfferPrice: number): CostBreakdown {
  const shipping = 2500;
  const tax = Math.round(minOfferPrice * 0.08); // DEV: 8%로 가정(관/부가세 추정)
  const verdict = minOfferPrice + shipping + tax;
  return { basePrice: minOfferPrice, shipping, tax, verdict, currency: "KRW" };
}

function makeHistoryDaily(minPrice: number) {
  // DEV: 최근 14일 히스토리
  const points: { date: string; priceKrw: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const jitter = Math.round((Math.sin(i) + 1) * 0.5 * 0.03 * minPrice); // 0~3% 범위
    points.push({
      date: d.toISOString().slice(0, 10),
      priceKrw: clamp(minPrice + (i % 2 === 0 ? -jitter : jitter), 10000, 99999999),
    });
  }
  return points;
}

/**
 * 검색 API (프론트의 Search 페이지에서 사용)
 */
router.get("/apiSearchProducts", async (req: Request, res: Response) => {
  const query = String(req.query.query || "");
  const region = String(req.query.region || "");

  // 항상 동일한 productId 세트를 반환 (프론트 라우팅/디테일 테스트 고정)
  const items = ["p1", "p2", "p3", "p4", "p5"].map((id) => {
    const offers = makeOffers(id + "::" + query);
    const minPriceKrw = Math.min(...offers.map((o) => o.priceKrw));
    const maxPriceKrw = Math.max(...offers.map((o) => o.priceKrw));
    return {
      id,
      productId: id,
      title: query ? `${query} — ${PRODUCTS[id]?.title ?? "Product"}` : PRODUCTS[id]?.title ?? "Product",
      imageUrl: PLACEHOLDER_IMG,
      minPriceKrw,
      maxPriceKrw,
      currency: "KRW" as const,
    };
  });

  res.json({ query, region, items, total: items.length });
});

/**
 * Deals 페이지
 */
router.get("/deals", async (_req: Request, res: Response) => {
  res.json({
    deals: [
      {
        id: "d1",
        title: "Apple iPhone 17 Pro 256GB",
        imageUrl: PLACEHOLDER_IMG,
        url: "https://example.com/iphone",
        price: 1590000,
        originalPrice: 1790000,
        currency: "KRW",
        discountPercent: 11,
        marketplace: "Coupang",
        isFlashDeal: true,
        productId: "d1",
      },
      {
        id: "d2",
        title: "MacBook Pro 14 M4 Pro",
        imageUrl: PLACEHOLDER_IMG,
        url: "https://example.com/mac",
        price: 3290000,
        originalPrice: 3590000,
        currency: "KRW",
        discountPercent: 8,
        marketplace: "Naver Shopping",
        isFlashDeal: false,
        productId: "p2",
      },
    ],
    total: 2,
  });
});

/**
 * Wishlist
 */
router.get("/wishlist", async (req: Request, res: Response) => {
  const userId = String(req.query.userId || "");
  res.json({ userId, items: [] });
});

router.post("/wishlist", async (req: Request, res: Response) => {
  const { userId, productId } = req.body || {};
  res.json({ ok: true, userId: userId || "", productId: productId || "" });
});

router.delete("/wishlist/:itemId", async (req: Request, res: Response) => {
  const userId = String(req.query.userId || "");
  const itemId = String(req.params.itemId || "");
  res.json({ ok: true, userId, itemId });
});

/**
 * Wallet
 */
router.get("/wallet/balance", async (req: Request, res: Response) => {
  const userId = String(req.query.userId || "");
  res.json({ userId, balance: 0 });
});

router.get("/wallet/transactions", async (req: Request, res: Response) => {
  const userId = String(req.query.userId || "");
  res.json({ userId, transactions: [] });
});

/**
 * Payments (DEV)
 */
router.post("/payments/checkout", async (_req: Request, res: Response) => {
  res.json({ ok: true, url: "http://localhost:5173/subscription?checkout=dev" });
});

router.post("/payment/verify", async (_req: Request, res: Response) => {
  res.json({ ok: true, verified: true });
});

/**
 * Referrals (DEV)
 */
router.get("/referrals/code", async (req: Request, res: Response) => {
  const userId = String(req.query.userId || "");
  res.json({ userId, code: "DEV-CODE" });
});

router.get("/referrals/stats", async (req: Request, res: Response) => {
  const userId = String(req.query.userId || "");
  res.json({ userId, invited: 0, rewards: 0 });
});

router.post("/referral/apply", async (req: Request, res: Response) => {
  const { userId, code } = req.body || {};
  res.json({ ok: true, userId: userId || "", code: code || "" });
});

/**
 * Price Tracking
 */
router.post("/priceTracking/track", async (req: Request, res: Response) => {
  res.json({ ok: true, tracked: true, input: req.body || {} });
});

router.get("/priceTracking/product/:productId/history", async (req: Request, res: Response) => {
  const productId = String(req.params.productId || "");
  const offers = makeOffers(productId);
  const minOffer = Math.min(...offers.map((o) => o.priceKrw));
  res.json({ ok: true, productId, points: makeHistoryDaily(minOffer) });
});

router.get("/priceTracking/product/:productId/status", async (req: Request, res: Response) => {
  const productId = String(req.params.productId || "");
  res.json({ ok: true, productId, tracking: false });
});

/**
 * ✅ Product Detail (프론트가 기대하는 costBreakdown + offers + historyDaily + aiSignal 제공)
 */
router.get("/product/:productId", async (req: Request, res: Response) => {
  const productId = String(req.params.productId || "");

  const product =
    PRODUCTS[productId] || {
      id: productId,
      title: "DEV PRODUCT",
      imageUrl: PLACEHOLDER_IMG,
      store: "DEV",
      currency: "KRW" as const,
    };

  const offers = makeOffers(productId);
  const minOffer = Math.min(...offers.map((o) => o.priceKrw));
  const costBreakdown = makeCostBreakdown(minOffer);

  res.json({
    ok: true,
    product,
    offers,
    historyDaily: makeHistoryDaily(minOffer),
    aiSignal: {
      score: 0.5,
      summary: "Wait (50%)",
      recommendation: "wait",
    },
    costBreakdown,
  });
});

/**
 * Fallback
 */
router.use((req: Request, res: Response) => {
  res.status(501).json({
    error: "NOT_IMPLEMENTED",
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  });
});

export default router;
