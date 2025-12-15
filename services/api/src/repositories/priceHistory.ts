import { firestore } from "../lib/firestore";

export async function upsertDailyHistoryPoint(params: {
  offerId: string;
  tsISO: string;
  totalPriceKrw: number;
}) {
  const day = params.tsISO.slice(0, 10); // YYYY-MM-DD
  const ref = firestore
    .collection("price_history_daily")
    .doc(params.offerId)
    .collection("days")
    .doc(day);

  await ref.set(
    {
      ts: params.tsISO,
      totalPriceKrw: params.totalPriceKrw,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

