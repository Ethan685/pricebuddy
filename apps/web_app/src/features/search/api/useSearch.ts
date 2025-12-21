import { useEffect, useMemo, useState } from "react";
import { httpGet } from "../../../shared/lib/http";
import { mockSearchResults } from "@/shared/data/mockSearch";

export type SearchItem = {
  id?: string;
  productId?: string;
  title: string;
  image?: string;
  imageUrl?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minPriceKrw?: number;
  maxPriceKrw?: number;
  currency?: string;
  offers?: any[];
  offerCount?: number;
  priceHistory?: any[];
  priceChange?: number;
  priceChangePercent?: number;
};

export type SearchResponse = {
  ok: boolean;
  q: string;
  region: string;
  results: SearchItem[];
};

type State = {
  loading: boolean;
  error: string | null;
  data: SearchResponse | null;
};

export function useSearch(query: string, region?: string) {
  const useMock = import.meta.env.VITE_USE_MOCK === "1";

  const q = (query || "").trim();
  const r = (region || "KR").trim();

  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    data: null,
  });

  const enabled = q.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!enabled) {
        setState({ loading: false, error: null, data: null });
        return;
      }

      setState((s) => ({ ...s, loading: true, error: null }));

      if (useMock) {
        setTimeout(() => {
          if (cancelled) return;
          const safe: SearchResponse = {
            ok: true,
            q,
            region: r,
            results: mockSearchResults,
          };
          setState({ loading: false, error: null, data: safe });
        }, 200);
        return;
      }

      try {
        const data = await httpGet<any>(`/api/search?q=${encodeURIComponent(q)}&region=${encodeURIComponent(r)}`);
        // API returns { results: [...] }, but we also check items for compatibility
        const rawList = data?.results || data?.items;
        const raw = Array.isArray(rawList) ? rawList : [];
        const results = raw.map((x: any) => ({
          ...x,
          id: x.id ?? x.productId,
          productId: x.productId ?? x.id,
          image: x.image ?? x.imageUrl,
          imageUrl: x.imageUrl ?? x.image
        }));
        const safe: SearchResponse = {
          ok: true,
          q,
          region: r,
          results,
        };
        if (!cancelled) setState({ loading: false, error: null, data: safe });
      } catch (e: any) {
        if (!cancelled) setState({ loading: false, error: String(e?.message || e), data: null });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [enabled, q, r, useMock]);

  const results = useMemo(() => state.data?.results ?? [], [state.data]);

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    results,
    enabled,
  };
}
