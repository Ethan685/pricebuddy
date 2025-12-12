# 배포 가이드

## 1. Firebase Functions (API 서비스)

```bash
cd services/api

# Firebase 프로젝트 설정
firebase use your-project-id

# 함수 배포
firebase deploy --only functions
```

## 2. Cloud Run 서비스

### Review 서비스

```bash
cd services/review

# Docker 이미지 빌드
docker build -t gcr.io/$PROJECT_ID/pricebuddy-review:latest .

# Cloud Run 배포
gcloud run deploy pricebuddy-review \
  --image gcr.io/$PROJECT_ID/pricebuddy-review:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

### Forecast 서비스

```bash
cd services/forecast

docker build -t gcr.io/$PROJECT_ID/pricebuddy-forecast:latest .
gcloud run deploy pricebuddy-forecast \
  --image gcr.io/$PROJECT_ID/pricebuddy-forecast:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1
```

### Scraper 서비스

```bash
cd services/scraper

# 빌드 및 배포
docker build -t gcr.io/$PROJECT_ID/pricebuddy-scraper:latest .
gcloud run deploy pricebuddy-scraper \
  --image gcr.io/$PROJECT_ID/pricebuddy-scraper:latest \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2
```

## 3. Web App 배포

### Vercel/Netlify

```bash
cd apps/web_app

# 빌드
pnpm build

# 배포 (Vercel 예시)
vercel deploy --prod
```

### Firebase Hosting

```bash
cd apps/web_app
pnpm build

# firebase.json에 hosting 설정 추가 후
firebase deploy --only hosting
```

## 4. 환경 변수 설정

### Firebase Functions

```bash
firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app"
```

### Web App (Vercel 예시)

Vercel 대시보드에서 환경 변수 설정:
- `VITE_API_BASE_URL`: Firebase Functions URL

## 5. Firestore 인덱스 생성

```bash
cd services/api
firebase deploy --only firestore:indexes
```

