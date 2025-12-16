import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const isUrl = (s: string) => /^https?:\/\//i.test(s);

export default function WatchlistPage() {
  const [market, setMarket] = useState("naver");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<string>("");

  const onAdd = async () => {
    setStatus("");
    const v = input.trim();
    if (!v) return setStatus("input required");

    let queryText = "";
    let query = v;

    if (market === "naver") {
      if (isUrl(v)) {
        try {
          const u = new URL(v);
          queryText =
            (u.searchParams.get("query") ||
              u.searchParams.get("q") ||
              u.searchParams.get("keyword") ||
              "").trim();
        } catch {}
        if (!queryText) {
          return setStatus("naver requires keyword (or URL with ?query=...)");
        }
      } else {
        queryText = v;
      }
    }

    await addDoc(collection(db, "watchlist_items"), {
      market,
      query,
      queryText: queryText || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    });

    setInput("");
    setStatus("added");
  };

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h2>Watchlist</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <select value={market} onChange={(e) => setMarket(e.target.value)}>
          <option value="naver">naver (keyword required)</option>
          <option value="coupang">coupang</option>
          <option value="amazon">amazon</option>
          <option value="ebay">ebay</option>
          <option value="aliexpress">aliexpress</option>
        </select>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="keyword or URL"
          style={{ flex: 1 }}
        />

        <button onClick={onAdd}>Add</button>
      </div>

      <div style={{ opacity: 0.8 }}>{status}</div>

      <p style={{ marginTop: 16, opacity: 0.8 }}>
        Naver는 서버 스크래핑이 막히므로 URL-only는 동작하지 않습니다. 키워드로 저장해야 OpenAPI 폴백이 작동합니다.
      </p>
    </div>
  );
}
