import { firestore } from "../lib/firestore";
import { scraperClient } from "../clients/scraper-client";
import { pricingClient } from "../clients/pricing-client";
import { upsertDailyHistoryPoint } from "../repositories/priceHistory";
import type { Marketplace } from "@pricebuddy/core";

const MAX_PER_TICK = 10;

interface ScrapeJob {
  status: "queued" | "running" | "done" | "failed";
  marketplace: Marketplace;
  url: string;
  productId: string;
  offerId: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  runAfter?: string;
  lastError?: string;
}

export async function processScrapeJobsOnce() {
  const nowIso = new Date().toISOString();

  const snap = await firestore
    .collection("scrape_jobs")
    .where("status", "==", "queued")
    .orderBy("runAfter", "asc")
    .limit(MAX_PER_TICK)
    .get();

  for (const doc of snap.docs) {
    const job = doc.data() as ScrapeJob;

    if (job.runAfter && String(job.runAfter) > nowIso) continue;

    await doc.ref.set({ status: "running", updatedAt: nowIso }, { merge: true });

    try {
      // 1) scrape
      const parsed = await scraperClient.scrapeSingle(job.marketplace, job.url);

      // 2) pricing
      const priced = pricingClient.compute(
        {
          marketplace: job.marketplace,
          country: "KR", // TODO: 동적으로 결정
          basePrice: parsed.price ?? parsed.basePrice ?? 0,
          currency: parsed.currency ?? "KRW",
          weightKg: parsed.weightKg ?? 1,
        },
        {}
      );

      // 3) update offer 최신값
      await firestore.collection("offers").doc(job.offerId).set(
        {
          productId: job.productId,
          marketplace: job.marketplace,
          url: job.url,
          externalId: job.url,
          basePrice: parsed.price ?? parsed.basePrice ?? 0,
          currency: parsed.currency ?? "KRW",

          latestTotalPriceKrw: priced.totalPriceKrw,
          lastFetchedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 4) write daily history
      await upsertDailyHistoryPoint({
        offerId: job.offerId,
        tsISO: new Date().toISOString(),
        totalPriceKrw: priced.totalPriceKrw,
      });

      await doc.ref.set({ status: "done", updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e: unknown) {
      const attempts = Number(job.attempts ?? 0) + 1;
      const backoffMs = Math.min(60_000, 2 ** attempts * 1000); // 1s,2s,4s... max 60s
      const runAfter = new Date(Date.now() + backoffMs).toISOString();

      await doc.ref.set(
        {
          status: "queued",
          attempts,
          runAfter,
          lastError: String(e instanceof Error ? e.message : e),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  }
}

