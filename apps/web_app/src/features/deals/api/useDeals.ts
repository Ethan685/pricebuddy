import { useEffect, useMemo, useState } from "react";
import { httpGet } from "@/shared/lib/http";
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
  const useMock = import.meta.env.VITE_USE_MOCK === "1";

  const [deals, setDeals] = useState<Deal[]>(mockDeals.slice(0, limit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);

      if (useMock) {
        setDeals(mockDeals.slice(0, limit));
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await httpGet<DealsResponse>(`/api/deals?limit=${encodeURIComponent(String(limit))}`);
        const list = Array.isArray(data?.deals) ? data.deals.map(normalizeDeal) : [];
        if (!cancelled) setDeals(list.slice(0, limit));
      } catch (e: any) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [limit, useMock]);

  const sliced = useMemo(() => deals.slice(0, limit), [deals, limit]);

  return {
    deals: sliced,
    loading,
    error,
  };
}
