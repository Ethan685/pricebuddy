import { firestore } from "../lib/firestore";
import type { Marketplace } from "@pricebuddy/core";

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return String(h);
}

export async function enqueueScrapeJob(params: {
  marketplace: Marketplace;
  url: string;
  productId: string;
  offerId: string;
}) {
  // 같은 url+offerId 중복 job 방지(간단 버전)
  const key = `${params.offerId}_${hash(params.url)}`;
  const ref = firestore.collection("scrape_jobs").doc(key);

  await ref.set(
    {
      status: "queued",
      marketplace: params.marketplace,
      url: params.url,
      productId: params.productId,
      offerId: params.offerId,
      attempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      runAfter: new Date().toISOString(),
    },
    { merge: true }
  );
}

