#!/bin/bash
echo "=== Firebase Emulator Functions 확인 ==="
echo ""

# Functions 목록 확인
echo "1. Functions 목록:"
curl -s http://127.0.0.1:5001 2>&1 | jq -r '.functions[]' 2>/dev/null || echo "   Functions 목록을 가져올 수 없습니다"
echo ""

# Health 체크 (다양한 경로 시도)
echo "2. Health 체크 (다양한 경로):"
for path in \
  "/pricebuddy-5a869/asia-northeast3/api/health" \
  "/pricebuddy-5a869/us-central1/api/health" \
  "/api/health" \
  "/health"
do
  echo "   시도: $path"
  RESPONSE=$(curl -s "http://127.0.0.1:5001$path" 2>&1)
  if echo "$RESPONSE" | jq -e '.ok' > /dev/null 2>&1; then
    echo "   ✅ 성공: $path"
    break
  else
    echo "   ❌ 실패: $(echo "$RESPONSE" | head -c 100)"
  fi
done
echo ""

echo "=== 확인 완료 ==="
