# Web App API 연동 상태

## 🔍 현재 문제

### 발견된 이슈
1. **Mock 데이터 사용**: 개발 모드에서만 mock 데이터를 사용하도록 설정되어 있었지만, 프로덕션 빌드에서도 확인 필요
2. **API URL 설정**: `.env.production`에 API URL이 설정되어 있지만, 빌드 시점에 제대로 포함되었는지 확인 필요
3. **일부 기능이 API 미연동**: Deals, Wishlist, Purchase History 등이 mock 데이터 사용

---

## ✅ 수정 완료

### 1. Search API
- ✅ Mock 데이터 사용 비활성화 (프로덕션)
- ✅ 실제 API 호출로 변경
- API: `GET /search?q={query}&region={region}`

### 2. Product Detail API
- ✅ Mock 데이터 사용 비활성화 (프로덕션)
- ✅ 실제 API 호출로 변경
- API: `GET /products/{productId}`

---

## 🚧 API 연동 필요

### 1. Deals 페이지
- **현재**: Mock 데이터 사용
- **필요**: `GET /deals` API 연동

### 2. Wishlist 페이지
- **현재**: Mock 데이터 사용
- **필요**: `GET /wishlist`, `POST /wishlist`, `DELETE /wishlist/{id}` API 연동

### 3. Purchase History 페이지
- **현재**: Mock 데이터 사용
- **필요**: `GET /purchases` API 연동

### 4. Wallet 페이지
- **현재**: Mock 데이터 사용
- **필요**: `GET /wallet/balance`, `GET /wallet/transactions` API 연동

### 5. Recommendations 페이지
- **현재**: Mock 데이터 사용
- **필요**: `GET /recommendations` API 연동

### 6. Comparison 페이지
- **현재**: Mock 데이터 사용
- **필요**: `GET /compare` API 연동

---

## 📋 다음 단계

1. **모든 페이지 API 연동**
   - 각 페이지의 mock 데이터를 실제 API 호출로 변경
   - API 엔드포인트 확인 및 연동

2. **환경 변수 확인**
   - 빌드 시점에 `VITE_API_BASE_URL`이 제대로 포함되었는지 확인
   - 프로덕션 빌드 테스트

3. **에러 처리**
   - API 호출 실패 시 적절한 에러 메시지 표시
   - 로딩 상태 표시

---

## 🔧 수정 방법

### 예시: Deals 페이지 API 연동

```typescript
// Before (Mock)
const [deals, setDeals] = useState(mockDeals);

// After (API)
const { data: deals, isLoading, error } = useQuery({
  queryKey: ["deals"],
  queryFn: () => httpGet("/deals"),
});
```

---

**현재 상태**: Search와 Product Detail은 실제 API를 사용하도록 수정 완료. 나머지 페이지들도 연동 필요.

