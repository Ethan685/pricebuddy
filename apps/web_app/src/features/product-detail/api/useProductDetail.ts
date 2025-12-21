import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/shared/lib/http";
import { mockProductDetail } from "./mockData";
import type { ProductDetailResponse } from "@pricebuddy/core";

type ApiResp = ProductDetailResponse & { ok?: boolean };

export function useProductDetail(productId: string) {
  const useMock = import.meta.env.VITE_USE_MOCK === "1";

  return useQuery<ProductDetailResponse>({
    queryKey: ["product", productId, useMock ? "mock" : "api"],
    queryFn: async () => {
      if (useMock) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          product: mockProductDetail.product,
          offers: mockProductDetail.offers,
          historyDaily: mockProductDetail.historyDaily,
          aiSignal: mockProductDetail.aiSignal,
        };
      }

      const data = await httpGet<ApiResp>(`/api/products/${encodeURIComponent(productId)}`);
      return data as ProductDetailResponse;
    },
    enabled: !!productId,
    retry: false,
    staleTime: useMock ? Infinity : 10_000,
  });
}
