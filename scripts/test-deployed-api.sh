#!/bin/bash
# 배포된 Firebase Functions API 테스트 스크립트

set -e

API_BASE_URL="${API_BASE_URL:-https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api}"

echo "🚀 PriceBuddy API 테스트 시작"
echo "API Base URL: $API_BASE_URL"
echo ""

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 함수
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "${YELLOW}=== $name ===${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE_URL$endpoint" \
            -H "Content-Type: application/json" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ 성공 (HTTP $http_code)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body" | head -10
    else
        echo -e "${RED}❌ 실패 (HTTP $http_code)${NC}"
        echo "$body" | head -10
    fi
    echo ""
}

# 1. Health Check
test_endpoint "1. Health Check" "GET" "/health" ""

# 2. 모니터링 - Health Check
test_endpoint "2. 모니터링 - Health Check" "GET" "/monitoring/health-check" ""

# 3. 모니터링 - 에러 통계
test_endpoint "3. 모니터링 - 에러 통계" "GET" "/monitoring/error-stats" ""

# 4. 자동 마케팅 - 콘텐츠 생성
test_endpoint "4. 자동 마케팅 - 콘텐츠 생성" "POST" "/auto-marketing/generate-content" '{
    "type": "blog",
    "topic": "가격 비교 앱 사용법",
    "targetAudience": "온라인 쇼핑 이용자"
}'

# 5. 자동 고객 지원 - 쿼리 처리
test_endpoint "5. 자동 고객 지원 - 쿼리 처리" "POST" "/auto-support/handle-query" '{
    "query": "캐시백은 어떻게 받나요?",
    "userId": "test-user-123"
}'

# 6. 자동 고객 지원 - FAQ
test_endpoint "6. 자동 고객 지원 - FAQ" "GET" "/auto-support/faq" ""

# 7. 검색 API
test_endpoint "7. 검색 API" "GET" "/search?q=아이폰" ""

# 8. 자동 제휴 - API 키 검증
test_endpoint "8. 자동 제휴 - API 키 검증" "POST" "/auto-affiliate/validate-keys" '{
    "marketplace": "coupang",
    "apiKey": "test-key"
}'

echo -e "${GREEN}✅ 모든 테스트 완료!${NC}"

