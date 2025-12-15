import { firestore } from "@pricebuddy/infra/firestore";

const COL = "scrape_metrics_daily";

function dayKey() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function incMetric(marketplace: string, field: "success" | "failure" | "skipped", ms?: number) {
  const key = `${dayKey()}__${marketplace}`;
  const ref = firestore.collection(COL).doc(key);

  await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.exists ? (snap.data() as any) : {};
    const next: any = {
      day: dayKey(),
      marketplace,
      updatedAt: new Date().toISOString(),
    };
    next[field] = Number(cur[field] ?? 0) + 1;

    if (typeof ms === "number") {
      const cnt = Number(cur.latencyCount ?? 0) + 1;
      const sum = Number(cur.latencySumMs ?? 0) + ms;
      next.latencyCount = cnt;
      next.latencySumMs = sum;
      next.latencyAvgMs = Math.round(sum / cnt);
    }

    tx.set(ref, next, { merge: true });
  });
}
