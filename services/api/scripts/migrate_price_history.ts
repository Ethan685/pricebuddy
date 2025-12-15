/**
 * Price History 마이그레이션 스크립트
 * 
 * 실행 방법:
 *   node -r ts-node/register scripts/migrate_price_history.ts
 * 
 * 또는 Firebase Functions 환경에서:
 *   firebase functions:shell
 *   > require('./scripts/migrate_price_history').main()
 */
import { firestore } from "../src/lib/firestore";

async function main() {
  console.log("Starting price history migration...");

  const offersSnap = await firestore.collection("offers").get();

  let moved = 0;
  let skipped = 0;

  for (const doc of offersSnap.docs) {
    const data = doc.data();
    const offerId = doc.id;

    // 기존 history 배열 찾기 (다양한 필드명 대응)
    const history = data.priceHistory ?? data.history ?? data.price_history ?? null;
    if (!Array.isArray(history) || history.length === 0) {
      skipped++;
      continue;
    }

    console.log(`Processing offer ${offerId} with ${history.length} history points...`);

    for (const p of history) {
      const ts = String(p.ts ?? p.date ?? p.timestamp ?? "");
      const totalPriceKrw = Number(p.totalPriceKrw ?? p.price ?? p.priceKrw ?? 0);
      
      if (!ts || !totalPriceKrw || totalPriceKrw <= 0) {
        console.warn(`Skipping invalid history point: ts=${ts}, price=${totalPriceKrw}`);
        continue;
      }

      const day = ts.slice(0, 10); // YYYY-MM-DD
      if (day.length !== 10) {
        console.warn(`Invalid date format: ${ts}`);
        continue;
      }

      await firestore
        .collection("price_history_daily")
        .doc(offerId)
        .collection("days")
        .doc(day)
        .set(
          {
            ts,
            totalPriceKrw,
            migratedAt: new Date().toISOString(),
          },
          { merge: true }
        );
    }

    // 원본 배열 제거(선택) - 주석 처리하여 안전하게 진행
    // await doc.ref.update({ priceHistory: null, history: null, price_history: null });

    moved++;
    if (moved % 50 === 0) {
      console.log(`Migrated ${moved} offers...`);
    }
  }

  console.log("\n=== Migration Summary ===");
  console.log(`Total offers processed: ${offersSnap.size}`);
  console.log(`Offers with history migrated: ${moved}`);
  console.log(`Offers skipped (no history): ${skipped}`);
  console.log("Migration completed!");
}

if (require.main === module) {
  main()
    .then(() => {
      console.log("Done");
      process.exit(0);
    })
    .catch((e) => {
      console.error("Migration failed:", e);
      process.exit(1);
    });
}

export { main };

