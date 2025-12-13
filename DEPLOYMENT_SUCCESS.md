# Functions 배포 성공! 🎉

**프로젝트**: pricebuddy-5a869  
**배포 일시**: 2024-12-13

---

## ✅ 배포 완료된 Functions

### 1. api (메인 HTTP API)
- **트리거**: HTTPS
- **리전**: asia-northeast3
- **메모리**: 256MB
- **런타임**: nodejs20
- **URL**: https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api

**포함된 기능:**
- 검색 API
- 상품 상세 API
- 가격 추적 API
- 자동화 API (모니터링, 마케팅, 고객 지원, 제휴 관리)
- Wallet API
- 알림 API
- 캐시백 API
- 기타 모든 API 엔드포인트

---

### 2. autoUpdateScrapers (스크래퍼 자동 업데이트)
- **트리거**: Scheduled (매일)
- **리전**: asia-northeast3
- **메모리**: 256MB
- **런타임**: nodejs20

**기능:**
- 마켓플레이스 구조 변경 자동 감지
- 새 셀렉터 자동 찾기
- 자동 업데이트 제안

---

### 3. updateProductPrices (가격 업데이트 스케줄러)
- **트리거**: Scheduled (매 시간)
- **리전**: asia-northeast3
- **메모리**: 256MB
- **런타임**: nodejs20

**기능:**
- 활성 상품 가격 자동 업데이트
- 가격 히스토리 저장
- 가격 변동 감지

---

## 🔗 API 엔드포인트

### 기본 URL
```
https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api
```

### 주요 엔드포인트

#### 검색
```
GET /api/search?q=아이폰
```

#### 상품 상세
```
GET /api/products/:productId
```

#### 자동화 API
```
GET /api/monitoring/scraper-health
POST /api/auto-marketing/generate-content
POST /api/auto-support/chat
POST /api/auto-affiliate/check-keys
```

---

## 🧪 API 테스트

### Health Check
```bash
curl https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api/health
```

### 자동화 API 테스트
```bash
API_BASE_URL=https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api \
  ./scripts/test-automation.sh
```

---

## 📊 Firebase Console

- **Functions**: https://console.firebase.google.com/project/pricebuddy-5a869/functions
- **Firestore**: https://console.firebase.google.com/project/pricebuddy-5a869/firestore
- **프로젝트 개요**: https://console.firebase.google.com/project/pricebuddy-5a869/overview

---

## ⚠️ 참고사항

### package-lock.json 이슈
- 현재 pnpm workspace를 사용하므로 `package-lock.json`이 없음
- Functions는 이미 배포되어 작동 중
- 향후 업데이트 시 `package-lock.json` 생성 필요

### 해결 방법 (향후)
1. `package.json`에서 workspace 의존성 제거
2. `npm install` 실행하여 `package-lock.json` 생성
3. Functions 재배포

---

## 🎯 다음 단계

1. **API 테스트**
   - Health check
   - 자동화 API 테스트
   - 주요 엔드포인트 테스트

2. **환경 변수 설정** (필요시)
   ```bash
   firebase functions:config:set \
     web_app.url="https://pricebuddy-5a869.web.app"
   ```

3. **Cloud Run 서비스 배포**
   - Scraper 서비스
   - Review 서비스
   - Forecast 서비스

4. **Web App 배포**
   - Vercel 또는 Firebase Hosting

---

**Functions 배포 완료! 이제 API를 테스트할 수 있습니다.** 🚀

