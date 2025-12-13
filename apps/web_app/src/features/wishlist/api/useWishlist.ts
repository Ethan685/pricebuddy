import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpGet, httpPost, httpDelete } from "@/shared/lib/http";

export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  imageUrl?: string;
  minPriceKrw: number;
  maxPriceKrw: number;
  priceChangePct?: number;
  addedAt: string;
}

interface WishlistResponse {
  items: WishlistItem[];
}

export function useWishlist(userId?: string) {
  return useQuery<WishlistResponse>({
    queryKey: ["wishlist", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");
      return httpGet<WishlistResponse>(`/wishlist?userId=${userId}`);
    },
    enabled: !!userId,
    retry: 1,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, productId }: { userId: string; productId: string }) => {
      return httpPost("/wishlist", { userId, productId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", variables.userId] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, itemId }: { userId: string; itemId: string }) => {
      return httpDelete(`/wishlist/${itemId}?userId=${userId}&itemId=${itemId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", variables.userId] });
    },
  });
}

