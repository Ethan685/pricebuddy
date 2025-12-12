# 수정 사항 요약

## ✅ 해결된 문제

### 1. 언어 반영 문제
- **문제**: 랜딩 페이지와 다른 페이지들이 하드코딩된 한국어 텍스트 사용
- **해결**: 
  - 모든 텍스트를 i18n 번역 키로 변경
  - 13개 언어에 랜딩 페이지 번역 추가
  - `useLanguage` 훅을 모든 페이지에 적용

### 2. 상품 트래킹 문제
- **문제**: 상품 상세 페이지에서 실제 가격 추적이 되지 않음
- **해결**:
  - 가격 추적 API 엔드포인트 추가 (`/price-tracking/track`)
  - 가격 히스토리 조회 API 추가 (`/price-tracking/product/:productId/history`)
  - 상품 상세 페이지에 "가격 추적 시작" 버튼 추가
  - 자동 가격 업데이트 스케줄러 구현
  - 가격 변경 시 히스토리에 자동 저장

---

## 📝 구현된 기능

### 가격 추적 시스템
1. **수동 추적 시작**
   - 상품 상세 페이지에서 "가격 추적 시작" 버튼 클릭
   - 스크래퍼로 현재 가격 가져오기
   - 가격 계산 및 저장
   - 히스토리 초기화

2. **자동 가격 업데이트**
   - Firebase Functions 스케줄러 (매 시간 실행)
   - 활성화된 상품들의 가격 자동 갱신
   - 가격 변경 시 히스토리에 기록

3. **가격 히스토리**
   - Firestore에 가격 변경 이력 저장
   - 상품별/offer별 히스토리 조회
   - 차트에 표시

---

## 🔧 수정된 파일

### Frontend
- `apps/web_app/src/features/landing/pages/LandingPage.tsx` - i18n 적용
- `apps/web_app/src/features/product-detail/pages/ProductDetailPage.tsx` - 가격 추적 버튼 추가
- `apps/web_app/src/features/product-detail/api/useProductDetail.ts` - 히스토리 자동 조회
- `apps/web_app/src/features/product-detail/api/usePriceTracking.ts` - 새로 생성
- `apps/web_app/src/shared/lib/i18n.ts` - 랜딩 페이지 번역 추가

### Backend
- `services/api/src/routes/price-tracking.ts` - 새로 생성
- `services/api/src/routes/product-detail.ts` - 히스토리 및 AI 신호 추가
- `services/api/src/routes/price-scheduler.ts` - 새로 생성 (스케줄러)
- `services/api/src/clients/scraper-client.ts` - 타입 확장

---

## 🚀 사용 방법

### 가격 추적 시작
1. 상품 상세 페이지로 이동
2. "가격 추적 시작" 버튼 클릭
3. 가격이 자동으로 추적되기 시작
4. 가격 히스토리 차트에서 변동 확인

### 언어 변경
1. 헤더의 언어 선택기에서 원하는 언어 선택
2. 모든 텍스트가 선택한 언어로 변경됨

---

## 📊 데이터 구조

### price_history 컬렉션
```
price_history/{offerId}/history/{entryId}
  - priceKrw: number
  - timestamp: string (ISO)
  - productId: string
```

### offers 컬렉션
```
offers/{offerId}
  - productId: string
  - marketplace: string
  - url: string
  - basePrice: number
  - totalPriceKrw: number
  - lastFetchedAt: string
```

---

**현재 상태**: 언어 반영 및 가격 추적 기능 완료! ✅

