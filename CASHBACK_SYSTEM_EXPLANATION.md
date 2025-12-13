# PriceBuddy 캐시백 시스템 작동 방식

## 🎯 개요

PriceBuddy의 캐시백 시스템은 **제휴 프로그램(Affiliate Program)**을 통해 작동합니다. 사용자가 PriceBuddy를 통해 생성된 제휴 링크로 구매하면, 마켓플레이스로부터 받은 제휴 수수료의 일부를 사용자에게 캐시백으로 지급합니다.

---

## 📊 전체 플로우

```
1. 사용자가 상품 선택
   ↓
2. PriceBuddy가 제휴 링크 생성
   ↓
3. 사용자가 제휴 링크로 구매
   ↓
4. 마켓플레이스가 PriceBuddy에 제휴 수수료 지급
   ↓
5. PriceBuddy가 사용자에게 캐시백 지급
```

---

## 🔄 단계별 상세 설명

### 1단계: 제휴 링크 생성

**API 엔드포인트:**
```
POST /cashback/generate-link
```

**요청 예시:**
```json
{
  "userId": "user123",
  "productUrl": "https://www.coupang.com/vp/products/123456",
  "marketplace": "coupang"
}
```

**처리 과정:**
1. 마켓플레이스별 제휴 API 호출
2. 원본 URL에 제휴 추적 파라미터 추가
3. 제휴 링크를 데이터베이스에 저장

**응답 예시:**
```json
{
  "id": "link456",
  "affiliateLink": "https://www.coupang.com/vp/products/123456?partnerId=PRICEBUDDY&subId=user123&source=pricebuddy",
  "originalUrl": "https://www.coupang.com/vp/products/123456"
}
```

**제휴 링크 생성 방식 (마켓플레이스별):**

#### 쿠팡 (Coupang)
```typescript
// 원본 URL에 파라미터 추가
originalUrl + "?partnerId=PRICEBUDDY&subId=userId&source=pricebuddy"
```

#### 네이버 쇼핑 (Naver)
```typescript
// 원본 URL에 파라미터 추가
originalUrl + "?affiliateId=PRICEBUDDY&subId=userId"
```

#### 아마존 (Amazon)
```typescript
// Amazon Associate 태그 추가
originalUrl + "?tag=pricebuddy-20&linkCode=as2&creative=9325"
```

#### 라쿠텐 (Rakuten)
```typescript
// 라쿠텐 어필리에이트 파라미터 추가
originalUrl + "?afid=PRICEBUDDY&sid=SITE_ID&subid=userId"
```

#### 이베이 (eBay)
```typescript
// eBay 파트너 네트워크 파라미터 추가
originalUrl + "?mkevt=1&mkcid=1&mkrid=PRICEBUDDY&customid=userId"
```

---

### 2단계: 사용자 구매

사용자가 생성된 제휴 링크를 클릭하고 구매를 완료합니다.

**중요 사항:**
- 제휴 링크를 통해서만 캐시백이 지급됩니다
- 직접 마켓플레이스에 접속하면 캐시백이 없습니다
- 쿠키 기반 추적 (일반적으로 24-30일 유효)

---

### 3단계: 구매 추적 및 캐시백 적립

**API 엔드포인트:**
```
POST /cashback/track-purchase
```

**요청 예시:**
```json
{
  "userId": "user123",
  "linkId": "link456",
  "orderId": "order789",
  "purchaseAmount": 100000,
  "marketplace": "coupang"
}
```

**처리 과정:**

1. **제휴 링크 확인**
   ```typescript
   // linkId로 제휴 링크 정보 조회
   const linkData = await firestore
     .collection("affiliate_links")
     .doc(linkId)
     .get();
   ```

2. **캐시백 비율 계산**
   ```typescript
   // 마켓플레이스별 캐시백 비율
   const rate = AFFILIATE_RATES[marketplace] || 0.02; // 기본값 2%
   
   // 예: 쿠팡 5%, 네이버 3%, Amazon 2%
   ```

3. **캐시백 금액 계산**
   ```typescript
   const cashbackAmount = Math.round(purchaseAmount * rate);
   
   // 예: 100,000원 × 5% = 5,000원
   ```

4. **Wallet에 캐시백 적립**
   ```typescript
   await firestore.collection("wallet_ledger").add({
     userId: "user123",
     type: "cashback",
     amount: 5000,
     description: "coupang 구매 캐시백",
     relatedOrderId: "order789",
     createdAt: new Date().toISOString(),
     status: "completed"
   });
   ```

**응답 예시:**
```json
{
  "success": true,
  "cashbackAmount": 5000,
  "rate": 5
}
```

---

## 💰 캐시백 비율

### 한국 마켓플레이스
- **쿠팡**: 5% (최고)
- **티몬**: 4%
- **위메프**: 4%
- **네이버, 지마켓, 11번가, 옥션, 인터파크**: 3%

### 해외 마켓플레이스
- **Amazon 계열**: 2%
- **eBay 계열**: 1.5%
- **Walmart, Target, Best Buy, Costco**: 1%
- **Newegg**: 1.5%
- **라쿠텐**: 2%
- **AliExpress**: 3% (최고)
- **Zalando, ASOS**: 2%

**전체 캐시백 비율**: `services/api/src/routes/cashback.ts` 파일 참조

---

## 📈 수익 구조

### PriceBuddy의 수익 모델

```
마켓플레이스 제휴 수수료: 예) 10%
  ↓
사용자 캐시백: 예) 5%
  ↓
PriceBuddy 수익: 예) 5% (차액)
```

