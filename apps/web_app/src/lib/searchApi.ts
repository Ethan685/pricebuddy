export type Region = 'KR' | 'US' | 'JP' | string;

export interface SearchItem {
  id: string;
  productId: string;
  title: string;
  imageUrl?: string;
  minPriceKrw?: number;
  maxPriceKrw?: number;
  currency?: string;
}

export interface SearchResponse {
  query: string;
  region: string;
  items: SearchItem[];
  total: number;
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? ''; // same-origin default

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${path}\n${text}`);
  }
  return res.json() as Promise<T>;
}

export function apiSearchProducts(query: string, region: Region = 'KR') {
  const q = encodeURIComponent(query ?? '');
  const r = encodeURIComponent(String(region ?? ''));
  return http<SearchResponse>(`/api/apiSearchProducts?query=${q}&region=${r}`);
}

export function getDeals() {
  return http<{ deals: any[]; total: number }>(`/api/deals`);
}

export function getWishlist(userId: string) {
  const u = encodeURIComponent(userId ?? '');
  return http<{ userId: string; items: any[] }>(`/api/wishlist?userId=${u}`);
}

export function addWishlistItem(userId: string, productId: string) {
  return http<{ ok: boolean; userId: string; productId: string }>(`/api/wishlist`, {
    method: 'POST',
    body: JSON.stringify({ userId, productId }),
  });
}

export function deleteWishlistItem(itemId: string, userId: string) {
  const u = encodeURIComponent(userId ?? '');
  const i = encodeURIComponent(itemId ?? '');
  return http<{ ok: boolean; userId: string; itemId: string }>(`/api/wishlist/${i}?userId=${u}`, {
    method: 'DELETE',
  });
}

export function getProduct(productId: string) {
  const p = encodeURIComponent(productId ?? '');
  return http<any>(`/api/product/${p}`);
}

export function getPriceHistory(productId: string) {
  const p = encodeURIComponent(productId ?? '');
  return http<any>(`/api/priceTracking/product/${p}/history`);
}

export function getTrackingStatus(productId: string) {
  const p = encodeURIComponent(productId ?? '');
  return http<any>(`/api/priceTracking/product/${p}/status`);
}
