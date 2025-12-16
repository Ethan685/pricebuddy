import axios from "axios";

export type NaverShoppingItem = {
  title: string;
  link: string;
  image?: string;
  lprice?: number;
  mallName?: string;
  productId?: string;
};

export async function naverShoppingSearch(query: string) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER_OPENAPI_KEYS_MISSING");
  }

  const url = "https://openapi.naver.com/v1/search/shop.json";

  const res = await axios.get(url, {
    params: { query, display: 10, start: 1, sort: "sim" },
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    timeout: 15000,
  });

  const items = (res.data?.items ?? []).map((it: any) => ({
    title: String(it.title ?? "").replace(/<[^>]+>/g, "").trim(),
    link: String(it.link ?? ""),
    image: it.image ? String(it.image) : undefined,
    lprice: it.lprice ? Number(it.lprice) : undefined,
    mallName: it.mallName ? String(it.mallName) : undefined,
    productId: it.productId ? String(it.productId) : undefined,
  })) as NaverShoppingItem[];

  return items;
}
