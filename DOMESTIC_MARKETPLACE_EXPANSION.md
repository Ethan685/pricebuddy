# 국내 쇼핑몰 확대 완료 보고서

**작성일**: 2024-12-12  
**작업 내용**: 국내 주요 쇼핑몰 4개 추가 (옥션, 인터파크, 티몬, 위메프)

---

## ✅ 추가된 마켓플레이스

### 1. 옥션 (auction)
- **도메인**: auction.co.kr
- **배송비**: 기본 3,000원 + 1kg당 800원
- **캐시백**: 3%
- **특징**: 이베이 계열, 중고/신상품 혼합

### 2. 인터파크 (interpark)
- **도메인**: interpark.com
- **배송비**: 기본 3,000원 + 1kg당 800원
- **캐시백**: 3%
- **특징**: 티켓팅/여행 + 쇼핑몰 통합

### 3. 티몬 (tmon)
- **도메인**: tmon.co.kr
- **배송비**: 기본 2,500원 + 1kg당 700원
- **캐시백**: 4%
- **특징**: 딜 기반 쇼핑몰, 특가 상품 중심

### 4. 위메프 (wemakeprice)
- **도메인**: wemakeprice.com
- **배송비**: 기본 2,500원 + 1kg당 700원
- **캐시백**: 4%
- **특징**: 딜 기반 쇼핑몰, 타임세일 중심

---

## 📊 업데이트 전후 비교

### 업데이트 전
- **한국 쇼핑몰**: 4개
  - 쿠팡, 네이버, 지마켓, 11번가

### 업데이트 후
- **한국 쇼핑몰**: 8개
  - 쿠팡, 네이버, 지마켓, 11번가, **옥션, 인터파크, 티몬, 위메프**

**100% 증가** (4개 → 8개)

---

## 🔧 업데이트된 파일

### 1. 타입 정의
- **파일**: `libs/core/src/domain/product.ts`
- **변경**: Marketplace 타입에 4개 마켓플레이스 추가
  ```typescript
  | "auction"
  | "interpark"
  | "tmon"
  | "wemakeprice"
  ```

### 2. 스크래퍼 설정
- **파일**: `services/scraper/src/config/auction.ts`
- **파일**: `services/scraper/src/config/interpark.ts`
- **파일**: `services/scraper/src/config/tmon.ts`
- **파일**: `services/scraper/src/config/wemakeprice.ts`
- **내용**: 각 마켓플레이스별 DOM 셀렉터 정의

### 3. 스크래퍼 파서
- **파일**: `services/scraper/src/scrape.ts`
- **변경**: switch 문에 4개 케이스 추가
  ```typescript
  case "auction":
    return parseWithConfig(raw, auctionSelectors, "KRW");
  case "interpark":
    return parseWithConfig(raw, interparkSelectors, "KRW");
  case "tmon":
    return parseWithConfig(raw, tmonSelectors, "KRW");
  case "wemakeprice":
    return parseWithConfig(raw, wemakepriceSelectors, "KRW");
  ```

### 4. 배송비 규칙
- **파일**: `services/pricing/src/data/shipping-rules.ts`
- **변경**: 각 마켓플레이스별 배송비 규칙 추가
  ```typescript
  { marketplace: "auction", baseFee: 3000, perKgFee: 800 },
  { marketplace: "interpark", baseFee: 3000, perKgFee: 800 },
  { marketplace: "tmon", baseFee: 2500, perKgFee: 700 },
  { marketplace: "wemakeprice", baseFee: 2500, perKgFee: 700 },
  ```

### 5. 캐시백 비율
- **파일**: `services/api/src/routes/cashback.ts`
- **변경**: 각 마켓플레이스별 캐시백 비율 추가
  ```typescript
  auction: 0.03,      // 3%
  interpark: 0.03,    // 3%
  tmon: 0.04,         // 4%
  wemakeprice: 0.04,  // 4%
  ```

### 6. Chrome Extension
- **파일**: `apps/extension/src/content-script.ts`
- **변경**: 각 마켓플레이스 자동 감지 로직 추가

---

## 💡 기대 효과

### 1. 사용자 가치 향상
- **가격 비교 범위 확대**: 4개 → 8개 쇼핑몰
- **최저가 발견 확률 증가**: 더 많은 옵션 비교 가능
- **캐시백 기회 확대**: 추가 마켓플레이스에서 캐시백 받기

### 2. 비즈니스 가치
- **제휴 수수료 확대**: 더 많은 마켓플레이스 제휴
- **사용자 만족도 향상**: 더 정확한 가격 비교
- **경쟁력 강화**: 국내 최대 규모 가격 비교 서비스

### 3. 실제 사용 시나리오
```
사용자: "아이폰 15 케이스 찾고 있어"
→ 쿠팡: 18,000원
→ 네이버: 17,000원
→ 지마켓: 16,000원
→ 11번가: 17,500원
→ 옥션: 15,500원 ← 새로 추가
→ 인터파크: 16,500원 ← 새로 추가
→ 티몬: 15,000원 ← 새로 추가 (최저가!)
→ 위메프: 15,200원 ← 새로 추가

✅ 최저가: 티몬 15,000원 (3,000원 절약)
✅ 캐시백: 600원 (4%)
✅ 총 절약: 3,600원
```

---

## 🚀 다음 단계 제안

### 1. 추가 마켓플레이스 확대
- **옥션 글로벌** (auction.co.kr/global)
- **G마켓 글로벌** (gmarket.co.kr/global)
- **티몬 글로벌** (tmon.co.kr/global)
- **위메프 글로벌** (wemakeprice.com/global)

### 2. 캐시백 비율 상향 협상
- 현재: 평균 3-4%
- 목표: 평균 5-7%
- 방법: 제휴 프로그램 협상, 사용자 트래픽 증명

### 3. 가격 예측 AI 기능
- 가격 변동 패턴 분석
- 최적 구매 시점 예측
- "지금 사야 할까요, 기다려야 할까요?" 알림

### 4. 사용자 경험 개선
- 빠른 가격 비교 UI
- 실시간 재고 확인
- 쿠폰/할인 정보 통합

---

## 📈 통계

### 지원 마켓플레이스
- **한국**: 8개 (쿠팡, 네이버, 지마켓, 11번가, 옥션, 인터파크, 티몬, 위메프)
- **일본**: 4개
- **미국/캐나다**: 9개
- **유럽**: 15개
- **아시아 태평양**: 7개
- **라틴 아메리카**: 3개
- **중국**: 3개
- **기타**: 5개

**총 54개 마켓플레이스 지원**

---

## ✅ 완료 체크리스트

- [x] Marketplace 타입 정의 업데이트
- [x] 스크래퍼 설정 파일 생성 (4개)
- [x] 스크래퍼 파서 케이스 추가
- [x] 배송비 규칙 추가
- [x] 캐시백 비율 추가
- [x] Chrome Extension 감지 추가
- [x] 린터 오류 확인 (없음)
- [x] 문서화 완료

---

**작업 완료!** 🎉

이제 사용자는 8개의 국내 쇼핑몰에서 가격을 비교하고 캐시백을 받을 수 있습니다.

