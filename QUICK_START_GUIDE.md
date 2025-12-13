# PriceBuddy 빠른 시작 가이드

**작성일**: 2024-12-12  
**목적**: 실제로 실행 가능한 단계별 가이드

---

## 🚀 지금 바로 시작하기

### Step 1: 환경 확인 (자동 실행 가능)

제가 방금 확인한 결과:
- ✅ 스크립트 문법 검증 통과
- ✅ API 빌드 성공
- ⚠️  Firebase 설정 필요 (사용자 작업)

---

### Step 2: Firebase 설정 (사용자 작업 필요)

#### 2.1 Firebase CLI 설치 (아직 안 했다면)
```bash
npm install -g firebase-tools
```

#### 2.2 Firebase 로그인
```bash
firebase login
```

#### 2.3 Firebase 프로젝트 초기화
```bash
# 프로젝트 루트에서
firebase init

# 선택 항목:
# - Functions: Yes
# - Firestore: Yes
# - Hosting: 선택 (Web App 배포 시)
```

---

### Step 3: 환경 변수 설정

#### 3.1 .env 파일 생성
```bash
# .env.example이 있다면
cp .env.example .env

# 또는 직접 생성
touch .env
```

#### 3.2 필수 환경 변수 설정
`.env` 파일에 다음 내용 추가:
```env
FIREBASE_PROJECT_ID=your-project-id
WEB_APP_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5001/your-project-id/api
```

---

### Step 4: 로컬 테스트 환경 구축

#### 4.1 자동 설정 스크립트 실행
```bash
./scripts/setup-local-test.sh
```

이 스크립트가 확인하는 것:
- ✅ Firebase CLI 설치 확인
- ✅ Firebase 로그인 확인
- ✅ firebase.json 파일 확인
- ✅ .env 파일 확인
- ✅ 의존성 설치 확인
- ✅ 빌드 확인

---

### Step 5: Firebase Emulators 시작

#### 5.1 Emulators 시작
```bash
firebase emulators:start
```

또는 특정 서비스만:
```bash
firebase emulators:start --only functions,firestore
```

#### 5.2 Emulators 접속 확인
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- UI: http://localhost:4000

---

### Step 6: 자동화 API 테스트

#### 6.1 API 테스트 스크립트 실행
```bash
# 로컬 Emulators 사용 시
API_BASE_URL=http://localhost:5001/your-project-id/api \
  ./scripts/test-automation.sh
```

#### 6.2 개별 엔드포인트 테스트
```bash
# Health check
curl http://localhost:5001/your-project-id/api/health

# 모니터링 API
curl http://localhost:5001/your-project-id/api/monitoring/scraper-health

# 자동 마케팅 API
curl -X POST http://localhost:5001/your-project-id/api/auto-marketing/generate-content \
  -H "Content-Type: application/json" \
  -d '{"type": "blog", "topic": "테스트"}'
```

---

## 📋 체크리스트

### 제가 확인한 것 (완료)
- [x] 스크립트 문법 검증
- [x] API 빌드 확인
- [x] 자동화 API 라우터 확인

### 사용자가 해야 할 것
- [ ] Firebase CLI 설치
- [ ] Firebase 로그인
- [ ] Firebase 프로젝트 초기화
- [ ] .env 파일 생성 및 설정
- [ ] Firebase Emulators 시작
- [ ] API 테스트 실행

---

## 🎯 빠른 테스트 (최소 설정)

Firebase 설정 없이도 테스트할 수 있는 방법:

### 1. 빌드만 테스트
```bash
cd services/api
npm run build
```

### 2. 코드 검증만
```bash
# TypeScript 타입 체크
cd services/api
npx tsc --noEmit
```

### 3. 스크립트 문법 확인
```bash
bash -n scripts/test-automation.sh
bash -n scripts/setup-local-test.sh
```

---

## 💡 제가 할 수 있는 것 vs 사용자가 해야 할 것

### 제가 할 수 있는 것 ✅
1. **코드 검증**
   - 빌드 테스트
   - 타입 체크
   - 문법 검증

2. **파일 생성/수정**
   - 스크립트 작성
   - 문서 작성
   - 코드 수정

3. **기본 확인**
   - 파일 존재 확인
   - 명령어 설치 확인

### 사용자가 해야 할 것 👤
1. **인증 관련**
   - Firebase 로그인
   - Google Cloud 인증
   - API 키 발급

2. **실제 실행**
   - Firebase Emulators 시작
   - 실제 배포
   - 서비스 실행

3. **환경 설정**
   - .env 파일 값 입력
   - 프로젝트 ID 설정

---

## 🚀 다음 단계

### 지금 바로 할 수 있는 것:
1. **빌드 테스트** (제가 이미 확인함)
2. **코드 검증** (제가 이미 확인함)
3. **문서 확인** (제가 작성함)

### 사용자가 해야 할 것:
1. **Firebase 설정**
   ```bash
   firebase login
   firebase init
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일 편집
   ```

3. **Emulators 시작**
   ```bash
   firebase emulators:start
   ```

4. **API 테스트**
   ```bash
   ./scripts/test-automation.sh
   ```

---

## 📞 도움이 필요하면

1. **빌드 오류**: 제가 확인 가능
2. **코드 오류**: 제가 수정 가능
3. **Firebase 설정**: 사용자 작업 필요
4. **실제 실행**: 사용자 작업 필요

---

**제가 할 수 있는 것은 모두 완료했습니다! 이제 사용자가 Firebase 설정만 하면 바로 테스트할 수 있습니다.** 🚀

