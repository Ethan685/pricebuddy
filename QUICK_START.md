# 🚀 PriceBuddy 빠른 시작 가이드

## 현재 상태 확인

배포를 시작하기 전에 다음을 확인하세요:

### 1. 필수 도구 설치 확인

```bash
# Firebase CLI
firebase --version

# Google Cloud SDK (Cloud Run 배포용)
gcloud --version

# Node.js 및 pnpm
node --version
pnpm --version
```

### 2. Firebase 로그인

```bash
firebase login
```

### 3. 프로젝트 생성 또는 선택

**옵션 A: 새 프로젝트 생성**
1. Firebase Console 접속: https://console.firebase.google.com
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력
4. Google Analytics 설정 (선택)
5. 프로젝트 생성

**옵션 B: 기존 프로젝트 사용**
```bash
cd services/api
firebase use your-project-id
```

### 4. Firestore 데이터베이스 생성

1. Firebase Console > Firestore Database
2. "데이터베이스 만들기" 클릭
3. 프로덕션 모드 선택 (나중에 보안 규칙 설정)
4. 리전 선택: `asia-northeast3` (서울)

### 5. Authentication 활성화

1. Firebase Console > Authentication
2. "시작하기" 클릭
3. "이메일/비밀번호" 제공업체 활성화
4. "Google" 제공업체 활성화 (선택)

---

## 자동 설정 스크립트 실행

```bash
./scripts/setup-firebase.sh
```

이 스크립트는:
- Firebase 로그인 확인
- 프로젝트 선택/생성 안내
- Firestore 보안 규칙 배포
- Firestore 인덱스 배포

---

## 환경 변수 설정

```bash
# .env 파일이 없다면 생성
cp .env.example .env

# 필수 값 설정
nano .env  # 또는 원하는 에디터
```

**최소 필수 설정:**
```env
FIREBASE_PROJECT_ID=your-actual-project-id
WEB_APP_URL=https://your-domain.com
VITE_API_BASE_URL=https://asia-northeast3-your-project-id.cloudfunctions.net/api
```

---

## 배포 순서

### 1단계: Firestore 설정 배포

```bash
cd services/api
firebase deploy --only firestore:rules,firestore:indexes
```

### 2단계: Cloud Run 서비스 배포 (선택)

실제 스크래핑/ML 서비스가 필요하면:

```bash
# Scraper 서비스
./scripts/deploy.sh scraper

# Review 서비스
./scripts/deploy.sh review

# Forecast 서비스
./scripts/deploy.sh forecast
```

배포 후 URL을 `.env`에 업데이트하세요.

### 3단계: Firebase Functions 환경 변수 설정

```bash
cd services/api

firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app" \
  web_app.url="https://your-domain.com"
```

### 4단계: Firebase Functions 배포

```bash
./scripts/deploy.sh api
```

또는:

```bash
cd services/api
npm run build
firebase deploy --only functions
```

### 5단계: Web App 배포

```bash
cd apps/web_app
pnpm build

# Vercel 배포
vercel deploy --prod

# 또는 Firebase Hosting
firebase deploy --only hosting
```

---

## 배포 확인

### API 엔드포인트 테스트

```bash
# Health check (구현되어 있다면)
curl https://asia-northeast3-your-project-id.cloudfunctions.net/api/health

# Search 테스트
curl "https://asia-northeast3-your-project-id.cloudfunctions.net/api/search?q=iphone"
```

### Firebase Console 확인

1. Functions > `api` 함수 확인
2. Functions > `updateProductPrices` 스케줄러 확인
3. Firestore > 데이터 확인

---

## 문제 해결

### Firebase CLI 설치

```bash
npm install -g firebase-tools
firebase login
```

### gcloud CLI 설치

```bash
# macOS
brew install google-cloud-sdk

# 또는 공식 설치 스크립트
curl https://sdk.cloud.google.com | bash
```

### 빌드 에러

```bash
# 의존성 재설치
cd services/api
rm -rf node_modules
npm install

# 빌드
npm run build
```

---

## 다음 단계

배포가 완료되면:

1. **제휴 링크 API 키 설정** - 각 마켓플레이스 제휴 프로그램 가입
2. **결제 시스템 연동** - PortOne 또는 Toss Payments 설정
3. **이메일 발송 설정** - SendGrid 또는 AWS SES 설정
4. **FCM 푸시 알림 설정** - Firebase Console에서 서버 키 발급

자세한 내용은 `NEXT_STEPS.md`를 참고하세요.

---

**준비가 되셨다면 위 순서대로 진행하세요!** 🚀

