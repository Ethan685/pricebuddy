# 자동화 API 사용 가이드

**작성일**: 2024-12-12  
**목적**: 자동화 기능 API 엔드포인트 사용법 및 테스트 가이드

---

## 📋 자동화 API 개요

PriceBuddy의 자동화 시스템은 다음 4가지 주요 기능을 제공합니다:

1. **자동 모니터링** (`/monitoring`)
2. **자동 마케팅** (`/auto-marketing`)
3. **자동 고객 지원** (`/auto-support`)
4. **자동 제휴 관리** (`/auto-affiliate`)

---

## 🔍 1. 자동 모니터링 API

### 1.1 스크래퍼 오류 기록

**엔드포인트:** `POST /monitoring/scraper-error`

**요청:**
```json
{
  "marketplace": "coupang",
  "url": "https://www.coupang.com/vp/products/123456",
  "error": "Selector not found",
  "retryCount": 0
}
```

**응답:**
```json
{
  "success": true,
  "errorId": "error-doc-id"
}
```

**기능:**
- 스크래퍼 오류를 자동으로 기록
- 자동 재시도 (최대 3회)
- 오류 해결 시 자동 업데이트

---

### 1.2 스크래퍼 건강 상태 확인

**엔드포인트:** `GET /monitoring/scraper-health`

**응답:**
```json
{
  "totalErrors": 5,
  "pendingErrors": 2,
  "failedErrors": 1,
  "marketplaceErrors": {
    "coupang": 3,
    "naver": 2
  },
  "health": "healthy"
}
```

**상태 값:**
- `healthy`: 오류 10개 미만
- `warning`: 오류 10-50개
- `critical`: 오류 50개 이상

---

### 1.3 셀렉터 업데이트 감지

**엔드포인트:** `POST /monitoring/selector-update`

**요청:**
```json
{
  "marketplace": "coupang",
  "url": "https://www.coupang.com/vp/products/123456",
  "oldSelectors": {
    "title": ".product-title",
    "price": ".price"
  },
  "newSelectors": {
    "title": ".new-product-title",
    "price": ".new-price"
  }
}
```

**기능:**
- 마켓플레이스 구조 변경 감지
- 새 셀렉터 자동 테스트
- 성공 시 자동 업데이트 제안

---

## 📢 2. 자동 마케팅 API

### 2.1 콘텐츠 생성

**엔드포인트:** `POST /auto-marketing/generate-content`

**요청:**
```json
{
  "type": "blog",
  "topic": "아이폰 15 최저가",
  "productId": "product-id-123" // 선택
}
```

**타입:**
- `blog`: 블로그 포스트
- `sns`: SNS 포스트
- `seo`: SEO 메타데이터

**응답:**
```json
{
  "success": true,
  "contentId": "content-doc-id",
  "content": "# 아이폰 15 최저가 비교 가이드\n\n..."
}
```

---

### 2.2 SNS 포스팅 스케줄링

**엔드포인트:** `POST /auto-marketing/schedule-post`

**요청:**
```json
{
  "contentId": "content-doc-id",
  "platforms": ["twitter", "facebook", "instagram"],
  "scheduledAt": "2024-12-13T10:00:00Z"
}
```

**응답:**
```json
{
  "success": true,
  "scheduleId": "schedule-doc-id"
}
```

---

### 2.3 SEO 키워드 추천

**엔드포인트:** `GET /auto-marketing/seo-keywords?productId=product-id`

**응답:**
```json
{
  "keywords": [
    "아이폰 15 최저가",
    "아이폰 15 가격 비교",
    "아이폰 15 구매 가이드"
  ]
}
```

---

## 💬 3. 자동 고객 지원 API

### 3.1 챗봇 응답

**엔드포인트:** `POST /auto-support/chat`

**요청:**
```json
{
  "message": "캐시백은 어떻게 받나요?",
  "userId": "user-id-123"
}
```

**응답:**
```json
{
  "answer": "PriceBuddy에서 생성된 제휴 링크를 통해 구매하시면 자동으로 캐시백이 Wallet에 적립됩니다...",
  "source": "auto",
  "needsHuman": false
}
```

**필드 설명:**
- `answer`: 챗봇 응답
- `source`: 응답 소스 (`auto` 또는 `human`)
- `needsHuman`: 사람의 도움이 필요한지 여부

---

### 3.2 FAQ 목록

**엔드포인트:** `GET /auto-support/faq`

**응답:**
```json
{
  "faqs": [
    {
      "question": "캐시백은 어떻게 받나요?",
      "answer": "PriceBuddy에서 생성된 제휴 링크를 통해 구매하시면..."
    },
    {
      "question": "가격 알림은 어떻게 설정하나요?",
      "answer": "상품 상세 페이지에서 '가격 알림 설정' 버튼을 클릭하고..."
    }
  ]
}
```

