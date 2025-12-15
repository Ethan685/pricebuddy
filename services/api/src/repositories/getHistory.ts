import { firestore } from "../lib/firestore";
import type { PriceHistoryPointDTO } from "@pricebuddy/core";

export async function getDailyHistory(offerId: string, days: number): Promise<PriceHistoryPointDTO[]> {
  const ref = firestore
    .collection("price_history_daily")
    .doc(offerId)
    .collection("days");

  // Firestore는 날짜 range 쿼리가 애매하니 최신 N개로 단순화
  const snap = await ref.orderBy("ts", "desc").limit(days).get();
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        ts: String(data.ts ?? ""),
        totalPriceKrw: Number(data.totalPriceKrw ?? 0),
      };
    })
    .sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
}

