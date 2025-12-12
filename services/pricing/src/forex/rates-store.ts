// 간단히 메모리 + Firestore/Redis 캐시로 운용 가능

let cachedRates: Record<string, number> = {
  KRW: 1,
  USD: 1350,
  JPY: 9,
  EUR: 1500,
};

export function setRates(rates: Record<string, number>) {
  cachedRates = { ...cachedRates, ...rates };
}

export function getRates() {
  return cachedRates;
}

