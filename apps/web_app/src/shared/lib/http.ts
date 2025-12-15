export async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

function withParams(url: string, params?: Record<string, any>) {
  if (!params) return url;
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    u.searchParams.set(k, String(v));
  }
  return u.pathname + (u.search ? u.search : "");
}

export function httpGet<T>(url: string, params?: Record<string, any>): Promise<T> {
  return http<T>(withParams(url, params), { method: "GET" });
}

export function httpPost<T>(url: string, body?: unknown): Promise<T> {
  return http<T>(url, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

export function httpDelete<T>(url: string): Promise<T> {
  return http<T>(url, { method: "DELETE" });
}
