# PriceBuddy 배포 가이드

이 가이드는 PriceBuddy를 프로덕션 환경에 배포하는 전체 과정을 안내합니다.

## 📋 사전 준비사항

### 필수 도구
- Node.js 18+ 및 pnpm
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK (`gcloud`)
- Docker (Cloud Run 배포용)

### 필수 계정
- Firebase 프로젝트
- Google Cloud Platform 계정
- 제휴 링크 API 키 (쿠팡, 네이버 등)
- 결제 시스템 계정 (PortOne 또는 Toss Payments)
- 이메일 발송 서비스 (SendGrid 또는 AWS SES)

---

## 🚀 빠른 시작

### 1단계: Firebase 프로젝트 설정

```bash
# 자동 설정 스크립트 실행
./scripts/setup-firebase.sh
```

또는 수동으로:

```bash
# Firebase 로그인
firebase login

# 프로젝트 선택
cd services/api
firebase use your-project-id

# Firestore 데이터베이스 생성 (Firebase Console에서)
# https://console.firebase.google.com/project/your-project-id/firestore

# 보안 규칙 및 인덱스 배포
firebase deploy --only firestore:rules,firestore:indexes
```

### 2단계: 환경 변수 설정

```bash
# 루트 디렉터리에서
cp .env.example .env

# .env 파일 편집하여 실제 값 입력
```

### 3단계: Cloud Run 서비스 배포

```bash
# Scraper 서비스
./scripts/deploy.sh scraper

# Review 서비스
./scripts/deploy.sh review

# Forecast 서비스
./scripts/deploy.sh forecast
```

배포 후 각 서비스의 URL을 확인하고 `.env` 파일에 업데이트하세요.

### 4단계: Firebase Functions 환경 변수 설정

```bash
cd services/api

# 환경 변수 설정
firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app" \
  sendgrid.api_key="SG.xxx" \
  sendgrid.from_email="noreply@your-domain.com" \
  fcm.server_key="xxx" \
  web_app.url="https://your-domain.com"
```

### 5단계: Firebase Functions 배포

```bash
./scripts/deploy.sh api
```

### 6단계: Web App 배포

#### Vercel 배포
```bash
cd apps/web_app
pnpm build
vercel deploy --prod
```

#### Firebase Hosting 배포
```bash
cd apps/web_app
pnpm build

# firebase.json에 hosting 설정 추가 후
firebase deploy --only hosting
```

---

## 📝 상세 가이드

### Firebase Functions 배포

```bash
cd services/api

# 빌드
npm run build

# 배포
firebase deploy --only functions --project your-project-id
```

배포되는 함수:
- `api`: 메인 HTTP API
- `updateProductPrices`: 가격 업데이트 스케줄러 (매 시간)
- `checkPriceAlerts`: 가격 알림 체크 스케줄러 (매 시간)

### Cloud Run 서비스 배포

각 서비스는 독립적으로 배포됩니다.

#### Scraper 서비스

```bash
cd services/scraper

# Docker 이미지 빌드
docker build -t gcr.io/$PROJECT_ID/pricebuddy-scraper:latest .

# 이미지 푸시
docker push gcr.io/$PROJECT_ID/pricebuddy-scraper:latest

# Cloud Run 배포
gcloud run deploy pricebuddy-scraper \
  --image gcr.io/$PROJECT_ID/pricebuddy-scraper:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

#### Review 서비스

```bash
cd services/review

docker build -t gcr.io/$PROJECT_ID/pricebuddy-review:latest .
docker push gcr.io/$PROJECT_ID/pricebuddy-review:latest

gcloud run deploy pricebuddy-review \
  --image gcr.io/$PROJECT_ID/pricebuddy-review:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

#### Forecast 서비스

```bash
cd services/forecast

docker build -t gcr.io/$PROJECT_ID/pricebuddy-forecast:latest .
docker push gcr.io/$PROJECT_ID/pricebuddy-forecast:latest

gcloud run deploy pricebuddy-forecast \
  --image gcr.io/$PROJECT_ID/pricebuddy-forecast:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1
```

### Firestore 설정

#### 보안 규칙

`services/api/firestore.rules` 파일이 자동으로 배포됩니다.

#### 인덱스

`services/api/firestore.indexes.json` 파일에 정의된 인덱스가 자동으로 생성됩니다.

