# 다음 단계 가이드

## ✅ 완료된 작업

1. **가격 추적 시스템 구현**
   - 가격 추적 API 엔드포인트
   - 가격 히스토리 조회
   - 자동 가격 업데이트 스케줄러

2. **언어 반영 개선**
   - 13개 언어 지원
   - 랜딩 페이지 번역 완료

3. **배포 준비**
   - 환경 변수 템플릿 (.env.example)
   - 배포 스크립트 (scripts/deploy.sh)
   - Firebase 설정 스크립트 (scripts/setup-firebase.sh)
   - 배포 가이드 문서 (DEPLOYMENT_GUIDE.md)

---

## 🚀 즉시 진행 가능한 작업

### 1. Firebase 프로젝트 설정

```bash
# 자동 설정 스크립트 실행
./scripts/setup-firebase.sh
```

또는 수동으로:
1. Firebase Console에서 프로젝트 생성
2. Firestore 데이터베이스 생성
3. Authentication 활성화 (이메일/비밀번호, Google)

### 2. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# 실제 값으로 채우기
nano .env  # 또는 원하는 에디터 사용
```

필수 설정:
- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `WEB_APP_URL`: 배포할 웹 앱 URL
- `VITE_API_BASE_URL`: Firebase Functions URL

### 3. Cloud Run 서비스 배포

```bash
# 각 서비스 배포
./scripts/deploy.sh scraper
./scripts/deploy.sh review
./scripts/deploy.sh forecast
```

배포 후 URL을 `.env`에 업데이트하세요.

### 4. Firebase Functions 배포

```bash
# 환경 변수 설정
cd services/api
firebase functions:config:set \
  scraper.base_url="https://pricebuddy-scraper-xxx.run.app" \
  review.base_url="https://pricebuddy-review-xxx.run.app" \
  forecast.base_url="https://pricebuddy-forecast-xxx.run.app"

# 배포
./scripts/deploy.sh api
```

### 5. Web App 배포

```bash
cd apps/web_app
pnpm build

# Vercel 배포
vercel deploy --prod

# 또는 Firebase Hosting
firebase deploy --only hosting
```

---

## 📋 배포 후 필수 작업

### 1. 제휴 링크 API 키 설정

각 마켓플레이스의 제휴 프로그램에 가입하고 API 키를 발급받아 설정:

- **쿠팡 파트너스**: https://partners.coupang.com
- **네이버 쇼핑**: https://shopping.naver.com
- **아마존 어소시에이트**: https://affiliate.amazon.com
- **라쿠텐 어필리에이트**: https://affiliate.rakuten.co.jp

설정 위치: `.env` 파일 또는 Firebase Functions 환경 변수

### 2. 결제 시스템 연동

**PortOne 사용 시:**
1. PortOne 계정 생성
2. API 키 발급
3. `.env`에 설정
4. `services/api/src/lib/payment.ts` 확인

**Toss Payments 사용 시:**
1. Toss Payments 계정 생성
2. 클라이언트 키 발급
3. `.env`에 설정

### 3. 이메일 발송 설정

**SendGrid 사용 시:**
```bash
# SendGrid API 키 발급 후
firebase functions:config:set \
  sendgrid.api_key="SG.xxx" \
  sendgrid.from_email="noreply@your-domain.com"
```

**AWS SES 사용 시:**
- AWS 계정 생성
- SES 서비스 활성화
- IAM 사용자 생성 및 권한 설정
- `.env`에 AWS 자격 증명 설정

### 4. FCM 푸시 알림 설정

1. Firebase Console > 프로젝트 설정 > Cloud Messaging
2. 서버 키 복사
3. Firebase Functions 환경 변수에 설정:
```bash
firebase functions:config:set fcm.server_key="your-server-key"
```

### 5. 스케줄러 활성화 확인

Firebase Console에서:
1. Functions > `updateProductPrices` 선택
2. "트리거" 탭에서 Pub/Sub 스케줄 확인
3. 필요시 수동으로 테스트 실행

---

## 🔧 운영 준비

### 1. 모니터링 설정

**Google Analytics:**
1. GA 계정 생성
2. 측정 ID 발급
3. `apps/web_app/src/shared/lib/analytics.ts` 구현 (필요시)

**Sentry (에러 추적):**
1. Sentry 프로젝트 생성
2. DSN 복사
3. `.env`에 설정
4. `apps/web_app/src/shared/lib/sentry.ts` 구현 (필요시)

### 2. 로깅 설정

Firebase Functions 로그:
```bash
firebase functions:log
```

Cloud Run 로그:
```bash
gcloud run services logs read SERVICE_NAME --region asia-northeast3
```

### 3. 백업 전략

**Firestore 백업:**
- Firebase Console > Firestore > 백업
- 자동 백업 스케줄 설정

**데이터 내보내기:**
```bash
gcloud firestore export gs://your-bucket/backup
```

---

## 🧪 테스트 체크리스트

배포 후 다음 항목들을 테스트하세요:

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

## 📚 참고 문서

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - 구현 체크리스트
- [docs/FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md) - Firebase 설정 가이드
- [docs/ENV_TEMPLATE.md](./docs/ENV_TEMPLATE.md) - 환경 변수 설명

---

## 💡 팁

1. **단계별 배포**: 한 번에 모든 것을 배포하지 말고, 단계별로 테스트하세요.
2. **스테이징 환경**: 프로덕션 전에 스테이징 환경에서 먼저 테스트하세요.
3. **롤백 계획**: 문제 발생 시 빠르게 롤백할 수 있도록 준비하세요.
4. **모니터링**: 배포 직후 모니터링을 강화하세요.

---

**준비가 되면 `./scripts/setup-firebase.sh`부터 시작하세요!** 🚀

