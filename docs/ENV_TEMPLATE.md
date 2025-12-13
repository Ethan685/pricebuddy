# 환경 변수 템플릿

## Frontend (.env)

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# API
VITE_API_BASE_URL=
```

## Backend API (.env)

```env
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# 제휴 링크
COUPANG_PARTNER_API_KEY=
COUPANG_PARTNER_API_SECRET=
NAVER_SHOPPING_API_KEY=
NAVER_SHOPPING_API_SECRET=
AMAZON_ASSOCIATE_TAG=
AMAZON_JP_ASSOCIATE_TAG=
RAKUTEN_AFFILIATE_API_KEY=
RAKUTEN_SITE_ID=
EBAY_PARTNER_NETWORK_KEY=

# 결제
PAYMENT_PROVIDER=portone
PAYMENT_API_KEY=
PAYMENT_SECRET_KEY=

# 이메일
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=
EMAIL_FROM=
EMAIL_FROM_NAME=

# 기타
WEB_APP_URL=
AWS_REGION=ap-northeast-2

# 자동화 기능 설정
AUTO_MONITORING_ENABLED=true
AUTO_MARKETING_ENABLED=true
AUTO_SUPPORT_ENABLED=true
AUTO_AFFILIATE_ENABLED=true

# 모니터링 알림
MONITORING_ALERT_EMAIL=
MONITORING_WEBHOOK_URL=

# 자동 마케팅
MARKETING_SNS_ENABLED=true
MARKETING_BLOG_ENABLED=true
MARKETING_SEO_ENABLED=true

# 자동 고객 지원
SUPPORT_CHATBOT_ENABLED=true
SUPPORT_AUTO_RESOLVE_ENABLED=true
```

## Firebase Functions 환경 변수

Firebase Functions는 `firebase functions:config:set` 명령어로 설정합니다:

```bash
# 기본 설정
firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app" \
  sendgrid.api_key="SG.xxx" \
  sendgrid.from_email="noreply@your-domain.com" \
  fcm.server_key="xxx" \
  web_app.url="https://your-domain.com"

# 자동화 기능 설정
firebase functions:config:set \
  monitoring.enabled=true \
  auto_marketing.enabled=true \
  auto_support.enabled=true \
  auto_affiliate.enabled=true \
  monitoring.alert_email="admin@pricebuddy.com" \
  marketing.sns_enabled=true \
  marketing.blog_enabled=true \
  support.chatbot_enabled=true
```

## Scraper Service (.env)

```env
SCRAPER_BASE_URL=
PLAYWRIGHT_BROWSER_PATH=
```

## Review Engine (.env)

```env
REVIEW_BASE_URL=
HUGGINGFACE_API_KEY=
```

## Forecast Engine (.env)

```env
FORECAST_BASE_URL=
```

---

## 환경 변수 설명

### 자동화 기능 관련

#### `AUTO_MONITORING_ENABLED`
- **설명**: 자동 모니터링 시스템 활성화 여부
- **기본값**: `true`
- **사용처**: 스크래퍼 오류 감지, 자동 재시도

#### `AUTO_MARKETING_ENABLED`
- **설명**: 자동 마케팅 시스템 활성화 여부
- **기본값**: `true`
- **사용처**: 콘텐츠 자동 생성, SEO 자동화

#### `AUTO_SUPPORT_ENABLED`
- **설명**: 자동 고객 지원 시스템 활성화 여부
- **기본값**: `true`
- **사용처**: 챗봇, 자동 문제 해결

#### `AUTO_AFFILIATE_ENABLED`
- **설명**: 자동 제휴 프로그램 관리 활성화 여부
- **기본값**: `true`
- **사용처**: API 키 관리, 자동 정산

#### `MONITORING_ALERT_EMAIL`
- **설명**: 모니터링 알림을 받을 이메일 주소
- **필수**: 아니오
- **사용처**: 심각한 오류 발생 시 알림

#### `MONITORING_WEBHOOK_URL`
- **설명**: 모니터링 알림을 받을 웹훅 URL
- **필수**: 아니오
- **사용처**: Slack, Discord 등 연동

#### `MARKETING_SNS_ENABLED`
- **설명**: SNS 자동 포스팅 활성화 여부
- **기본값**: `true`
- **사용처**: Twitter, Facebook 자동 포스팅

#### `MARKETING_BLOG_ENABLED`
- **설명**: 블로그 콘텐츠 자동 생성 활성화 여부
- **기본값**: `true`
- **사용처**: 블로그 포스트 자동 생성

#### `SUPPORT_CHATBOT_ENABLED`
- **설명**: 챗봇 자동 응답 활성화 여부
- **기본값**: `true`
- **사용처**: 고객 지원 챗봇

#### `SUPPORT_AUTO_RESOLVE_ENABLED`
- **설명**: 자동 문제 해결 활성화 여부
- **기본값**: `true`
- **사용처**: 캐시백, 가격 오류 자동 해결

---

## 환경 변수 검증 스크립트

환경 변수가 올바르게 설정되었는지 확인하는 스크립트:

```bash
#!/bin/bash
# scripts/validate-env.sh