필요한 인덱스:
- `offers`: `productId`, `totalPriceKrw`
- `price_alerts`: `isActive`, `notificationEnabled`
- `price_history`: `productId`, `timestamp`

### 환경 변수 관리

#### Firebase Functions

```bash
# 설정
firebase functions:config:set key="value"

# 조회
firebase functions:config:get

# 삭제
firebase functions:config:unset key
```

#### Cloud Run

```bash
gcloud run services update SERVICE_NAME \
  --update-env-vars KEY1=VALUE1,KEY2=VALUE2 \
  --region asia-northeast3
```

---

## 🔧 설정 확인

### Firebase Functions 상태 확인

```bash
firebase functions:list
```

### Cloud Run 서비스 상태 확인

```bash
gcloud run services list --region asia-northeast3
```

### 로그 확인

```bash
# Firebase Functions 로그
firebase functions:log

# Cloud Run 로그
gcloud run services logs read SERVICE_NAME --region asia-northeast3
```

---

## 🧪 배포 후 테스트

### 1. API 엔드포인트 테스트

```bash
# Health check
curl https://asia-northeast3-your-project-id.cloudfunctions.net/api/health

# Search 테스트
curl "https://asia-northeast3-your-project-id.cloudfunctions.net/api/search?q=iphone"
```

### 2. 스케줄러 테스트

Firebase Console에서 수동으로 트리거 실행:
1. Functions > `updateProductPrices` 선택
2. "테스트" 탭에서 실행

### 3. 알림 시스템 테스트

1. 상품에 가격 알림 설정
2. 가격 변경 시뮬레이션
3. 이메일/푸시 알림 확인

---

## 🚨 문제 해결

### Firebase Functions 배포 실패

```bash
# 로그 확인
firebase functions:log --only api

# 로컬 테스트
firebase emulators:start --only functions
```

### Cloud Run 배포 실패

```bash
# 로그 확인
gcloud run services logs read SERVICE_NAME --region asia-northeast3

# 로컬 테스트
docker run -p 8080:8080 gcr.io/$PROJECT_ID/pricebuddy-scraper:latest
```

### 환경 변수 문제

```bash
# Firebase Functions 환경 변수 확인
firebase functions:config:get

# Cloud Run 환경 변수 확인
gcloud run services describe SERVICE_NAME --region asia-northeast3
```

---

## 📊 모니터링

### Firebase Console
- Functions 실행 통계
- Firestore 사용량
- Authentication 통계

### Google Cloud Console
- Cloud Run 메트릭
- 로그 분석
- 비용 모니터링

### 권장 모니터링 도구
- Google Analytics (사용자 행동)
- Sentry (에러 추적)
- Firebase Performance Monitoring

---

## 🔄 업데이트 배포

### 코드 변경 후 재배포

```bash
# 특정 서비스만 재배포
./scripts/deploy.sh api

# 전체 재배포
./scripts/deploy.sh all
```

### 롤백

```bash
# Firebase Functions
firebase functions:rollback

# Cloud Run
gcloud run services update SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/pricebuddy-scraper:PREVIOUS_TAG \
  --region asia-northeast3
```

---

## ✅ 배포 체크리스트

- [ ] Firebase 프로젝트 생성 및 설정
- [ ] Firestore 데이터베이스 생성
- [ ] Firestore 보안 규칙 배포
- [ ] Firestore 인덱스 배포
- [ ] Authentication 활성화
- [ ] 환경 변수 설정 (.env)
- [ ] Firebase Functions 환경 변수 설정
- [ ] Cloud Run 서비스 배포 (Scraper, Review, Forecast)
- [ ] Firebase Functions 배포
- [ ] Web App 배포
- [ ] 도메인 연결
- [ ] SSL 인증서 설정
- [ ] 제휴 링크 API 키 설정
- [ ] 결제 시스템 연동 테스트
- [ ] 이메일 발송 테스트
- [ ] 푸시 알림 테스트
- [ ] 스케줄러 동작 확인
- [ ] 모니터링 설정

---

## 📚 추가 리소스

- [Firebase 문서](https://firebase.google.com/docs)
- [Cloud Run 문서](https://cloud.google.com/run/docs)
- [Firestore 보안 규칙](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Functions 가이드](https://firebase.google.com/docs/functions)

---

**문제가 발생하면 이슈를 등록하거나 문서를 참고하세요.**

