# PriceBuddy 배포 체크리스트

**작성일**: 2024-12-12  
**목적**: 배포 전 필수 작업 확인 및 단계별 가이드

---

## 📋 배포 전 필수 체크리스트

### Phase 1: 인프라 설정

#### 1.1 Firebase 프로젝트 설정
- [ ] Firebase 프로젝트 생성
- [ ] Firestore 데이터베이스 생성 (Production 모드)
- [ ] Authentication 활성화
  - [ ] 이메일/비밀번호
  - [ ] Google 소셜 로그인
  - [ ] 기타 소셜 로그인 (선택)
- [ ] Firebase Storage 활성화 (선택)
- [ ] Firebase Hosting 설정 (선택)

**체크 명령어:**
```bash
firebase projects:list
firebase use your-project-id
```

---

#### 1.2 Google Cloud Platform 설정
- [ ] GCP 프로젝트 생성 (Firebase와 동일)
- [ ] Cloud Run API 활성화
- [ ] Container Registry API 활성화
- [ ] Cloud Build API 활성화
- [ ] 결제 계정 연결 (Blaze 플랜 필요)

**체크 명령어:**
```bash
gcloud projects list
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

---

### Phase 2: 환경 변수 설정

#### 2.1 로컬 환경 변수
- [ ] `.env` 파일 생성 (`.env.example` 참고)
- [ ] 필수 환경 변수 설정
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `WEB_APP_URL`
  - [ ] `VITE_API_BASE_URL`
- [ ] 자동화 기능 환경 변수 설정
  - [ ] `AUTO_MONITORING_ENABLED`
  - [ ] `AUTO_MARKETING_ENABLED`
  - [ ] `AUTO_SUPPORT_ENABLED`
  - [ ] `AUTO_AFFILIATE_ENABLED`

**체크 명령어:**
```bash
./scripts/validate-env.sh
```

---

#### 2.2 Firebase Functions 환경 변수
- [ ] Scraper 서비스 URL 설정
- [ ] Review 서비스 URL 설정
- [ ] Forecast 서비스 URL 설정
- [ ] SendGrid API 키 설정
- [ ] FCM 서버 키 설정
- [ ] 자동화 기능 설정

**설정 명령어:**
```bash
cd services/api
firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app" \
  sendgrid.api_key="SG.xxx" \
  sendgrid.from_email="noreply@your-domain.com" \
  fcm.server_key="xxx" \
  web_app.url="https://your-domain.com" \
  monitoring.enabled=true \
  auto_marketing.enabled=true \
  auto_support.enabled=true \
  auto_affiliate.enabled=true
```

---

#### 2.3 제휴 링크 API 키 설정
- [ ] 쿠팡 파트너스 API 키
- [ ] 네이버 쇼핑 API 키
- [ ] Amazon Associate 태그
- [ ] Rakuten 어필리에이트 API 키
- [ ] eBay 파트너 네트워크 키

**설정 위치:**
- Firebase Functions 환경 변수 또는
- `.env` 파일

---

### Phase 3: 서비스 배포

#### 3.1 Cloud Run 서비스 배포

**Scraper 서비스:**
- [ ] Docker 이미지 빌드
- [ ] Cloud Run 배포
- [ ] URL 확인 및 환경 변수 업데이트

**배포 명령어:**
```bash
./scripts/deploy.sh scraper
```

**Review 서비스:**
- [ ] Docker 이미지 빌드
- [ ] Cloud Run 배포
- [ ] URL 확인 및 환경 변수 업데이트

**배포 명령어:**
```bash
./scripts/deploy.sh review
```

**Forecast 서비스:**
- [ ] Docker 이미지 빌드
- [ ] Cloud Run 배포
- [ ] URL 확인 및 환경 변수 업데이트

**배포 명령어:**
```bash
./scripts/deploy.sh forecast
```

---

#### 3.2 Firebase Functions 배포
- [ ] API Functions 빌드
- [ ] Functions 배포
- [ ] 스케줄러 함수 확인
  - [ ] `updateProductPrices`
  - [ ] `autoUpdateScrapers`
  - [ ] `checkPriceAlerts`

**배포 명령어:**
```bash
cd services/api
./scripts/deploy.sh api
```

**스케줄러 확인:**
```bash
firebase functions:list
```

---

#### 3.3 Firestore 보안 규칙 및 인덱스
- [ ] 보안 규칙 배포
- [ ] 인덱스 배포
- [ ] 인덱스 생성 완료 대기

**배포 명령어:**
```bash
cd services/api
firebase deploy --only firestore:rules,firestore:indexes
```

**인덱스 확인:**
- Firebase Console > Firestore > Indexes
- 모든 인덱스가 "Enabled" 상태인지 확인

---

#### 3.4 Web App 배포
- [ ] 빌드 성공 확인
- [ ] 환경 변수 설정 확인
- [ ] 배포 (Vercel 또는 Firebase Hosting)

**Vercel 배포:**
```bash
cd apps/web_app
pnpm build
vercel deploy --prod
```

**Firebase Hosting 배포:**
```bash
cd apps/web_app
pnpm build
firebase deploy --only hosting
```

---

### Phase 4: 배포 후 검증

#### 4.1 API 엔드포인트 테스트
- [ ] Health check 엔드포인트
- [ ] Search API
- [ ] Product Detail API
- [ ] 자동화 API 엔드포인트
  - [ ] `/monitoring/scraper-health`
  - [ ] `/auto-marketing/generate-content`
  - [ ] `/auto-support/chat`
  - [ ] `/auto-affiliate/check-keys`

**테스트 명령어:**
```bash
# Health check
curl https://your-region-your-project.cloudfunctions.net/api/health

