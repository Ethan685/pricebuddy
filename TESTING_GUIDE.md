# PriceBuddy API 테스트 가이드

## 🚀 배포된 Functions 테스트

### 현재 상태
- Functions가 배포되어 있지만 404 오류 발생
- 루트 경로 핸들러 추가 필요
- 재배포 후 테스트 가능

---

## 🧪 로컬 에뮬레이터로 테스트 (권장)

### 1. 에뮬레이터 시작

```bash
cd services/api
firebase emulators:start --only functions
```

### 2. API 테스트

```bash
# 환경 변수 설정
export API_BASE_URL="http://localhost:5001/pricebuddy-5a869/api"

# 테스트 스크립트 실행
./scripts/test-automation.sh
```

### 3. 개별 엔드포인트 테스트

```bash
# Health Check
curl http://localhost:5001/pricebuddy-5a869/api/health

# 검색 API
curl "http://localhost:5001/pricebuddy-5a869/api/search?q=아이폰"

# 모니터링 API
curl http://localhost:5001/pricebuddy-5a869/api/monitoring/health-check

# 자동 마케팅 API
curl -X POST http://localhost:5001/pricebuddy-5a869/api/auto-marketing/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "blog",
    "topic": "가격 비교 앱 사용법"
  }'

# 자동 고객 지원 API
curl -X POST http://localhost:5001/pricebuddy-5a869/api/auto-support/handle-query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "캐시백은 어떻게 받나요?",
    "userId": "test-user-123"
  }'
```

---

## 🌐 프로덕션 Functions 테스트

### Functions 재배포 필요

1. **루트 경로 핸들러 추가 완료**
   - `services/api/src/index.ts`에 루트 핸들러 추가됨

2. **재배포**
   ```bash
   cd services/api
   firebase deploy --only functions
   ```

3. **테스트**
   ```bash
   API_BASE_URL="https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api" \
     ./scripts/test-deployed-api.sh
   ```

---

## 📋 테스트 체크리스트

### 기본 API
- [ ] Health Check (`/health`)
- [ ] 검색 API (`/search?q=...`)
- [ ] 상품 상세 API (`/products/:id`)

### 자동화 API
- [ ] 모니터링 - Health Check (`/monitoring/health-check`)
- [ ] 모니터링 - 에러 통계 (`/monitoring/error-stats`)
- [ ] 자동 마케팅 - 콘텐츠 생성 (`/auto-marketing/generate-content`)
- [ ] 자동 고객 지원 - 쿼리 처리 (`/auto-support/handle-query`)
- [ ] 자동 제휴 - API 키 검증 (`/auto-affiliate/validate-keys`)

### 스케줄러 Functions
- [ ] `updateProductPrices` (매 시간 실행)
- [ ] `autoUpdateScrapers` (매일 실행)

---

## 🔍 문제 해결

### 404 오류
- **원인**: Functions가 제대로 배포되지 않았거나 라우팅 문제
- **해결**: 
  1. Functions 재배포
  2. 로컬 에뮬레이터로 먼저 테스트
  3. Firebase Console에서 Functions 로그 확인

### CORS 오류
- **원인**: 브라우저에서 직접 호출 시 CORS 문제
- **해결**: 
  - CORS 미들웨어 추가 (필요시)
  - 서버 사이드에서 테스트

### 인증 오류
- **원인**: Firestore 보안 규칙
- **해결**: 
  - 테스트용 사용자 인증 토큰 사용
  - Firestore 보안 규칙 임시 완화 (테스트용)

---

## 📊 Functions 로그 확인

```bash
# Firebase Console에서 확인
# https://console.firebase.google.com/project/pricebuddy-5a869/functions/logs

# 또는 CLI로 확인
cd services/api
firebase functions:log
```

---

## 🎯 다음 단계

1. **로컬 에뮬레이터로 테스트** (권장)
   - 빠른 피드백
   - 디버깅 용이

2. **Functions 재배포**
   - 루트 핸들러 포함
   - 프로덕션 환경 테스트

3. **통합 테스트**
   - 전체 플로우 테스트
   - 실제 데이터 사용

---

**테스트를 시작하려면 로컬 에뮬레이터를 사용하는 것을 권장합니다!** 🚀

