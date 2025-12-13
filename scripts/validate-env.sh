#!/bin/bash
# 환경 변수 검증 스크립트

set -e

echo "=== 환경 변수 검증 ==="
echo ""

# 필수 변수 확인
REQUIRED_VARS=(
  "FIREBASE_PROJECT_ID"
  "WEB_APP_URL"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
    echo "❌ 필수 환경 변수 누락: $var"
  else
    echo "✅ $var 설정됨"
  fi
done

# 자동화 기능 설정 확인
echo ""
echo "=== 자동화 기능 설정 ==="

AUTO_VARS=(
  "AUTO_MONITORING_ENABLED"
  "AUTO_MARKETING_ENABLED"
  "AUTO_SUPPORT_ENABLED"
  "AUTO_AFFILIATE_ENABLED"
)

for var in "${AUTO_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  $var 미설정 (기본값: true 사용)"
  else
    echo "✅ $var = ${!var}"
  fi
done

# 모니터링 설정 확인
echo ""
echo "=== 모니터링 설정 ==="

if [ -z "$MONITORING_ALERT_EMAIL" ]; then
  echo "⚠️  MONITORING_ALERT_EMAIL 미설정 (알림 비활성화)"
else
  echo "✅ MONITORING_ALERT_EMAIL = $MONITORING_ALERT_EMAIL"
fi

# 마케팅 설정 확인
echo ""
echo "=== 마케팅 설정 ==="

if [ -z "$MARKETING_SNS_ENABLED" ]; then
  echo "⚠️  MARKETING_SNS_ENABLED 미설정 (기본값: true)"
else
  echo "✅ MARKETING_SNS_ENABLED = $MARKETING_SNS_ENABLED"
fi

# 결과
echo ""
if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  echo "=== ✅ 검증 완료: 모든 필수 변수 설정됨 ==="
  exit 0
else
  echo "=== ❌ 검증 실패: 필수 변수 누락 ==="
  echo "누락된 변수: ${MISSING_VARS[*]}"
  exit 1
fi

