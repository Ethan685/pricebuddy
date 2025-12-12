export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  PRODUCT_DETAIL: "/products/:productId",
} as const;

export const QUERY_KEYS = {
  SEARCH: (query: string, region: string) => ["search", query, region],
  PRODUCT_DETAIL: (productId: string) => ["product", productId],
} as const;