**예시:**
- 쿠팡 제휴 수수료: 10%
- 사용자 캐시백: 5%
- PriceBuddy 수익: 5%

**실제 계산:**
```
상품 가격: 100,000원
쿠팡 제휴 수수료: 10,000원 (10%)
사용자 캐시백: 5,000원 (5%)
PriceBuddy 수익: 5,000원 (5%)
```

---

## 🔧 기술적 구현

### 1. 제휴 링크 생성 (`affiliate-clients.ts`)

```typescript
export async function generateAffiliateLink(
  marketplace: string,
  originalUrl: string,
  userId: string
): Promise<string> {
  switch (marketplace) {
    case "coupang":
      return generateCoupangLink(originalUrl, userId);
    case "naver":
      return generateNaverLink(originalUrl, userId);
    case "amazon_us":
    case "amazon_jp":
      return generateAmazonLink(originalUrl, marketplace, userId);
    // ... 기타 마켓플레이스
  }
}
```

### 2. 캐시백 계산 (`cashback.ts`)

```typescript
// 마켓플레이스별 캐시백 비율
const rate = AFFILIATE_RATES[marketplace] || 0.02;

// 캐시백 금액 계산
const cashbackAmount = Math.round(purchaseAmount * rate);

// Wallet에 적립
await firestore.collection("wallet_ledger").add({
  userId,
  type: "cashback",
  amount: cashbackAmount,
  description: `${marketplace} 구매 캐시백`,
  relatedOrderId: orderId,
  status: "completed"
});
```

### 3. Wallet 시스템 (`wallet.ts`)

```typescript
// Wallet 잔액 조회
GET /wallet/balance?userId=user123

// Wallet 거래 내역 조회
GET /wallet/transactions?userId=user123
```

---

## 🎯 실제 사용 시나리오

### 시나리오 1: 쿠팡 구매

```
1. 사용자가 PriceBuddy에서 상품 검색
   → "아이폰 15 케이스" 검색

2. PriceBuddy가 제휴 링크 생성
   → https://www.coupang.com/...?partnerId=PRICEBUDDY&subId=user123

3. 사용자가 제휴 링크 클릭 및 구매
   → 구매 금액: 20,000원

4. PriceBuddy가 캐시백 지급
   → 캐시백: 20,000원 × 5% = 1,000원
   → Wallet에 1,000원 적립

5. 사용자가 Wallet에서 현금 인출 가능
```

### 시나리오 2: Amazon US 구매

```
1. 사용자가 PriceBuddy에서 상품 검색
   → "MacBook Pro" 검색

2. PriceBuddy가 제휴 링크 생성
   → https://amazon.com/...?tag=pricebuddy-20

3. 사용자가 제휴 링크 클릭 및 구매
   → 구매 금액: $1,999 (약 2,700,000원)

4. PriceBuddy가 캐시백 지급
   → 캐시백: 2,700,000원 × 2% = 54,000원
   → Wallet에 54,000원 적립
```

---

## ⚠️ 주의사항

### 1. 제휴 링크 필수
- **제휴 링크를 통해서만** 캐시백이 지급됩니다
- 직접 마켓플레이스 접속 시 캐시백 없음

### 2. 쿠키 유효기간
- 일반적으로 24-30일 유효
- 링크 클릭 후 즉시 구매하지 않아도 일정 기간 내 구매 시 캐시백 지급

### 3. 구매 추적
- 마켓플레이스에서 구매 확인 후 캐시백 지급
- 구매 취소/환불 시 캐시백 회수 가능

### 4. 최소 인출 금액
- Wallet에서 현금 인출 시 최소 금액 제한 있을 수 있음

---

## 🚀 개선 방향

### 1. 자동 구매 추적
- 현재: 수동으로 `track-purchase` API 호출 필요
- 개선: 마켓플레이스 Webhook 연동으로 자동 추적

### 2. 실시간 캐시백 표시
- 상품 상세 페이지에 예상 캐시백 금액 표시
- "이 상품 구매 시 5,000원 캐시백" 등

### 3. 캐시백 히스토리
- 사용자별 캐시백 누적 금액 표시
- 월별/연도별 캐시백 통계

### 4. 캐시백 알림
- 구매 완료 시 캐시백 적립 알림
- Wallet 잔액 변동 알림

---

## 📊 데이터 구조

### affiliate_links 컬렉션
```typescript
{
  userId: string;
  originalUrl: string;
  affiliateLink: string;
  marketplace: string;
  createdAt: string;
  clicks: number;
  conversions: number;
}
```

### wallet_ledger 컬렉션
```typescript
{
  userId: string;
  type: "cashback" | "referral_bonus" | "withdrawal" | "refund";
  amount: number;
  description: string;
  relatedOrderId?: string;
  createdAt: string;
  status: "completed" | "pending" | "failed";
}
```

---

## 💡 핵심 포인트

1. **제휴 프로그램 기반**: 마켓플레이스 제휴 수수료의 일부를 사용자에게 지급
2. **제휴 링크 필수**: 제휴 링크를 통해서만 캐시백 지급
3. **자동 적립**: 구매 확인 후 자동으로 Wallet에 적립
4. **현금 인출 가능**: Wallet 잔액을 현금으로 인출 가능

---

**캐시백 시스템은 사용자에게 추가 혜택을 제공하면서, PriceBuddy의 수익 모델을 구성하는 핵심 기능입니다!** 🎉

