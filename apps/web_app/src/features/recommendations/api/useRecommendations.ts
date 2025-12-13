import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/shared/lib/http";

export interface Recommendation {
  productId: string;
  title: string;
  reason: string;
  confidence: number;
  minPrice: number;
  imageUrl?: string;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
}

export function useRecommendations(userId?: string) {
  return useQuery<RecommendationsResponse>({
    queryKey: ["recommendations", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      return httpGet<RecommendationsResponse>(`/recommendations?userId=${userId}`);
    },
    enabled: !!userId,
    retry: 1,
    refetchInterval: 600000, // 10분마다 갱신
  });
}

