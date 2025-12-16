import { getFirestore } from "firebase-admin/firestore";
import { initFirebaseAdmin } from "../shared/firebase-admin";

function extractQueryFromUrl(u: string): string {
  try {
    const url = new URL(u);
    const q = url.searchParams.get("query") || url.searchParams.get("q") || url.searchParams.get("keyword");
    return (q ?? "").trim();
  } catch {
    return "";
  }
}

async function main() {
  await initFirebaseAdmin();
  const db = getFirestore();

  const snap = await db.collection("watchlist_items").get();
  let updated = 0;

  for (const doc of snap.docs) {
    const item = doc.data() as any;
    const market = String(item.market ?? "").toLowerCase();
    if (market !== "naver") continue;

    const q = String(item.query ?? "");
    const queryText = String(item.queryText ?? "");

    if (queryText) continue;

    const extracted = extractQueryFromUrl(q);
    if (!extracted) continue;

    await doc.ref.update({ queryText: extracted });
    updated += 1;
    console.log("updated", doc.id, extracted);
  }

  console.log(JSON.stringify({ scanned: snap.size, updated }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
