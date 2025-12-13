import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/shared/lib/http";

export interface Purchase {
  id: string;
  productId: string;
  productTitle: string;
  marketplace: string;
  purchasePrice: number;
  originalPrice?: number;
  expectedPrice?: number;
  savedAmount: number;
  savedPercent?: number;
  purchasedAt: string;
}

interface PurchasesResponse {
  purchases: Purchase[];
  stats?: {
    totalCount: number;
    totalSaved: number;
    averageSavingsRate: number;
  };
}

// API 응답을 내부 형식으로 변환
function transformResponse(data: PurchasesResponse): {
  purchases: Purchase[];
  totalSaved: number;
  averageSavedPercent: number;
} {
  return {
    purchases: data.purchases,
    totalSaved: data.stats?.totalSaved || 0,
    averageSavedPercent: data.stats?.averageSavingsRate || 0,
  };
}

export function usePurchases(userId?: string) {
  return useQuery({
    queryKey: ["purchases", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      const data = await httpGet<PurchasesResponse>(`/purchases?userId=${userId}`);
      return transformResponse(data);
    },
    enabled: !!userId,
    retry: 1,
  });
}
