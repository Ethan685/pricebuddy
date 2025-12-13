# 배포 상태 확인 가이드

## ✅ 현재 배포 완료된 서비스

### 1. Firebase Functions
- **상태**: ✅ 배포 완료
- **Functions**:
  - `api` - 메인 HTTP API
  - `autoUpdateScrapers` - 스크래퍼 자동 업데이트 (매일)
  - `updateProductPrices` - 가격 업데이트 스케줄러 (매시간)
- **URL**: https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api
- **확인 방법**:
  ```bash
  cd services/api
  firebase functions:list
  ```

### 2. Firestore
- **상태**: ✅ 배포 완료
- **포함**: 보안 규칙, 인덱스
- **확인 방법**: Firebase Console에서 확인

---

## ❌ 아직 배포되지 않은 서비스

### 1. Web App (Frontend)
- **상태**: ❌ 미배포
- **위치**: `apps/web_app`
- **기술 스택**: React 19, Vite, Tailwind CSS
- **배포 필요**: Firebase Hosting 또는 Vercel

### 2. Cloud Run 서비스
- **상태**: ❌ 미배포
- **서비스**:
  - Scraper 서비스
  - Review 서비스
  - Forecast 서비스

---

## 🌐 웹사이트 접속 방법

### 현재 상태
**웹사이트는 아직 배포되지 않았습니다.**

### 배포 후 접속 방법

#### 방법 1: Firebase Hosting (권장)
```bash
cd apps/web_app
npm run build
firebase deploy --only hosting
```

**접속 URL**: `https://pricebuddy-5a869.web.app` 또는 `https://pricebuddy-5a869.firebaseapp.com`

#### 방법 2: Vercel
```bash
cd apps/web_app
vercel deploy
```

---

## 🔍 배포 상태 확인 방법

### 1. Functions 확인
```bash
# Functions 목록
cd services/api
firebase functions:list

# Functions 로그
firebase functions:log

# Functions 테스트
curl https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api/health
```

### 2. Hosting 확인
```bash
# Hosting 사이트 목록
firebase hosting:sites:list

# Hosting 배포 상태
firebase hosting:channel:list
```

### 3. Firebase Console에서 확인
- **Functions**: https://console.firebase.google.com/project/pricebuddy-5a869/functions
- **Hosting**: https://console.firebase.google.com/project/pricebuddy-5a869/hosting
- **Firestore**: https://console.firebase.google.com/project/pricebuddy-5a869/firestore

---

## 📋 배포 체크리스트

### 완료된 항목
- [x] Firebase Functions 배포
- [x] Firestore 보안 규칙 배포
- [x] Firestore 인덱스 배포
- [x] 자동화 기능 구현
- [x] API 테스트 환경 구축

### 남은 항목
- [ ] Web App 빌드 및 배포
- [ ] Cloud Run 서비스 배포 (Scraper, Review, Forecast)
- [ ] 환경 변수 설정
- [ ] 도메인 연결 (선택사항)

---

## 🚀 Web App 배포 방법

### 1. Firebase Hosting 설정

```bash
# 루트 디렉토리에 firebase.json 생성 (Hosting 설정 추가)
# 또는 apps/web_app에 firebase.json 생성
```

### 2. 빌드 및 배포

```bash
cd apps/web_app

# 빌드
npm run build

# Firebase Hosting 배포
firebase deploy --only hosting
```

### 3. 환경 변수 설정

`.env.production` 파일 생성:
```env
VITE_API_BASE_URL=https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=pricebuddy-5a869.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pricebuddy-5a869
```

---

## 💡 현재 접속 가능한 것

### API 엔드포인트
- **Functions API**: https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api
- **테스트**: 로컬 에뮬레이터 또는 위 URL로 직접 호출

### 웹사이트
- **현재**: 접속 불가 (배포 필요)
- **배포 후**: `https://pricebuddy-5a869.web.app` 또는 설정한 도메인

---

**요약: Functions는 배포되었지만, Web App은 아직 배포되지 않아 웹사이트로 접속할 수 없습니다.**

