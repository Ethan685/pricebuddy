#!/bin/bash
# 로컬 테스트 환경 구축 스크립트

set -e

echo "=== 로컬 테스트 환경 구축 ==="
echo ""

# 1. Firebase Emulators 설치 확인
echo "1. Firebase Emulators 확인..."
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI가 설치되지 않았습니다."
  echo "   설치: npm install -g firebase-tools"
  exit 1
fi

echo "✅ Firebase CLI 설치됨"
echo ""

# 2. Firebase 로그인 확인
echo "2. Firebase 로그인 확인..."
if ! firebase projects:list &> /dev/null; then
  echo "⚠️  Firebase에 로그인되지 않았습니다."
  echo "   로그인: firebase login"
  read -p "지금 로그인하시겠습니까? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase login
  else
    echo "❌ Firebase 로그인이 필요합니다."
    exit 1
  fi
fi

echo "✅ Firebase 로그인됨"
echo ""

# 3. Firebase Emulators 설정 확인
echo "3. Firebase Emulators 설정 확인..."
if [ ! -f "firebase.json" ]; then
  echo "⚠️  firebase.json 파일이 없습니다."
  echo "   Firebase 프로젝트를 초기화하세요: firebase init"
  exit 1
fi

echo "✅ firebase.json 파일 존재"
echo ""

# 4. 환경 변수 파일 확인
echo "4. 환경 변수 파일 확인..."
if [ ! -f ".env" ]; then
  echo "⚠️  .env 파일이 없습니다."
  if [ -f ".env.example" ]; then
    echo "   .env.example을 복사하여 .env 파일을 생성합니다..."
    cp .env.example .env
    echo "✅ .env 파일 생성됨"
    echo "   ⚠️  .env 파일을 편집하여 실제 값으로 채우세요."
  else
    echo "❌ .env.example 파일도 없습니다."
    exit 1
  fi
else
  echo "✅ .env 파일 존재"
fi

echo ""

# 5. 의존성 설치 확인
echo "5. 의존성 설치 확인..."
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules가 없습니다."
  echo "   의존성 설치: pnpm install"
  read -p "지금 설치하시겠습니까? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    pnpm install
  else
    echo "❌ 의존성 설치가 필요합니다."
    exit 1
  fi
else
  echo "✅ 의존성 설치됨"
fi

echo ""

# 6. 빌드 확인
echo "6. 빌드 확인..."
cd services/api
if ! npm run build &> /dev/null; then
  echo "⚠️  빌드 실패. 빌드를 시도합니다..."
  npm run build
else
  echo "✅ 빌드 성공"
fi
cd ../..

echo ""

# 7. Firebase Emulators 시작 안내
echo "=== 로컬 테스트 환경 준비 완료 ==="
echo ""
echo "다음 명령어로 Firebase Emulators를 시작하세요:"
echo ""
echo "  firebase emulators:start"
echo ""
echo "또는 특정 서비스만 시작:"
echo ""
echo "  firebase emulators:start --only functions"
echo "  firebase emulators:start --only firestore"
echo ""
echo "자동화 API 테스트:"
echo ""
echo "  API_BASE_URL=http://localhost:5001/your-project-id/api ./scripts/test-automation.sh"
echo ""

