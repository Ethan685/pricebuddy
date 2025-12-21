import { useTranslation } from "react-i18next";

type Point = { date?: string; priceKrw?: number; price?: number; value?: number };

export default function PriceHistoryChart(props: { points?: Point[]; historyDaily?: Point[] }) {
  const tr = useTranslation();
  const t = typeof tr.t === "function" ? tr.t : ((k: string) => k);

  const raw = (props.points ?? props.historyDaily ?? []) as Point[];
  const points = raw
    .map((p) => ({
      date: String(p.date || ""),
      priceKrw: Number(p.priceKrw ?? p.price ?? p.value ?? 0),
    }))
    .filter((p) => p.date && Number.isFinite(p.priceKrw));

  const fmt = new Intl.NumberFormat("ko-KR");

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.9, marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>{t("common.priceComparison")}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{points.length ? `${points.length} pts` : "no data"}</div>
      </div>

      <div style={{ border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: 12 }}>
        {!points.length ? (
          <div style={{ opacity: 0.7 }}>No history yet</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
            {points.slice(-7).map((p) => (
              <li key={p.date} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.85 }}>{p.date}</span>
                <span style={{ fontWeight: 600 }}>₩{fmt.format(p.priceKrw)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
