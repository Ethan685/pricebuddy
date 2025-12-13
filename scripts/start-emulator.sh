#!/bin/bash
# Firebase Functions 에뮬레이터 시작 스크립트

cd "$(dirname "$0")/../services/api"

echo "🚀 Firebase Functions 에뮬레이터 시작 중..."
echo ""

firebase emulators:start --only functions

