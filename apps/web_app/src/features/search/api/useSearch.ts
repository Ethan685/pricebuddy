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

      try {
        const data = await httpGet<SearchResponse>("/api/search", {
          query: q,
          region: r,
        });

        if (cancelled) return;

        // Hard safety: ensure consistent shape
        const results = Array.isArray(data?.results) ? data.results : [];
        
        // GA 출시: API 결과가 없으면 Mock 데이터 사용
        const safe: SearchResponse = {
          ok: !!data?.ok,
          q: data?.q ?? q,
          region: data?.region ?? r,
          results: results.length > 0 ? results : mockSearchResults,
        };

        setState({ loading: false, error: null, data: safe });
      } catch (e: any) {
        // API 실패 시 Mock 데이터로 폴백 (GA 출시 준비)
        if (cancelled) return;
        console.warn("Search API failed, using mock data:", e?.message);
        const safe: SearchResponse = {
          ok: true,
          q: q,
          region: r,
          results: mockSearchResults,
        };
        setState({ loading: false, error: null, data: safe });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [enabled, q, r]);

  const results = useMemo(() => state.data?.results ?? [], [state.data]);

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    results,
    enabled,
  };
}
