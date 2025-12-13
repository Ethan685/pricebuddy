import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/shared/lib/http";

export interface Deal {
  id: string;
  productId: string;
  title: string;
  imageUrl?: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  marketplace: string;
  validUntil: string;
  isFlashDeal: boolean;
}

interface DealsResponse {
  deals: Deal[];
}

export function useDeals() {
  return useQuery<DealsResponse>({
    queryKey: ["deals"],
    queryFn: async () => {
      return httpGet<DealsResponse>("/deals");
    },
    retry: 1,
    refetchInterval: 300000, // 5분마다 갱신
  });
}

