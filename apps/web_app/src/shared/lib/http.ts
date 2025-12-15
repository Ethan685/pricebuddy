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

export function httpGet<T>(url: string): Promise<T> {
  return http<T>(url, { method: "GET" });
}

export function httpPost<T>(url: string, body?: unknown): Promise<T> {
  return http<T>(url, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
}

export function httpDelete<T>(url: string): Promise<T> {
  return http<T>(url, { method: "DELETE" });
}
