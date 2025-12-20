import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/shared/lib/http";
import { mockProductDetail } from "./mockData";
import type { ProductDetailResponse, PriceHistoryPointDTO } from "@pricebuddy/core";

// GA 출시: API 실패 시 Mock 데이터 사용
export function useProductDetail(productId: string) {
  return useQuery<ProductDetailResponse>({
    queryKey: ["product", productId],
    queryFn: async () => {
      try {
        const data = await httpGet<ProductDetailResponse>(`/api/products/${productId}`);
        
        // 가격 히스토리가 없으면 가져오기
        if (!data.historyDaily || data.historyDaily.length === 0) {
          try {
            const historyData = await httpGet<{ history: PriceHistoryPointDTO[] }>(
              `/api/price-tracking/products/${productId}/history`
            );
            data.historyDaily = historyData.history;
          } catch (e) {
            // 히스토리 조회 실패해도 계속 진행
            console.warn("Failed to fetch price history:", e);
          }
        }
        
        return data;
      } catch (e: any) {
        // API 실패 시 Mock 데이터로 폴백 (GA 출시 준비)
        console.warn("Product API failed, using mock data:", e?.message);
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        return {
          product: mockProductDetail.product,
          offers: mockProductDetail.offers,
          historyDaily: mockProductDetail.historyDaily,
          aiSignal: mockProductDetail.aiSignal,
        };
      }
    },
    enabled: !!productId,
    retry: false, // Mock 데이터 사용 시 재시도 불필요
    refetchInterval: 300000, // 5분마다 가격 갱신
  });
}

