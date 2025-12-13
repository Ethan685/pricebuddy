#!/bin/bash
# 자동화 API 엔드포인트 테스트 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API 기본 URL (로컬 또는 프로덕션)
API_BASE_URL=${API_BASE_URL:-"http://localhost:5001/your-project-id/api"}

echo "=== 자동화 API 엔드포인트 테스트 ==="
echo "API Base URL: $API_BASE_URL"
echo ""

# 테스트 결과 추적
PASSED=0
FAILED=0

# 테스트 함수
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo -n "Testing $name... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL$endpoint" || echo -e "\n000")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$API_BASE_URL$endpoint" || echo -e "\n000")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    echo "  Response: $body"
    ((FAILED++))
    return 1
  fi
}

# 1. 모니터링 API 테스트
echo "=== 1. 모니터링 API ==="

# 1.1 스크래퍼 오류 기록
test_endpoint \
  "스크래퍼 오류 기록" \
  "POST" \
  "/monitoring/scraper-error" \
  '{"marketplace": "coupang", "url": "https://www.coupang.com/vp/products/test", "error": "Test error", "retryCount": 0}'

# 1.2 스크래퍼 건강 상태 확인
test_endpoint \
  "스크래퍼 건강 상태" \
  "GET" \
  "/monitoring/scraper-health"

echo ""

# 2. 자동 마케팅 API 테스트
echo "=== 2. 자동 마케팅 API ==="

# 2.1 콘텐츠 생성 (블로그)
test_endpoint \
  "블로그 콘텐츠 생성" \
  "POST" \
  "/auto-marketing/generate-content" \
  '{"type": "blog", "topic": "아이폰 15 최저가"}'

# 2.2 콘텐츠 생성 (SNS)
test_endpoint \
  "SNS 콘텐츠 생성" \
  "POST" \
  "/auto-marketing/generate-content" \
  '{"type": "sns", "topic": "아이폰 15 최저가"}'

# 2.3 SEO 콘텐츠 생성
test_endpoint \
  "SEO 콘텐츠 생성" \
  "POST" \
  "/auto-marketing/generate-content" \
  '{"type": "seo", "topic": "아이폰 15 최저가"}'

# 2.4 SEO 키워드 추천
test_endpoint \
  "SEO 키워드 추천" \
  "GET" \
  "/auto-marketing/seo-keywords?productId=test-product-id"

echo ""

# 3. 자동 고객 지원 API 테스트
echo "=== 3. 자동 고객 지원 API ==="

# 3.1 챗봇 응답
test_endpoint \
  "챗봇 응답" \
  "POST" \
  "/auto-support/chat" \
  '{"message": "캐시백은 어떻게 받나요?", "userId": "test-user-id"}'

# 3.2 FAQ 목록
test_endpoint \
  "FAQ 목록" \
  "GET" \
  "/auto-support/faq"

# 3.3 자동 문제 해결 (캐시백)
test_endpoint \
  "자동 문제 해결 (캐시백)" \
  "POST" \
  "/auto-support/auto-resolve" \
  '{"issueType": "cashback_not_received", "issueData": {"orderId": "test-order", "purchaseAmount": 100000, "marketplace": "coupang"}, "userId": "test-user-id"}'

echo ""

# 4. 자동 제휴 관리 API 테스트
echo "=== 4. 자동 제휴 관리 API ==="

# 4.1 API 키 상태 확인
test_endpoint \
  "API 키 상태 확인" \
  "POST" \
  "/auto-affiliate/check-keys"

# 4.2 자동 정산 처리
test_endpoint \
  "자동 정산 처리" \
  "POST" \
  "/auto-affiliate/auto-settle" \
  '{"period": "weekly"}'

echo ""

# 결과 요약
echo "=== 테스트 결과 요약 ==="
echo -e "${GREEN}통과: $PASSED${NC}"
echo -e "${RED}실패: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ 모든 테스트 통과!${NC}"
  exit 0
else
  echo -e "${RED}✗ 일부 테스트 실패${NC}"
  exit 1
fi

