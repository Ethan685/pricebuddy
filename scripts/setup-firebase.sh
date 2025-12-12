#!/bin/bash

# Firebase 프로젝트 초기 설정 스크립트
# 사용법: ./scripts/setup-firebase.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Firebase CLI 확인
if ! command -v firebase &> /dev/null; then
    log_error "Firebase CLI가 설치되지 않았습니다."
    echo "설치: npm install -g firebase-tools"
    exit 1
fi

# gcloud CLI 확인
if ! command -v gcloud &> /dev/null; then
    log_warn "gcloud CLI가 설치되지 않았습니다. Cloud Run 배포를 위해 필요합니다."
fi

log_info "Firebase 프로젝트 설정 시작..."

# 1. Firebase 로그인 확인
log_info "Firebase 로그인 확인 중..."
if ! firebase projects:list &> /dev/null; then
    log_info "Firebase 로그인이 필요합니다..."
    firebase login
fi

# 2. 프로젝트 선택 또는 생성
echo ""
read -p "Firebase 프로젝트 ID를 입력하세요 (또는 'new'로 새 프로젝트 생성): " PROJECT_ID

if [ "$PROJECT_ID" = "new" ]; then
    log_info "새 Firebase 프로젝트 생성..."
    firebase projects:create
    read -p "생성된 프로젝트 ID를 입력하세요: " PROJECT_ID
fi

# 3. 프로젝트 설정
log_info "프로젝트 설정 중: $PROJECT_ID"
cd services/api
firebase use $PROJECT_ID

# 4. Firestore 데이터베이스 생성 확인
log_info "Firestore 데이터베이스가 생성되어 있는지 확인 중..."
log_warn "Firebase Console에서 Firestore 데이터베이스를 생성해주세요:"
log_warn "https://console.firebase.google.com/project/$PROJECT_ID/firestore"
read -p "Firestore 데이터베이스를 생성했나요? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    log_error "Firestore 데이터베이스를 먼저 생성해주세요."
    exit 1
fi

# 5. Firestore 보안 규칙 배포
log_info "Firestore 보안 규칙 배포 중..."
firebase deploy --only firestore:rules --project $PROJECT_ID

# 6. Firestore 인덱스 배포
log_info "Firestore 인덱스 배포 중..."
firebase deploy --only firestore:indexes --project $PROJECT_ID

# 7. Authentication 활성화 확인
log_warn "Firebase Console에서 Authentication을 활성화해주세요:"
log_warn "https://console.firebase.google.com/project/$PROJECT_ID/authentication"
log_warn "이메일/비밀번호 및 Google 로그인 제공업체를 활성화하세요."

# 8. 환경 변수 설정 안내
log_info ""
log_info "다음 단계:"
log_info "1. .env.example을 .env로 복사하고 값 채우기"
log_info "2. Firebase Functions 환경 변수 설정:"
log_info "   firebase functions:config:set scraper.base_url=\"...\""
log_info "3. Cloud Run 서비스 배포: ./scripts/deploy.sh scraper"
log_info "4. Firebase Functions 배포: ./scripts/deploy.sh api"

cd ../..

log_info "Firebase 설정 완료!"

