#!/bin/bash
# PriceBuddy 즉시 배포 스크립트

set -e

echo "🚀 PriceBuddy 배포 시작!"
echo ""

# 현재 프로젝트 확인
cd services/api
CURRENT_PROJECT=$(firebase use 2>&1 | grep -v "Using" | head -1 | xargs)

if [ "$CURRENT_PROJECT" = "your-project-id" ] || [ -z "$CURRENT_PROJECT" ]; then
    echo "⚠️  Firebase 프로젝트가 설정되지 않았습니다."
    echo ""
    echo "Firebase 프로젝트를 선택하세요:"
    firebase projects:list
    echo ""
    read -p "프로젝트 ID를 입력하세요: " PROJECT_ID
    firebase use $PROJECT_ID
    echo "✅ 프로젝트 설정 완료: $PROJECT_ID"
else
    echo "✅ 현재 프로젝트: $CURRENT_PROJECT"
fi

# Firestore 확인
echo ""
echo "📦 Firestore 설정 배포 중..."
firebase deploy --only firestore:rules,firestore:indexes

# Functions 빌드
echo ""
echo "🔨 Functions 빌드 중..."
npm run build

# Functions 배포
echo ""
echo "🚀 Functions 배포 중..."
firebase deploy --only functions

echo ""
echo "✅ 배포 완료!"
echo ""
echo "다음 단계:"
echo "1. Web App 배포: cd ../../apps/web_app && pnpm build && vercel deploy --prod"
echo "2. Cloud Run 서비스 배포 (선택): ../../scripts/deploy.sh scraper"
