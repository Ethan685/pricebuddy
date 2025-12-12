import type { Marketplace } from "@pricebuddy/core";

export interface TaxRule {
  country: string;     // 도착지 국가 코드
  thresholdKrw: number;
  rate: number;        // 0.1 = 10%
}

export const TAX_RULES: TaxRule[] = [
  // 한국
  { country: "KR", thresholdKrw: 150000, rate: 0.0 },
  
  // 일본
  { country: "JP", thresholdKrw: 0, rate: 0.1 },
  
  // 미국
  { country: "US", thresholdKrw: 0, rate: 0.07 },
  
  // 영국
  { country: "GB", thresholdKrw: 0, rate: 0.2 },
  
  // 독일
  { country: "DE", thresholdKrw: 0, rate: 0.19 },
  
  // 프랑스
  { country: "FR", thresholdKrw: 0, rate: 0.2 },
  
  // 중국
  { country: "CN", thresholdKrw: 0, rate: 0.13 },
  
  // 기타
  { country: "AU", thresholdKrw: 0, rate: 0.1 },
  { country: "CA", thresholdKrw: 0, rate: 0.13 },
  { country: "IT", thresholdKrw: 0, rate: 0.22 },
  { country: "ES", thresholdKrw: 0, rate: 0.21 },
  { country: "SG", thresholdKrw: 0, rate: 0.07 },
  { country: "MX", thresholdKrw: 0, rate: 0.16 },
  { country: "BR", thresholdKrw: 0, rate: 0.17 },
  { country: "IN", thresholdKrw: 0, rate: 0.18 },
  { country: "ID", thresholdKrw: 0, rate: 0.11 },
  { country: "TH", thresholdKrw: 0, rate: 0.07 },
  { country: "VN", thresholdKrw: 0, rate: 0.1 },
  { country: "PL", thresholdKrw: 0, rate: 0.23 },
  { country: "NL", thresholdKrw: 0, rate: 0.21 },
];

