import type { Marketplace } from "./marketplace";

export async function generateAffiliateLink(
  marketplace: Marketplace,
  url: string,
  userId?: string
): Promise<string> {
  const u = new URL(url);

  if (userId) u.searchParams.set("pb_uid", userId);
  u.searchParams.set("pb_src", String(marketplace));

  return u.toString();
}
