# 다음 개발 스텝 가이드

**작성일**: 2024-12-12  
**현재 상태**: 자동화 기능 구현 완료, 빌드 오류 수정 완료

---

## ✅ 완료된 작업

### 1. 자동화 기능 구현
- ✅ 자동 모니터링 시스템 (`/monitoring`)
- ✅ 자동 스크래퍼 업데이트 (`/scraper-auto-update`)
- ✅ 자동 제휴 프로그램 관리 (`/auto-affiliate`)
- ✅ 자동 마케팅 시스템 (`/auto-marketing`)
- ✅ 자동 고객 지원 시스템 (`/auto-support`)

### 2. 빌드 오류 수정
- ✅ 타입 오류 수정
- ✅ 테스트 파일 빌드 제외

---

## 🚀 다음 개발 스텝

### Phase 1: 자동화 기능 테스트 및 검증 (우선순위 높음)

#### 1.1 자동화 API 엔드포인트 테스트

**작업:**
```bash
# 로컬에서 API 서버 실행
cd services/api
npm run dev

# 각 엔드포인트 테스트
curl -X POST http://localhost:5001/your-project/api/monitoring/scraper-error \
  -H "Content-Type: application/json" \
  -d '{"marketplace": "coupang", "url": "https://...", "error": "test"}'

curl -X GET http://localhost:5001/your-project/api/monitoring/scraper-health

curl -X POST http://localhost:5001/your-project/api/auto-marketing/generate-content \
  -H "Content-Type: application/json" \
  -d '{"type": "blog", "topic": "아이폰 15"}'

curl -X POST http://localhost:5001/your-project/api/auto-support/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "캐시백은 어떻게 받나요?", "userId": "test"}'
```

**체크리스트:**
- [ ] 모니터링 API 동작 확인
- [ ] 자동 마케팅 콘텐츠 생성 확인
- [ ] 자동 고객 지원 챗봇 동작 확인
- [ ] 자동 제휴 관리 기능 확인

---

#### 1.2 자동화 스케줄러 통합 테스트

**작업:**
```bash
# 스케줄러 함수 로컬 테스트
cd services/api
firebase emulators:start --only functions

# 수동으로 스케줄러 트리거
# Firebase Console에서 수동 실행 또는
# Pub/Sub 메시지 직접 발송
```

**체크리스트:**
- [ ] `updateProductPrices` 스케줄러 동작 확인
- [ ] `autoUpdateScrapers` 스케줄러 동작 확인
- [ ] 오류 발생 시 자동 재시도 확인
- [ ] 구조 변경 감지 확인

---

### Phase 2: 환경 변수 및 설정 완성

#### 2.1 환경 변수 템플릿 업데이트

**작업:**
```bash
# .env.example 업데이트
# 자동화 기능 관련 환경 변수 추가
```

**추가할 환경 변수:**
```env
# 자동화 기능
AUTO_MARKETING_ENABLED=true
AUTO_SUPPORT_ENABLED=true
AUTO_MONITORING_ENABLED=true

# 모니터링 알림
MONITORING_ALERT_EMAIL=admin@pricebuddy.com
MONITORING_WEBHOOK_URL=https://...

# 자동 마케팅
MARKETING_SNS_ENABLED=true
MARKETING_BLOG_ENABLED=true
```

---

#### 2.2 Firebase Functions 환경 변수 설정 가이드

**작업:**
```bash
# 환경 변수 설정 스크립트 작성
# scripts/setup-env.sh 생성
```

**스크립트 내용:**
```bash
#!/bin/bash
firebase functions:config:set \
  monitoring.enabled=true \
  auto_marketing.enabled=true \
  auto_support.enabled=true \
  monitoring.alert_email="admin@pricebuddy.com"
```

---

### Phase 3: 배포 준비

#### 3.1 배포 체크리스트 작성