echo "=== 환경 변수 검증 ==="

# 필수 변수 확인
REQUIRED_VARS=(
  "FIREBASE_PROJECT_ID"
  "WEB_APP_URL"
  "VITE_API_BASE_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ 필수 환경 변수 누락: $var"
    exit 1
  else
    echo "✅ $var 설정됨"
  fi
done

# 자동화 기능 설정 확인
AUTO_VARS=(
  "AUTO_MONITORING_ENABLED"
  "AUTO_MARKETING_ENABLED"
  "AUTO_SUPPORT_ENABLED"
  "AUTO_AFFILIATE_ENABLED"
)

for var in "${AUTO_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  자동화 변수 미설정 (기본값 사용): $var"
  else
    echo "✅ $var = ${!var}"
  fi
done

echo "=== 검증 완료 ==="
```

---

## 환경 변수 설정 가이드

### 1. 로컬 개발 환경

```bash
# 루트 디렉터리에서
cp .env.example .env

# .env 파일 편집
nano .env
```

### 2. Firebase Functions 환경 변수

```bash
cd services/api

# 환경 변수 설정
firebase functions:config:set \
  scraper.base_url="https://..." \
  monitoring.enabled=true

# 환경 변수 확인
firebase functions:config:get
```

### 3. Cloud Run 환경 변수

```bash
# Scraper 서비스
gcloud run services update pricebuddy-scraper \
  --set-env-vars "SCRAPER_BASE_URL=https://..." \
  --region asia-northeast3

# Review 서비스
gcloud run services update pricebuddy-review \
  --set-env-vars "REVIEW_BASE_URL=https://..." \
  --region asia-northeast3
```

---

## 보안 주의사항

1. **민감한 정보는 절대 커밋하지 마세요**
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다
   - API 키, 비밀키는 환경 변수로만 관리

2. **프로덕션 환경 변수는 별도 관리**
   - Firebase Functions: `firebase functions:config:set`
   - Cloud Run: `gcloud run services update --set-env-vars`

3. **환경 변수 암호화**
   - Firebase Functions는 자동으로 암호화됩니다
   - Cloud Run은 Secret Manager 사용 권장

---

## 문제 해결

### 환경 변수가 적용되지 않는 경우

1. **Firebase Functions**
   ```bash
   # 환경 변수 재설정
   firebase functions:config:set key=value
   
   # Functions 재배포
   firebase deploy --only functions
   ```

2. **Cloud Run**
   ```bash
   # 환경 변수 확인
   gcloud run services describe SERVICE_NAME --region REGION
   
   # 환경 변수 재설정
   gcloud run services update SERVICE_NAME --set-env-vars KEY=VALUE
   ```

3. **로컬 개발**
   ```bash
   # .env 파일 확인
   cat .env
   
   # 서버 재시작
   npm run dev
   ```
