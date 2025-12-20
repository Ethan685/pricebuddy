const BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const KEY = import.meta.env.VITE_API_KEY as string | undefined;

if (!BASE) {
  console.warn("[apiClient] VITE_API_BASE_URL is missing");
}

export async function apiGet<T>(path: string, params?: Record<string, string>) {
  const url = new URL((BASE || "").replace(/\/$/, "") + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(KEY ? { "X-API-Key": KEY } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[apiClient] ${res.status} ${res.statusText} ${text}`.trim());
  }

  return (await res.json()) as T;
}