**작업:**
- [ ] Firebase 프로젝트 설정
- [ ] Firestore 데이터베이스 생성
- [ ] 환경 변수 설정
- [ ] Cloud Run 서비스 배포
- [ ] Firebase Functions 배포
- [ ] Web App 배포

**상세 체크리스트:**
```markdown
## 배포 전 체크리스트

### 인프라
- [ ] Firebase 프로젝트 생성
- [ ] Firestore 데이터베이스 생성
- [ ] Authentication 활성화
- [ ] Cloud Run 서비스 준비

### 환경 변수
- [ ] .env 파일 생성
- [ ] Firebase Functions 환경 변수 설정
- [ ] 제휴 API 키 설정
- [ ] 이메일 발송 서비스 설정

### 배포
- [ ] Scraper 서비스 배포
- [ ] Review 서비스 배포
- [ ] Forecast 서비스 배포
- [ ] API Functions 배포
- [ ] Web App 배포

### 테스트
- [ ] API 엔드포인트 테스트
- [ ] 자동화 기능 테스트
- [ ] 스케줄러 동작 확인
```

---

#### 3.2 배포 스크립트 개선

**작업:**
```bash
# scripts/deploy.sh 개선
# 자동화 기능 배포 포함
```

**개선 사항:**
- 자동화 기능 배포 확인
- 환경 변수 자동 설정
- 배포 후 자동 테스트

---

### Phase 4: 문서화 및 가이드

#### 4.1 자동화 기능 사용 가이드

**작업:**
- 자동화 기능 사용법 문서 작성
- API 엔드포인트 문서 작성
- 예제 코드 작성

---

#### 4.2 운영 가이드 작성

**작업:**
- 모니터링 가이드
- 문제 해결 가이드
- 성능 최적화 가이드

---

## 📋 즉시 진행 가능한 작업

### 1. 로컬 테스트 환경 구축

```bash
# Firebase Emulators 설치
npm install -g firebase-tools
firebase login

# Emulators 시작
firebase emulators:start

# 별도 터미널에서 API 테스트
curl http://localhost:5001/your-project/api/health
```

---

### 2. 자동화 기능 단위 테스트 작성

**작업:**
```typescript
// services/api/src/routes/__tests__/monitoring.test.ts
describe('Monitoring API', () => {
  it('should record scraper error', async () => {
    // 테스트 코드
  });
  
  it('should auto-retry on error', async () => {
    // 테스트 코드
  });
});
```

---

### 3. 환경 변수 검증 스크립트

**작업:**
```bash
# scripts/validate-env.sh
# 필수 환경 변수 확인
# 누락된 변수 알림
```

---

## 🎯 우선순위

### 높음 (즉시 진행)
1. ✅ 자동화 기능 빌드 오류 수정 (완료)
2. ⏳ 자동화 API 엔드포인트 테스트
3. ⏳ 환경 변수 템플릿 업데이트

### 중간 (1주 내)
1. ⏳ 배포 체크리스트 작성
2. ⏳ 배포 스크립트 개선
3. ⏳ 자동화 기능 문서화

### 낮음 (2주 내)
1. ⏳ 단위 테스트 작성
2. ⏳ E2E 테스트 작성
3. ⏳ 성능 최적화

---

## 💡 다음 세션 시작 시

1. **로컬 테스트 환경 구축**
   ```bash
   firebase emulators:start
   ```

2. **자동화 API 테스트**
   - 각 엔드포인트 동작 확인
   - 오류 처리 확인

3. **환경 변수 설정**
   - .env.example 업데이트
   - 실제 값 설정

---

## 📚 참고 문서

- [AUTOMATION_FEATURES.md](./AUTOMATION_FEATURES.md) - 자동화 기능 상세 설명
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 배포 가이드
- [NEXT_STEPS.md](./NEXT_STEPS.md) - 일반적인 다음 단계

---

**다음 세션: 자동화 기능 테스트 및 검증부터 시작하세요!** 🚀

