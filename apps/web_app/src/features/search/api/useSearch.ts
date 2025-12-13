import { useQuery } from "@tanstack/react-query";
import { httpGet } from "@/shared/lib/http";
import { mockSearchResults } from "./mockData";

export interface SearchResultItem {
  productId: string;
  title: string;
  imageUrl?: string;
  minPriceKrw: number;
  maxPriceKrw: number;
  priceChangePct?: number;
}

interface SearchResponse {
  query: string;
  region: string;
  results: SearchResultItem[];
}

// 프로덕션에서는 항상 실제 API 사용
const USE_MOCK_DATA = false; // import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL;

export function useSearch(query: string, region: string) {
  return useQuery<SearchResponse>({
    queryKey: ["search", query, region],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // Mock 데이터 반환 (API 서버가 없을 때)
        await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        
        // 검색 쿼리 정규화 (공백 제거, 소문자 변환)
        const normalizedQuery = query.toLowerCase().replace(/\s+/g, "");
        
        // 필터링: 제목에서 공백을 제거하고 비교
        const filtered = mockSearchResults.filter((item) => {
          const normalizedTitle = item.title.toLowerCase().replace(/\s+/g, "");
          return normalizedTitle.includes(normalizedQuery) || 
                 normalizedQuery.includes("iphone") || 
                 normalizedQuery.length === 0;
        });
        
        // 쿼리가 비어있거나 "iphone" 관련이면 모든 결과 반환
        const results = normalizedQuery.length === 0 || normalizedQuery.includes("iphone")
          ? mockSearchResults
          : filtered;
        
        return {
          query,
          region,
          results,
        };
      }
      return httpGet("/search", { q: query, region });
    },
    enabled: !!query,
    retry: USE_MOCK_DATA ? false : 1, // Mock 모드에서는 재시도 안 함
  });
}