# 자동화 API 테스트
curl -X GET https://your-region-your-project.cloudfunctions.net/api/monitoring/scraper-health
```

---

#### 4.2 스케줄러 동작 확인
- [ ] `updateProductPrices` 스케줄러 실행 확인
- [ ] `autoUpdateScrapers` 스케줄러 실행 확인
- [ ] 로그 확인

**확인 명령어:**
```bash
# Functions 로그 확인
firebase functions:log

# 특정 함수 로그
firebase functions:log --only updateProductPrices
```

---

#### 4.3 인증 시스템 테스트
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 소셜 로그인 테스트
- [ ] 로그아웃 테스트

---

#### 4.4 주요 기능 테스트
- [ ] 검색 기능
- [ ] 상품 상세 페이지
- [ ] 가격 추적
- [ ] 가격 알림 설정
- [ ] Wallet 기능
- [ ] 제휴 링크 생성
- [ ] 캐시백 적립 (테스트)

---

### Phase 5: 모니터링 설정

#### 5.1 Firebase Console 모니터링
- [ ] Functions 사용량 확인
- [ ] Firestore 사용량 확인
- [ ] Authentication 사용량 확인
- [ ] 에러 로그 확인

---

#### 5.2 자동 모니터링 시스템 확인
- [ ] 스크래퍼 오류 감지 동작 확인
- [ ] 자동 재시도 동작 확인
- [ ] 알림 발송 확인 (설정된 경우)

**확인 방법:**
```bash
# 모니터링 상태 확인
curl https://your-region-your-project.cloudfunctions.net/api/monitoring/scraper-health
```

---

#### 5.3 외부 모니터링 (선택)
- [ ] Google Analytics 설정
- [ ] Sentry 에러 추적 설정
- [ ] Uptime 모니터링 설정

---

### Phase 6: 보안 및 최적화

#### 6.1 보안 확인
- [ ] Firestore 보안 규칙 검토
- [ ] API 엔드포인트 인증 확인
- [ ] 환경 변수 보안 확인
- [ ] CORS 설정 확인

---

#### 6.2 성능 최적화
- [ ] Functions 타임아웃 설정 확인
- [ ] Cloud Run 리소스 설정 확인
- [ ] Firestore 인덱스 최적화
- [ ] 이미지 최적화 (CDN 사용)

---

#### 6.3 비용 최적화
- [ ] Firebase Blaze 플랜 설정 확인
- [ ] Cloud Run 최소 인스턴스 설정
- [ ] Functions 콜드 스타트 최적화
- [ ] Firestore 읽기/쓰기 최적화

---

## 🚨 배포 중 문제 해결

### 일반적인 문제

#### 1. Functions 배포 실패
**원인:**
- 환경 변수 누락
- 타입 오류
- 의존성 문제

**해결:**
```bash
# 빌드 확인
cd services/api
npm run build

# 환경 변수 확인
firebase functions:config:get

# 재배포
firebase deploy --only functions
```

---

#### 2. Cloud Run 배포 실패
**원인:**
- Docker 이미지 빌드 실패
- 리소스 부족
- 권한 문제

**해결:**
```bash
# 로컬에서 Docker 이미지 테스트
docker build -t test-image .
docker run test-image

# Cloud Run 재배포
./scripts/deploy.sh scraper
```

---

#### 3. 인덱스 생성 실패
**원인:**
- 인덱스 정의 오류
- 중복 인덱스

**해결:**
```bash
# 인덱스 확인
firebase firestore:indexes

# 인덱스 재배포
firebase deploy --only firestore:indexes
```

---

## 📊 배포 후 모니터링 체크리스트

### 첫 24시간
- [ ] Functions 실행 횟수 확인
- [ ] 에러 로그 확인
- [ ] 사용자 활동 확인
- [ ] 성능 메트릭 확인

### 첫 주
- [ ] 비용 확인
- [ ] 사용자 피드백 수집
- [ ] 성능 최적화
- [ ] 버그 수정

---

## 📚 참고 문서

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [ENV_TEMPLATE.md](./docs/ENV_TEMPLATE.md) - 환경 변수 템플릿
- [AUTOMATION_FEATURES.md](./AUTOMATION_FEATURES.md) - 자동화 기능 설명
- [NEXT_DEVELOPMENT_STEPS.md](./NEXT_DEVELOPMENT_STEPS.md) - 다음 개발 스텝

---

**배포 전 반드시 이 체크리스트를 확인하세요!** ✅

