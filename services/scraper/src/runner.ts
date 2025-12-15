import type { ScrapeJobPayload } from "@pricebuddy/core";
import { acquireToken } from "./rate-limit";

export type RunnerResult = {
  ok: boolean;
  raw?: any;
};

const DEFAULT_LIMITS: Record<string, { capacity: number; refillPerSecond: number }> = {
  amazon: { capacity: 2, refillPerSecond: 1 },
  coupang: { capacity: 2, refillPerSecond: 1 },
  naver: { capacity: 3, refillPerSecond: 2 },
  aliexpress: { capacity: 2, refillPerSecond: 1 },
  ebay: { capacity: 2, refillPerSecond: 1 },
  rakuten: { capacity: 2, refillPerSecond: 1 },
  mercari: { capacity: 2, refillPerSecond: 1 },
  yahoo: { capacity: 2, refillPerSecond: 1 },
};

async function loadAdapter(marketplace: string) {
  const m = marketplace.toLowerCase();
  const candidates = [
    `./adapters/${m}`,
    `./adapters/${m}-adapter`,
    `./adapters/${m}.adapter`,
  ];
  for (const p of candidates) {
    try {
      const mod = await import(p);
      return mod;
    } catch {}
  }
  throw new Error(`adapter_not_found:${marketplace}`);
}

export async function runScrape(payload: ScrapeJobPayload): Promise<RunnerResult> {
  const m = payload.marketplace.toLowerCase();
  const lim = DEFAULT_LIMITS[m] ?? { capacity: 2, refillPerSecond: 1 };
  await acquireToken(`mp:${m}`, lim);

  const adapter = await loadAdapter(m);
  if (payload.kind === "PRODUCT") {
    const fn = adapter.scrapeProduct ?? adapter.scrape ?? adapter.fetchProduct;
    if (!fn) throw new Error(`adapter_missing_product_fn:${m}`);
    const raw = await fn(payload);
    return { ok: true, raw };
  }

  const fn = adapter.search ?? adapter.searchProducts;
  if (!fn) throw new Error(`adapter_missing_search_fn:${m}`);
  const raw = await fn(payload);
  return { ok: true, raw };
}
