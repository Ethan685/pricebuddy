export type Marketplace =
  | "coupang"
  | "naver"
  | "amazon"
  | "aliexpress"
  | "ebay"
  | "unknown";

export function detectMarketplaceFromUrl(url: string): Marketplace {
  if (url.includes("coupang")) return "coupang";
  if (url.includes("naver")) return "naver";
  if (url.includes("amazon")) return "amazon";
  if (url.includes("aliexpress")) return "aliexpress";
  if (url.includes("ebay")) return "ebay";
  return "unknown";
}
