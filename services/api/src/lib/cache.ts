const store = new Map<string, number>();

export function isFresh(key: string, ttlMs: number): boolean {
  const t = store.get(key);
  if (!t) return false;
  return Date.now() - t < ttlMs;
}

export function touch(key: string): void {
  store.set(key, Date.now());
}