---

### 3.3 자동 문제 해결

**엔드포인트:** `POST /auto-support/auto-resolve`

**요청:**
```json
{
  "issueType": "cashback_not_received",
  "issueData": {
    "orderId": "order-123",
    "purchaseAmount": 100000,
    "marketplace": "coupang"
  },
  "userId": "user-id-123"
}
```

**문제 타입:**
- `cashback_not_received`: 캐시백 미수령
- `price_wrong`: 가격 오류
- `link_not_working`: 링크 작동 안 함

**응답:**
```json
{
  "resolved": true,
  "resolution": "캐시백이 자동으로 적립되었습니다."
}
```

---

## 🤖 4. 자동 제휴 관리 API

### 4.1 API 키 상태 확인

**엔드포인트:** `POST /auto-affiliate/check-keys`

**응답:**
```json
{
  "keyStatus": {
    "coupang": {
      "hasKey": true,
      "isValid": true,
      "lastChecked": "2024-12-12T10:00:00Z"
    },
    "naver": {
      "hasKey": true,
      "isValid": false,
      "lastChecked": "2024-12-12T10:00:00Z"
    }
  }
}
```

---

### 4.2 자동 정산 처리

**엔드포인트:** `POST /auto-affiliate/auto-settle`

**요청:**
```json
{
  "period": "monthly" // 또는 "weekly"
}
```

**응답:**
```json
{
  "success": true,
  "stats": {
    "totalLinks": 1000,
    "totalClicks": 5000,
    "totalConversions": 200,
    "totalRevenue": 10000000
  }
}
```

---

### 4.3 대량 제휴 링크 생성

**엔드포인트:** `POST /auto-affiliate/auto-generate-links`

**요청:**
```json
{
  "productIds": ["product-1", "product-2", "product-3"],
  "userId": "user-id-123"
}
```

**응답:**
```json
{
  "success": true,
  "generatedLinks": [
    {
      "productId": "product-1",
      "marketplace": "coupang",
      "linkId": "link-doc-id",
      "affiliateLink": "https://coupa.ng/..."
    }
  ]
}
```

---

## 🧪 테스트 방법

### 로컬 테스트

1. **Firebase Emulators 시작:**
   ```bash
   firebase emulators:start
   ```

2. **API 테스트 스크립트 실행:**
   ```bash
   API_BASE_URL=http://localhost:5001/your-project-id/api \
     ./scripts/test-automation.sh
   ```

3. **개별 엔드포인트 테스트:**
   ```bash
   curl -X POST http://localhost:5001/your-project-id/api/monitoring/scraper-error \
     -H "Content-Type: application/json" \
     -d '{"marketplace": "coupang", "url": "https://...", "error": "test"}'
   ```

---

### 프로덕션 테스트

1. **API Base URL 확인:**
   ```bash
   # Firebase Functions URL
   https://asia-northeast3-your-project.cloudfunctions.net/api
   ```

2. **인증 토큰 설정 (필요한 경우):**
   ```bash
   curl -X POST https://.../api/monitoring/scraper-error \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{...}'
   ```

---

## 📊 모니터링

### 로그 확인

**Firebase Functions 로그:**
```bash
firebase functions:log
```

**특정 함수 로그:**
```bash
firebase functions:log --only api
```

**Cloud Run 로그:**
```bash
gcloud run services logs read SERVICE_NAME --region asia-northeast3
```

---

### 메트릭 확인

**Firebase Console:**
- Functions > 사용량
- Functions > 로그
- Firestore > 사용량

**Google Cloud Console:**
- Cloud Run > 서비스
- Cloud Run > 메트릭

---

## 🔧 문제 해결

### 일반적인 오류

#### 1. 404 Not Found
**원인:** 엔드포인트 경로 오류
**해결:** API Base URL 확인

#### 2. 500 Internal Server Error
**원인:** 서버 내부 오류
**해결:** 로그 확인 및 환경 변수 확인

#### 3. 401 Unauthorized
**원인:** 인증 토큰 누락 또는 만료
**해결:** 인증 토큰 확인

---

## 📚 참고 문서

- [AUTOMATION_FEATURES.md](./AUTOMATION_FEATURES.md) - 자동화 기능 상세 설명
- [ENV_TEMPLATE.md](./docs/ENV_TEMPLATE.md) - 환경 변수 템플릿
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 배포 체크리스트

---

**자동화 API를 활용하여 운영 비용을 절감하세요!** 🚀

