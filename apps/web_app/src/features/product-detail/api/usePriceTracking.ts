import { useMutation, useQuery } from "@tanstack/react-query";
import { httpGet, httpPost } from "@/shared/lib/http";

/**
 * 상품 가격 추적 시작
 */
export function useTrackProduct() {
  return useMutation({
    mutationFn: async (data: {
      url: string;
      marketplace: string;
      productId?: string;
    }) => {
      return httpPost("/price-tracking/track", data);
    },
  });
}

/**
 * 상품 가격 히스토리 조회
 */
export function usePriceHistory(productId: string) {
  return useQuery({
    queryKey: ["price-history", productId],
    queryFn: async () => {
      return httpGet<{ history: { ts: string; totalPriceKrw: number }[] }>(
        `/price-tracking/product/${productId}/history`
      );
    },
    enabled: !!productId,
    refetchInterval: 60000, // 1분마다 갱신
  });
}

