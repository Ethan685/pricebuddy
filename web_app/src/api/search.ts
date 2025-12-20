const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5001/pricebuddy-5a869/us-central1";

export async function searchProducts(q: string, region = "KR") {
  const url = new URL(`${BASE}/apiSearchProducts`);
  url.searchParams.set("q", q);
  url.searchParams.set("region", region);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
