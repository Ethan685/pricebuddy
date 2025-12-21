const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "/api";

export async function apiGet<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${txt}`);
  }

  return res.json() as Promise<T>;
}
