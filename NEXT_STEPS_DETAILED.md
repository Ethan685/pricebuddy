# PriceBuddy 다음 단계 상세 가이드

**작성일**: 2024-12-12  
**현재 상태**: 배포 준비 완료, GitHub 업데이트 완료

---

## ✅ 완료된 작업

- [x] Merge conflict 해결
- [x] 불필요한 파일 제거 (ml_service/venv/, dist/, emulator-data/)
- [x] .gitignore 최적화
- [x] GitHub 업데이트 완료
- [x] 배포 스크립트 준비
- [x] 배포 가이드 문서 작성

---

## 🚀 다음 단계 (우선순위 순)

### 1단계: 환경 변수 설정 (즉시 가능) ⚡

**목적**: 프로젝트 설정 및 외부 서비스 연동

```bash
# .env 파일 확인/생성
cd /Users/ethanpark/Documents/Pricebuddy\ F
cat .env  # 현재 설정 확인
```

**필수 설정 항목**:
- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `VITE_API_BASE_URL`: Firebase Functions URL (배포 후 설정)
- `WEB_APP_URL`: 배포된 웹 앱 URL (배포 후 설정)

**선택 설정 항목** (나중에 설정 가능):
- 제휴 링크 API 키 (쿠팡, 네이버 등)
- 결제 시스템 API 키 (PortOne, Toss Payments)
- 이메일 발송 서비스 (SendGrid, AWS SES)
- FCM 서버 키

---

### 2단계: Firebase Blaze 플랜 업그레이드 (Functions 배포 전 필수) 🔥

**목적**: Firebase Functions 배포를 위한 플랜 업그레이드

**작업 내용**:
1. Firebase Console 접속
   - https://console.firebase.google.com/project/pricebuddy-5a869/usage/details
2. Blaze 플랜으로 업그레이드
   - 결제 정보 입력
   - 무료 할당량 내에서는 비용 발생 없음
3. 업그레이드 확인

**참고**: 
- Spark 플랜에서는 Functions 배포 불가
- Blaze 플랜은 사용량 기반 과금 (무료 할당량 제공)

---

### 3단계: Cloud Run 서비스 배포 (선택, 먼저 배포 가능) ☁️

**목적**: ML/AI 서비스 배포 (Scraper, Review, Forecast)

**배포 순서**:

```bash
# 1. Scraper 서비스 배포
./scripts/deploy.sh scraper

# 2. Review 서비스 배포
./scripts/deploy.sh review

# 3. Forecast 서비스 배포
./scripts/deploy.sh forecast
```

**배포 전 확인사항**:
- [ ] Google Cloud SDK 설치 및 로그인 (`gcloud auth login`)
- [ ] Docker 설치 및 실행 중
- [ ] 프로젝트 ID 설정 (`FIREBASE_PROJECT_ID` 환경 변수)

**배포 후 작업**:
- 각 서비스의 URL 확인
- `.env` 파일에 URL 업데이트
- Firebase Functions 환경 변수에 URL 설정

---

### 4단계: Firebase Functions 배포 🔧

**목적**: 메인 API 서버 배포

**배포 전 확인**:
- [ ] Blaze 플랜 업그레이드 완료
- [ ] Cloud Run 서비스 URL 확인 (선택)
- [ ] Firebase 로그인 (`firebase login`)

**배포 절차**:

```bash
cd services/api

# 1. 환경 변수 설정 (Cloud Run 서비스 배포 후)
firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app"

# 2. Functions 배포
firebase deploy --only functions

# 또는 배포 스크립트 사용
cd ../..
./scripts/deploy.sh api
```

**배포되는 Functions**:
- `api`: 메인 HTTP API
- `updateProductPrices`: 가격 업데이트 스케줄러 (매 시간)
- `checkPriceAlerts`: 가격 알림 체크 스케줄러 (매 시간)

---

### 5단계: Web App 배포 🌐

**목적**: 프론트엔드 애플리케이션 배포

**배포 옵션**:

#### 옵션 A: Vercel 배포 (권장)

```bash
cd apps/web_app

# 1. 빌드
pnpm build

# 2. Vercel 배포
vercel deploy --prod
```

#### 옵션 B: Firebase Hosting 배포

```bash
cd apps/web_app

# 1. 빌드
pnpm build

# 2. Firebase Hosting 설정 후
firebase deploy --only hosting
```

**배포 전 확인**:
- [ ] `.env` 파일에 `VITE_API_BASE_URL` 설정 (Firebase Functions URL)
- [ ] 빌드 성공 확인

---

## 📋 배포 후 필수 작업

### 1. 제휴 링크 API 키 설정

각 마켓플레이스의 제휴 프로그램 가입:
- 쿠팡 파트너스
- 네이버 쇼핑
- 아마존 어소시에이트
- 기타 마켓플레이스

### 2. 결제 시스템 연동

- PortOne 또는 Toss Payments 가입
- API 키 발급
- 테스트 결제 진행

### 3. 알림 시스템 설정

- SendGrid 또는 AWS SES 가입
- 이메일 API 키 발급
- Firebase Cloud Messaging 설정

### 4. 모니터링 설정

- Google Analytics
- Sentry (에러 추적)
- Firebase Performance Monitoring

---

## 🧪 테스트 체크리스트

배포 후 다음 항목들을 테스트:

- [ ] API 엔드포인트 동작 확인
- [ ] 검색 기능 테스트
- [ ] 상품 상세 페이지 로드
- [ ] 가격 추적 기능 테스트
- [ ] 가격 알림 설정 및 발송
- [ ] 인증 (로그인/회원가입)
- [ ] Wallet 기능
- [ ] 제휴 링크 생성
- [ ] 결제 플로우 (테스트 모드)
- [ ] 이메일 발송 테스트
- [ ] 푸시 알림 테스트
- [ ] 스케줄러 동작 확인

---

## 💡 권장 진행 순서

### 빠른 시작 (최소 구성)

1. **환경 변수 설정** (5분)
2. **Firebase Blaze 플랜 업그레이드** (5분)
3. **Firebase Functions 배포** (10분)
4. **Web App 배포** (10분)

**총 소요 시간**: 약 30분

### 완전한 배포 (모든 서비스)

1. 환경 변수 설정
2. Firebase Blaze 플랜 업그레이드
3. Cloud Run 서비스 배포 (Scraper, Review, Forecast)
4. Firebase Functions 배포
5. Web App 배포
6. 제휴 링크 API 키 설정
7. 결제 시스템 연동
8. 알림 시스템 설정

**총 소요 시간**: 2-3시간

---

## 📚 참고 문서

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 전체 배포 가이드
- [NEXT_STEPS.md](./NEXT_STEPS.md) - 다음 단계 가이드
- [scripts/deploy.sh](./scripts/deploy.sh) - 배포 스크립트
- [.env.example](./.env.example) - 환경 변수 템플릿

---

## 🆘 문제 해결

### 빌드 에러
- 테스트 파일 관련 에러는 배포에 영향 없음
- 핵심 코드는 정상 빌드됨

### 배포 실패
- 로그 확인: `firebase functions:log`
- 환경 변수 확인: `firebase functions:config:get`

### Cloud Run 배포 실패
- Docker 이미지 빌드 확인
- Google Cloud 권한 확인

---

**준비가 되면 1단계부터 시작하세요!** 🚀

