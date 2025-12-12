#!/bin/bash
# PriceBuddy 배포 시작 스크립트

set -e

echo "🚀 PriceBuddy 배포 시작!"
echo ""

# 1. Firebase CLI 확인
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI가 설치되지 않았습니다."
    echo "설치: npm install -g firebase-tools"
    exit 1
fi
echo "✅ Firebase CLI 설치됨"

# 2. Firebase 로그인 확인
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Firebase 로그인이 필요합니다..."
    firebase login
fi
echo "✅ Firebase 로그인 확인됨"

# 3. .env 파일 확인
if [ ! -f .env ]; then
    echo "📝 .env 파일 생성 중..."
    cp .env.example .env
    echo "✅ .env 파일 생성 완료"
    echo "⚠️  .env 파일을 편집하여 실제 값으로 채워주세요!"
    echo ""
    read -p "계속하시겠습니까? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 0
    fi
else
    echo "✅ .env 파일 존재"
fi

# 4. Firebase 프로젝트 설정
cd services/api
if [ ! -f .firebaserc ]; then
    echo "⚠️  Firebase 프로젝트가 설정되지 않았습니다."
    echo "프로젝트 ID를 입력하거나 'new'로 새 프로젝트 생성:"
    read -p "프로젝트 ID: " PROJECT_ID
    
    if [ "$PROJECT_ID" = "new" ]; then
        firebase projects:create
        read -p "생성된 프로젝트 ID를 입력하세요: " PROJECT_ID
    fi
    
    firebase use $PROJECT_ID
    echo "✅ Firebase 프로젝트 설정 완료: $PROJECT_ID"
else
    echo "✅ Firebase 프로젝트 설정됨"
fi

# 5. Firestore 데이터베이스 확인
echo ""
echo "⚠️  Firestore 데이터베이스가 생성되어 있는지 확인하세요:"
echo "   https://console.firebase.google.com/project/$(firebase use | grep -oP 'Using \K[^\s]+')/firestore"
read -p "Firestore 데이터베이스를 생성했나요? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Firestore 데이터베이스를 먼저 생성해주세요."
    exit 1
fi

# 6. Firestore 설정 배포
echo ""
echo "📦 Firestore 보안 규칙 및 인덱스 배포 중..."
firebase deploy --only firestore:rules,firestore:indexes
echo "✅ Firestore 설정 배포 완료"

cd ../..

# 7. 다음 단계 안내
echo ""
echo "✅ 초기 설정 완료!"
echo ""
echo "다음 단계:"
echo "1. .env 파일 편집 (필수 값 설정)"
echo "2. Cloud Run 서비스 배포 (선택): ./scripts/deploy.sh scraper"
echo "3. Firebase Functions 배포: ./scripts/deploy.sh api"
echo "4. Web App 배포: ./scripts/deploy.sh web"
echo ""
echo "자세한 내용은 DEPLOYMENT_GUIDE.md를 참고하세요."
