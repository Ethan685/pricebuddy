# Firebase 프로젝트 설정 가이드

**프로젝트 ID**: `pricebuddy-5a869`  
**프로젝트 URL**: https://console.firebase.google.com/project/pricebuddy-5a869/overview

---

## ✅ 프로젝트 정보

- **프로젝트 ID**: `pricebuddy-5a869`
- **프로젝트 이름**: PriceBuddy
- **Firebase Console**: https://console.firebase.google.com/project/pricebuddy-5a869/overview

---

## 🔧 프로젝트 설정

### 1. Firebase 프로젝트 선택

```bash
cd services/api
firebase use pricebuddy-5a869
```

### 2. 환경 변수 설정

`.env` 파일에 다음 설정 추가:

```env
FIREBASE_PROJECT_ID=pricebuddy-5a869
WEB_APP_URL=https://pricebuddy-5a869.web.app
VITE_API_BASE_URL=https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api
```

### 3. Firebase Functions 환경 변수 설정

```bash
cd services/api

# 기본 설정
firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app" \
  sendgrid.api_key="SG.xxx" \
  sendgrid.from_email="noreply@pricebuddy.com" \
  fcm.server_key="xxx" \
  web_app.url="https://pricebuddy-5a869.web.app"

# 자동화 기능 설정
firebase functions:config:set \
  monitoring.enabled=true \
  auto_marketing.enabled=true \
  auto_support.enabled=true \
  auto_affiliate.enabled=true \
  monitoring.alert_email="admin@pricebuddy.com"
```

---

## 🚀 배포 준비

### 1. Firestore 데이터베이스 확인

Firebase Console에서 확인:
- https://console.firebase.google.com/project/pricebuddy-5a869/firestore

**필수 작업:**
- [ ] Firestore 데이터베이스 생성 (Production 모드)
- [ ] 보안 규칙 배포
- [ ] 인덱스 배포

### 2. Authentication 설정

Firebase Console에서 확인:
- https://console.firebase.google.com/project/pricebuddy-5a869/authentication

**필수 작업:**
- [ ] 이메일/비밀번호 인증 활성화
- [ ] Google 소셜 로그인 활성화
- [ ] 기타 소셜 로그인 (선택)

### 3. Functions 배포

```bash
cd services/api
firebase deploy --only functions
```

배포되는 함수:
- `api`: 메인 HTTP API
- `updateProductPrices`: 가격 업데이트 스케줄러
- `autoUpdateScrapers`: 스크래퍼 자동 업데이트 스케줄러

---

## 📊 프로젝트 상태 확인

### Functions 상태
```bash
firebase functions:list
```

### Firestore 인덱스 상태
Firebase Console에서 확인:
- https://console.firebase.google.com/project/pricebuddy-5a869/firestore/indexes

### 사용량 확인
Firebase Console에서 확인:
- https://console.firebase.google.com/project/pricebuddy-5a869/usage

---

## 🧪 로컬 테스트

### Emulators 시작
```bash
firebase emulators:start --project pricebuddy-5a869
```

### API 테스트
```bash
# 로컬 Emulators
API_BASE_URL=http://localhost:5001/pricebuddy-5a869/api \
  ./scripts/test-automation.sh

# 프로덕션
API_BASE_URL=https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api \
  ./scripts/test-automation.sh
```

---

## 🔗 유용한 링크

- **프로젝트 개요**: https://console.firebase.google.com/project/pricebuddy-5a869/overview
- **Firestore**: https://console.firebase.google.com/project/pricebuddy-5a869/firestore
- **Authentication**: https://console.firebase.google.com/project/pricebuddy-5a869/authentication
- **Functions**: https://console.firebase.google.com/project/pricebuddy-5a869/functions
- **Hosting**: https://console.firebase.google.com/project/pricebuddy-5a869/hosting
- **Storage**: https://console.firebase.google.com/project/pricebuddy-5a869/storage

---

## 📝 다음 단계

1. **Firestore 데이터베이스 생성** (아직 안 했다면)
2. **보안 규칙 및 인덱스 배포**
3. **환경 변수 설정**
4. **Functions 배포**
5. **자동화 API 테스트**

---

**프로젝트 ID `pricebuddy-5a869`로 설정을 진행하세요!** 🚀

