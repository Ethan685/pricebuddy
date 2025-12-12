# 🚀 PriceBuddy 배포 시작하기

## 현재 상태

✅ **준비 완료!**
- Firebase CLI 설치됨
- gcloud CLI 설치됨  
- 배포 스크립트 준비됨
- 환경 변수 파일 생성됨

## 즉시 배포하기

### 방법 1: 자동 배포 스크립트 (권장)

```bash
./DEPLOY_NOW.sh
```

이 스크립트는:
1. Firebase 프로젝트 확인/설정
2. Firestore 규칙 및 인덱스 배포
3. Functions 빌드 및 배포

### 방법 2: 단계별 배포

#### 1단계: Firebase 프로젝트 설정

```bash
cd services/api

# 프로젝트 목록 확인
firebase projects:list

# 프로젝트 선택 (또는 새로 생성)
firebase use your-project-id
```

#### 2단계: Firestore 설정 배포

```bash
# Firestore 데이터베이스가 생성되어 있는지 확인
# Firebase Console: https://console.firebase.google.com

# 보안 규칙 및 인덱스 배포
firebase deploy --only firestore:rules,firestore:indexes
```

#### 3단계: Functions 배포

```bash
# 빌드
npm run build

# 배포
firebase deploy --only functions
```

## 중요 사항

⚠️ **Firebase 프로젝트 ID 설정 필요**

현재 `.firebaserc`에 `your-project-id`로 설정되어 있습니다.
실제 프로젝트 ID로 변경하세요:

```bash
cd services/api
firebase use your-actual-project-id
```

또는 `.firebaserc` 파일을 직접 편집하세요.

## 다음 단계

배포 후:
1. Web App 배포: `cd apps/web_app && pnpm build && vercel deploy --prod`
2. Cloud Run 서비스 배포 (선택): `./scripts/deploy.sh scraper`
3. 환경 변수 설정: `.env` 파일 편집

자세한 내용은 `DEPLOYMENT_GUIDE.md`를 참고하세요.
