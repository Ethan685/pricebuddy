# PriceBuddy API 엔드포인트 목록

**기준**: GA 구조 (단일 Express API, `/api/*` 경로)

## 📍 기본 정보

- **Base URL**: `https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api`
- **로컬 개발**: `http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api`
- **인증**: `Authorization: Bearer <Firebase Auth Token>` (대부분의 엔드포인트)

## 🔌 API 엔드포인트

### 헬스체크
- `GET /api/health` - 서버 상태 확인

### 핵심 기능

#### 딜 (Deals)
- `GET /api/deals?limit={number}` - 딜 목록 조회

#### 검색 (Search)
- `GET /api/search?query={string}&region={string}` - 상품 검색
- `POST /api/search` - 상품 검색 (POST)

#### 상품 (Products)
- `GET /api/products/:productId` - 상품 상세 정보

### 사용자 기능

#### 알림 (Alerts)
- `GET /api/alerts` - 내 알림 목록 (인증 필요)
- `POST /api/alerts` - 가격 알림 생성 (인증 필요)
  - Body: `{ productId, targetPrice, currentPrice, email? }`
- `DELETE /api/alerts/:alertId` - 알림 삭제 (인증 필요)

#### 위시리스트 (Wishlist)
- `GET /api/wishlist?userId={string}` - 위시리스트 조회 (인증 필요)
- `POST /api/wishlist` - 위시리스트 추가 (인증 필요)
  - Body: `{ productId, productData }`
- `DELETE /api/wishlist/:productId` - 위시리스트 제거 (인증 필요)

### 지갑 & 수익화

#### 지갑 (Wallet)
- `GET /api/wallet` - 지갑 전체 정보 (인증 필요)
- `GET /api/wallet/balance?userId={string}` - 잔액 조회 (인증 필요)
- `GET /api/wallet/transactions?userId={string}&limit={number}` - 거래 내역 (인증 필요)

#### 결제 & 구독 (Payments & Subscriptions)
- `POST /api/payments/checkout` - Stripe 결제 세션 생성 (인증 필요)
  - Body: `{ planId }`
- `POST /api/payments/webhook` - Stripe 웹훅 (외부 호출)
- `GET /api/subscriptions` - 구독 정보 조회 (인증 필요)

#### 추천인 (Referrals)
- `GET /api/referrals/code?userId={string}` - 추천인 코드 조회 (인증 필요)
- `POST /api/referrals/code` - 추천인 코드 생성 (인증 필요)
- `POST /api/referrals/redeem` - 추천인 코드 사용 (인증 필요)
  - Body: `{ code }`

### 고급 기능

#### 가격 추적 (Price Tracking)
- `GET /api/price-tracking/products/:productId/history?merchantName={string}&daysBack={number}` - 가격 히스토리 조회
- `POST /api/price-tracking/snapshot` - 가격 스냅샷 기록
  - Body: `{ productId, merchantName, price, currency, source? }`

#### 피드 (Feed)
- `GET /api/feed?limit={number}` - 개인화된 피드 조회 (인증 선택)

#### 엔터프라이즈 (Enterprise)
- `GET /api/enterprise/products?limit={number}` - 상품 목록 (Enterprise API 키 필요)
- `GET /api/enterprise/bulk?limit={number}` - 대량 데이터 조회 (Enterprise API 키 필요)

## 🔐 인증

### Firebase Auth (대부분의 엔드포인트)
```http
Authorization: Bearer <Firebase Auth Token>
```

### API Key (Enterprise 엔드포인트)
```http
X-API-Key: <Enterprise API Key>
```

## 📝 응답 형식

### 성공 응답
```json
{
  "ok": true,
  "data": { ... }
}
```

### 에러 응답
```json
{
  "error": "Error message",
  "message": "Detailed error message"
}
```

## 🧪 테스트

### 로컬 테스트
```bash
# Health check
curl http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api/health

# Deals
curl "http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api/deals?limit=5"

# Search (인증 없이, 개발 환경)
curl "http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api/search?query=iphone&region=KR"
```

### 프론트엔드에서 사용
```typescript
import { httpGet, httpPost } from "@/shared/lib/http";

// 자동으로 Authorization 헤더 추가됨
const deals = await httpGet("/api/deals", { query: { limit: 10 } });
const alert = await httpPost("/api/alerts", { productId, targetPrice });
```

---

**참고**: 모든 엔드포인트는 CORS가 설정되어 있으며, 개발 환경에서는 API 키 검증이 우회됩니다.
