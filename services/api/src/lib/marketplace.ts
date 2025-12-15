import type { Marketplace as CoreMarketplace } from "@pricebuddy/core";

export type Marketplace = CoreMarketplace;

export function detectMarketplaceFromUrl(url: string): Marketplace {
  const u = (url || "").toLowerCase();

  if (u.includes("coupang.com")) return "coupang" as Marketplace;
  if (u.includes("smartstore.naver.com") || u.includes("naver.com")) return "naver" as Marketplace;

  if (u.includes("amazon.co.jp")) return "amazon_jp" as Marketplace;
  if (u.includes("amazon.com")) return "amazon_us" as Marketplace;

  if (u.includes("aliexpress.com")) return "aliexpress" as Marketplace;
  if (u.includes("ebay.")) return "ebay" as Marketplace;

  return "unknown" as Marketplace;
}
