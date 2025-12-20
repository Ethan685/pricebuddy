#!/bin/bash
echo "=== PriceBuddy API E2E 테스트 ==="
echo ""

BASE_URL="http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api"

# 1. Health Check
echo "1. Health Check:"
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | jq -e '.ok' > /dev/null 2>&1; then
    echo "   ✅ Health OK"
else
    echo "   ❌ Health Failed: $HEALTH"
fi
echo ""

# 2. Deals API
echo "2. Deals API:"
DEALS=$(curl -s "$BASE_URL/deals?limit=2")
if echo "$DEALS" | jq -e '.ok' > /dev/null 2>&1; then
    COUNT=$(echo "$DEALS" | jq -r '.meta.count // 0')
    echo "   ✅ Deals OK (count: $COUNT)"
else
    echo "   ❌ Deals Failed: $DEALS"
fi
echo ""

# 3. Search API
echo "3. Search API:"
SEARCH=$(curl -s "$BASE_URL/search?query=iphone&limit=3")
if echo "$SEARCH" | jq -e '.ok' > /dev/null 2>&1; then
    RESULTS=$(echo "$SEARCH" | jq -r '.results | length // 0')
    echo "   ✅ Search OK (results: $RESULTS)"
else
    echo "   ❌ Search Failed: $SEARCH"
fi
echo ""

# 4. Products API
echo "4. Products API (GET):"
PRODUCTS=$(curl -s "$BASE_URL/products?limit=2")
if echo "$PRODUCTS" | jq -e '.ok' > /dev/null 2>&1; then
    echo "   ✅ Products OK"
else
    echo "   ❌ Products Failed: $PRODUCTS"
fi
echo ""

# 5. Match API (확장 프로그램용)
echo "5. Match API:"
MATCH=$(curl -s -X POST "$BASE_URL/match" \
  -H "Content-Type: application/json" \
  -d '{"title":"iPhone 15 Pro","currentPrice":1200000,"currency":"KRW"}')
if echo "$MATCH" | jq -e '.bestMatch or .matches' > /dev/null 2>&1; then
    echo "   ✅ Match OK"
else
    echo "   ⚠️  Match (may return empty): $MATCH"
fi
echo ""

echo "=== 테스트 완료 ==="
