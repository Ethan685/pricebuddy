# PriceBuddy GA (General Availability) 아키텍처 정리

**작성일**: 2025-12-20  
**목표**: 정식 출시(GA)를 위한 구조 단일화 및 안정화

## ✅ 완료된 작업 (2025-12-20)

### 1. 리전 단일화
- **통일 리전**: `asia-northeast3` (서울)
- `firebase.json`에 리전 명시
- 모든 함수를 asia-northeast3로 통일

### 2. API 엔트리 포인트 단일화
- **단일 Express API**: `/api/*` 경로로 통합
- 파일 구조:
  - `functions/src/api.ts` - Express 앱 메인
  - `functions/src/routes/` - 라우트 핸들러들
  - `functions/src/index.ts` - 단일 export

### 3. 현재 구현된 엔드포인트

#### 핵심 기능
- ✅ `GET /api/health` - 헬스체크
- ✅ `GET /api/deals` - 딜 목록
- ✅ `GET /api/search` - 상품 검색
- ✅ `GET /api/products/:productId` - 상품 상세

#### 사용자 기능
- ✅ `GET /api/alerts` - 내 알림 목록
- ✅ `POST /api/alerts` - 가격 알림 생성
- ✅ `DELETE /api/alerts/:alertId` - 알림 삭제
- ✅ `GET /api/wishlist` - 위시리스트 조회
- ✅ `POST /api/wishlist` - 위시리스트 추가
- ✅ `DELETE /api/wishlist/:productId` - 위시리스트 제거

#### 지갑 & 수익화
- ✅ `GET /api/wallet` - 지갑 전체 정보
- ✅ `GET /api/wallet/balance` - 잔액 조회
- ✅ `GET /api/wallet/transactions` - 거래 내역
- ✅ `POST /api/payments/checkout` - 구독 결제 세션 생성
- ✅ `POST /api/payments/webhook` - Stripe 웹훅
- ✅ `GET /api/subscriptions` - 구독 정보 조회
- ✅ `GET /api/referrals/code` - 추천인 코드 조회
- ✅ `POST /api/referrals/code` - 추천인 코드 생성
- ✅ `POST /api/referrals/redeem` - 추천인 코드 사용

## 📋 남은 작업 (우선순위별)

### Phase 1: 핵심 API 통합 (1주차) ✅ 완료
- [x] `/api/alerts` - 가격 알림
- [x] `/api/wishlist` - 위시리스트
- [x] `/api/wallet` - 지갑/캐시백
- [x] `/api/subscriptions` - 구독 관리

### Phase 2: 수익화 API (2주차) ✅ 완료
- [x] `/api/payments` - 결제 처리
- [x] `/api/referrals` - 추천인
- [ ] `/api/cashback` - 캐시백 정산 (wallet에 포함됨)

### Phase 3: 고급 기능 (3주차)
- [ ] `/api/recommendations` - 추천
- [ ] `/api/price-tracking` - 가격 추적
- [ ] `/api/comparison` - 가격 비교

### Phase 4: B2B/Enterprise (4주차)
- [ ] `/api/enterprise` - 엔터프라이즈 API
- [ ] `/api/bulk` - 대량 처리
- [ ] `/api/export` - 데이터 내보내기

## 🔧 기술 스택

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express 5.x
- **Functions**: Firebase Functions v2
- **Region**: asia-northeast3
- **Database**: Firestore

### Frontend
- **Framework**: React + Vite
- **API Base**: `/api/*` (Vite proxy 통해 Functions로 전달)

## 📊 개발 시간 재산정 (GA 기준)

### 현재 상태 기준
- **이미 구현됨**: 60-70%
- **남은 작업**: 정리/통합/안정화 중심

### 시간 추정
| 작업 | 시간 |
|------|------|
| API 통합 (Phase 1-2) | 40-60h |
| 수익화 마감 | 60-90h |
| 확장(MV3) 안정화 | 40-60h |
| QA/버그 수정 | 25-35h |
| **합계** | **165-245h** |

**현실적 베이스**: 200-250h (4-6주 집중 개발)

## 🚀 배포 구조

### 개발 환경
```
Frontend: http://127.0.0.1:5173
Functions: http://127.0.0.1:5001
Firestore: http://127.0.0.1:8080
```

### 프로덕션 환경
```
Frontend: https://pricebuddy-5a869.web.app
API: https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api
```

## 📝 마이그레이션 가이드

### 기존 함수 → Express 라우트 변환

**Before (onRequest)**:
```typescript
export const myFunction = functions.region("asia-northeast3").https.onRequest(async (req, res) => {
  // 로직
});
```

**After (Express Route)**:
```typescript
// routes/my-route.ts
export async function myHandler(req: Request, res: Response) {
  // 로직
}

// api.ts
import { myHandler } from "./routes/my-route";
apiRouter.get("/my-endpoint", myHandler);
```

### 기존 함수 → Express 라우트 변환 (onCall)

**Before (onCall)**:
```typescript
export const myCallable = functions.https.onCall(async (data, context) => {
  return { result: "ok" };
});
```

**After (Express Route)**:
```typescript
// routes/my-route.ts
export async function myHandler(req: Request, res: Response) {
  const data = req.body;
  // context 대신 req에서 사용자 정보 추출
  res.json({ result: "ok" });
}
```

## 🔒 보안 및 컴플라이언스

### API 키 검증
- 개발 환경: 검증 우회 (에뮬레이터)
- 프로덕션: `X-API-Key` 헤더 필수

### CORS 설정
- 개발: localhost/127.0.0.1 자동 허용
- 프로덕션: `ALLOWED_ORIGINS` 환경 변수로 관리

## 📈 다음 단계

1. **즉시**: 핵심 API 통합 완료 (deals, search, products)
2. **1주차**: 수익화 API 통합 (subscriptions, payments, wallet)
3. **2주차**: 확장(MV3) 안정화 및 테스트
4. **3주차**: QA 및 버그 수정
5. **4주차**: 스토어 제출 및 리젝 대응

## 🎯 GA 게이트 체크리스트

- [ ] 단일 API (`/api/*`) + 단일 리전
- [ ] 결제/플랜 게이팅 OK (실결제 10번 연속 성공)
- [ ] 어필리에이트/딥링크 트래킹 OK
- [ ] 확장 핵심 도메인 3-5개 회귀테스트 통과
- [ ] 알림/스케줄러 비용 상한 + 차단 대응 플랜 OK

---

**참고**: 이 문서는 마스터브리프 v4.2 기준으로 작성되었으며, GA 목표일(2026-02)까지 지속적으로 업데이트됩니다.
