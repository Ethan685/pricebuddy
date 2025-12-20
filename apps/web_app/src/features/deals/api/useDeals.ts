import { useEffect, useState } from "react";
import { mockDeals } from "@/shared/data/mockDeals";

export type Deal = {
  id: string;
  productId?: string;
  title: string;
  imageUrl?: string;
  url?: string;
  price?: number;
  discountedPrice?: number;
  originalPrice?: number;
  currency?: string;
  discountPercent?: number | null;
  isFlashDeal?: boolean;
  marketplace?: string;
  validUntil?: string;
};

type DealsResponse = {
  ok: boolean;
  deals: any[];
  meta?: any;
};

function toNum(v: any): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function computeDiscountPercent(price?: number, original?: number): number | null {
  if (!price || !original) return null;
  if (original <= 0) return null;
  const pct = Math.round((1 - price / original) * 100);
  if (!Number.isFinite(pct)) return null;
  return Math.max(0, Math.min(99, pct));
}

function normalizeDeal(d: any): Deal {
  const price =
    toNum(d?.price) ??
    toNum(d?.salePrice) ??
    toNum(d?.dealPrice) ??
    toNum(d?.currentPrice) ??
    toNum(d?.discountedPrice);

  const originalPrice =
    toNum(d?.originalPrice) ??
    toNum(d?.listPrice) ??
    toNum(d?.msrp) ??
    toNum(d?.msrv);

  const discountPercent =
    toNum(d?.discountPercent) ??
    toNum(d?.discountRate) ??
    toNum(d?.discountPct) ??
    computeDiscountPercent(price, originalPrice);

  return {
    id: String(d?.id ?? ""),
    productId: d?.productId,
    title: String(d?.title ?? "Deal"),
    imageUrl: d?.imageUrl ?? d?.thumbnailUrl ?? d?.image ?? d?.img,
    url: d?.url ?? d?.link ?? d?.productUrl ?? d?.deeplink,
    price,
    discountedPrice: price,
    originalPrice,
    currency: String(d?.currency ?? "KRW"),
    discountPercent: Number.isFinite(discountPercent as number) ? (discountPercent as number) : null,
    isFlashDeal: d?.isFlashDeal ?? false,
    marketplace: d?.marketplace ?? d?.merchantName,
    validUntil: d?.validUntil,
  };
}

export function useDeals(limit = 8) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        // GA 출시: API 실패 시 Mock 데이터 사용
        const res = await fetch(`/api/deals?limit=${limit}`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`API ${res.status}`);
        }

        const json = (await res.json()) as DealsResponse;
        const arr = Array.isArray(json?.deals) ? json.deals : [];
        const normalized = arr.map(normalizeDeal).filter((x) => x.id);
        
        // API에서 데이터가 없으면 Mock 데이터 사용
        if (alive) {
          if (normalized.length > 0) {
            setDeals(normalized);
          } else {
            // Mock 데이터 사용 (출시 준비)
            setDeals(mockDeals.slice(0, limit));
          }
        }
      } catch (e: any) {
        // API 실패 시 Mock 데이터로 폴백 (GA 출시 준비)
        if (alive) {
          console.warn("API failed, using mock data:", e?.message);
          setDeals(mockDeals.slice(0, limit));
          setError(null); // Mock 데이터 사용 시 에러 표시 안 함
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [limit]);

  return { deals, loading, error };
}
