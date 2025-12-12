# Firebase 프로젝트 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `pricebuddy` (또는 원하는 이름)
4. Google Analytics 활성화 (선택)

## 2. Authentication 설정

1. 좌측 메뉴에서 "Authentication" 선택
2. "시작하기" 클릭
3. 제공업체 활성화:
   - 이메일/비밀번호 ✅
   - Google ✅
   - 필요시 Naver, Kakao 추가

## 3. Firestore 데이터베이스 생성

1. 좌측 메뉴에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. 프로덕션 모드 선택
4. 위치: `asia-northeast3` (서울)

### 컬렉션 구조

```
users/
  {userId}/
    - id, email, displayName, referralCode, referredBy, ...

products/
  {productId}/
    - id, title, brand, imageUrl, categoryPath, attributes, ...

offers/
  {offerId}/
    - id, productId, marketplace, externalId, url, basePrice, ...

price_history/
  {productId}/
    {timestamp}/
      - price, marketplace, createdAt, ...

wallet_ledger/
  {entryId}/
    - userId, type, amount, description, createdAt, status, ...

price_alerts/
  {alertId}/
    - userId, productId, targetPrice, currentPrice, isActive, ...

purchases/
  {purchaseId}/
    - userId, productId, purchasePrice, expectedPrice, ...

affiliate_links/
  {linkId}/
    - userId, originalUrl, affiliateLink, marketplace, clicks, ...

deals/
  {dealId}/
    - productId, marketplace, title, originalPrice, dealPrice, ...
```

## 4. Firestore 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: 본인만 읽기/쓰기
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products: 모든 인증된 사용자 읽기
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if false; // 관리자만 쓰기
    }
    
    // Wallet Ledger: 본인만 읽기
    match /wallet_ledger/{entryId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow write: if false; // 서버만 쓰기
    }
    
    // Price Alerts: 본인만 읽기/쓰기
    match /price_alerts/{alertId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Purchases: 본인만 읽기
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow write: if false; // 서버만 쓰기
    }
  }
}
```

## 5. Firebase Functions 설정

1. Firebase CLI 설치:
```bash
npm install -g firebase-tools
firebase login
```

2. 프로젝트 초기화:
```bash
cd services/api
firebase init functions
```

3. Functions 배포:
```bash
firebase deploy --only functions
```

## 6. 환경 변수 설정

`.env.local` 파일 생성:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=https://your-region-your-project.cloudfunctions.net/api
```

## 7. Firebase Admin SDK 설정

`services/api/.env` 파일 생성:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

