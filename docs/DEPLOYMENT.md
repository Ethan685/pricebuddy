# PriceBuddy 배포 가이드

## 1. 환경 변수 설정

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=https://your-region-your-project.cloudfunctions.net/api
```

### Backend API (.env)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# 제휴 링크 API 키
COUPANG_PARTNER_API_KEY=your-coupang-key
COUPANG_PARTNER_API_SECRET=your-coupang-secret
NAVER_SHOPPING_API_KEY=your-naver-key
NAVER_SHOPPING_API_SECRET=your-naver-secret
AMAZON_ASSOCIATE_TAG=your-amazon-tag
AMAZON_JP_ASSOCIATE_TAG=your-amazon-jp-tag
RAKUTEN_AFFILIATE_API_KEY=your-rakuten-key
RAKUTEN_SITE_ID=your-rakuten-site-id
EBAY_PARTNER_NETWORK_KEY=your-ebay-key

# 결제 시스템
PAYMENT_PROVIDER=portone
PAYMENT_API_KEY=your-payment-key
PAYMENT_SECRET_KEY=your-payment-secret

# 이메일 발송
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@pricebuddy.com
EMAIL_FROM_NAME=PriceBuddy

# 웹 앱 URL
WEB_APP_URL=https://pricebuddy.com
```

## 2. Firebase Functions 배포

```bash
cd services/api
firebase deploy --only functions
```

## 3. Cloud Run 서비스 배포

### Review Engine
```bash
cd services/review
gcloud run deploy review-engine \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

### Forecast Engine
```bash
cd services/forecast
gcloud run deploy forecast-engine \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

### Scraper Service
```bash
cd services/scraper
gcloud run deploy scraper-service \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

## 4. Frontend 배포

### Vercel 배포
```bash
cd apps/web_app
vercel --prod
```

### Firebase Hosting 배포
```bash
cd apps/web_app
npm run build
firebase deploy --only hosting
```

## 5. 알림 스케줄러 활성화

Firebase Console에서:
1. Functions > checkPriceAlerts 선택
2. "트리거" 탭에서 Pub/Sub 스케줄 확인
3. 필요시 수동으로 트리거 실행 테스트

## 6. 모니터링 설정

### Google Analytics
1. Google Analytics 계정 생성
2. 추적 ID를 `.env`에 추가
3. `apps/web_app/src/shared/lib/analytics.ts` 구현

### Sentry
1. Sentry 프로젝트 생성
2. DSN을 `.env`에 추가
3. `apps/web_app/src/shared/lib/sentry.ts` 구현

## 7. 체크리스트

- [ ] Firebase 프로젝트 생성 및 설정
- [ ] Firestore 데이터베이스 생성
- [ ] Firestore 보안 규칙 설정
- [ ] Authentication 활성화
- [ ] 환경 변수 설정
- [ ] Firebase Functions 배포
- [ ] Cloud Run 서비스 배포
- [ ] Frontend 배포
- [ ] 도메인 연결
- [ ] SSL 인증서 설정
- [ ] 제휴 링크 API 키 설정
- [ ] 결제 시스템 연동 테스트
- [ ] 이메일 발송 테스트
- [ ] 푸시 알림 테스트
- [ ] 모니터링 설정

