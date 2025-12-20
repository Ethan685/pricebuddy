import { API_BASE_URL } from "../config/constants";
import { auth } from "./firebase";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type HttpOptions = {
  headers?: Record<string, string>;
  // body는 객체/문자열 둘 다 허용
  body?: any;
  // 기본은 true (쿠키/세션 필요시)
  credentials?: RequestCredentials;
  // 필요하면 쿼리 스트링
  query?: Record<string, string | number | boolean | undefined | null>;
  // 인증 토큰 자동 추가 여부 (기본: true)
  requireAuth?: boolean;
};

function buildUrl(path: string, query?: HttpOptions["query"]) {
  // path가 이미 /api로 시작하면 API_BASE_URL 무시 (중복 방지)
  if (path.startsWith("/api")) {
    const p = path;
    const url = p;
    
    if (!query) return url;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      sp.set(k, String(v));
    }
    const qs = sp.toString();
    return qs ? `${url}?${qs}` : url;
  }
  
  // API_BASE_URL이 비어있으면 상대 경로 사용 (Vite 프록시가 처리)
  const base = (API_BASE_URL || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = base ? `${base}${p}` : p;

  if (!query) return url;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${url}?${qs}` : url;
}

// Firebase Auth 토큰 가져오기
async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    console.warn("Failed to get auth token:", error);
    return null;
  }
}

async function request<T>(method: HttpMethod, path: string, opts: HttpOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query);

  // API 키가 환경 변수에 있으면 자동으로 추가
  const apiKey = (import.meta as any).env?.VITE_API_KEY;
  
  // 인증 토큰 가져오기 (requireAuth가 true이거나 명시되지 않은 경우)
  const requireAuth = opts.requireAuth !== false;
  const authToken = requireAuth ? await getAuthToken() : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(apiKey ? { "X-API-Key": apiKey } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(opts.headers || {}),
  };

  const init: RequestInit = {
    method,
    headers,
    credentials: opts.credentials ?? "include",
  };

  if (opts.body !== undefined && opts.body !== null) {
    init.body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
  }

  const res = await fetch(url, init);

  // 응답 바디 파싱 (json 우선, 실패하면 text)
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `HTTP ${res.status} ${res.statusText} - ${method} ${url}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function httpGet<T>(path: string, opts?: Omit<HttpOptions, "body">) {
  return request<T>("GET", path, opts || {});
}

export async function httpPost<T>(path: string, body?: any, opts?: HttpOptions) {
  return request<T>("POST", path, { ...(opts || {}), body });
}

export async function httpPut<T>(path: string, body?: any, opts?: HttpOptions) {
  return request<T>("PUT", path, { ...(opts || {}), body });
}

export async function httpPatch<T>(path: string, body?: any, opts?: HttpOptions) {
  return request<T>("PATCH", path, { ...(opts || {}), body });
}

export async function httpDelete<T>(path: string, opts?: HttpOptions) {
  return request<T>("DELETE", path, opts || {});
}
