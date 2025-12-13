import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/shared/lib/http";
import { mockProductDetail } from "./mockData";

export interface ProductDetail {
  product: any;    // 실제 타입은 core Product
  offers: any[];   // core Offer + priced fields
  history?: { ts: string; totalPriceKrw: number }[];
  aiSignal?: { label: "BUY" | "WAIT"; confidence: number; reason: string };
}

// 프로덕션에서는 항상 실제 API 사용
const USE_MOCK_DATA = false; // import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL;

export function useProductDetail(productId: string) {
  return useQuery<ProductDetail>({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Mock 데이터 반환 (API 서버가 없을 때)
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        return mockProductDetail;
      }
      const data = await httpGet<ProductDetail>(`/getProduct/${productId}`);
      
      // 가격 히스토리가 없으면 가져오기
      if (!data.history || data.history.length === 0) {
        try {
          const historyData = await httpGet<{ history: { ts: string; totalPriceKrw: number }[] }>(
            `/priceTracking/product/${productId}/history`
          );
          data.history = historyData.history;
        } catch (e) {
          // 히스토리 조회 실패해도 계속 진행
          console.warn("Failed to fetch price history:", e);
        }
      }
      
      return data;
    },
    enabled: !!productId,
    retry: USE_MOCK_DATA ? false : 1,
    refetchInterval: 300000, // 5분마다 가격 갱신
  });
}

