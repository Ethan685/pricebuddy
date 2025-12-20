# E2E 테스트 시나리오

**작성일**: 2025-12-20  
**목적**: GA 구조로 통합된 API의 주요 플로우 검증

## 🧪 테스트 환경

- **Functions**: `http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api`
- **Web App**: `http://127.0.0.1:5173`
- **Firestore**: `http://127.0.0.1:8080`

## 📋 테스트 시나리오

### 1. 기본 API 테스트

#### 1.1 Health Check
```bash
curl http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api/health
```
**예상 결과**: `{"ok":true,"region":"asia-northeast3",...}`

#### 1.2 Deals API
```bash
curl "http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api/deals?limit=5"
```
**예상 결과**: `{"ok":true,"deals":[...],"meta":{...}}`

#### 1.3 Search API
```bash
curl "http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api/search?query=iphone&region=KR"
```
**예상 결과**: `{"ok":true,"q":"iphone","region":"KR","results":[...]}`

### 2. 사용자 플로우 테스트

#### 2.1 검색 → 상품 상세 → 알림 설정
1. 검색 API 호출
2. 상품 ID로 상세 정보 조회
3. 가격 알림 생성 (인증 필요)

#### 2.2 위시리스트 플로우
1. 위시리스트 조회
2. 상품 추가
3. 위시리스트 재조회 (추가 확인)
4. 상품 제거

#### 2.3 지갑 플로우
1. 지갑 잔액 조회
2. 거래 내역 조회
3. 전체 지갑 정보 조회

### 3. 수익화 플로우 테스트

#### 3.1 구독 플로우
1. 구독 정보 조회
2. 결제 세션 생성 (Stripe)
3. 구독 정보 재조회

#### 3.2 추천인 플로우
1. 추천인 코드 생성
2. 추천인 코드 조회
3. 추천인 코드 사용 (다른 사용자)

### 4. 고급 기능 테스트

#### 4.1 가격 추적
1. 가격 스냅샷 기록
2. 가격 히스토리 조회
3. 통계 확인

#### 4.2 피드
1. 비로그인 피드 조회
2. 로그인 후 개인화 피드 조회

#### 4.3 Enterprise API
1. Enterprise API 키로 상품 목록 조회
2. 대량 데이터 조회

## ✅ 테스트 체크리스트

- [ ] Health API 정상 작동
- [ ] Deals API 정상 작동
- [ ] Search API 정상 작동
- [ ] Products API 정상 작동
- [ ] Alerts API (인증 포함)
- [ ] Wishlist API (인증 포함)
- [ ] Wallet API (인증 포함)
- [ ] Payments API (인증 포함)
- [ ] Referrals API (인증 포함)
- [ ] Price Tracking API
- [ ] Feed API
- [ ] Enterprise API

## 🔍 검증 포인트

1. **응답 형식**: 모든 API가 일관된 형식으로 응답
2. **에러 처리**: 적절한 HTTP 상태 코드 및 에러 메시지
3. **인증**: 인증이 필요한 엔드포인트에서 올바른 검증
4. **CORS**: 프론트엔드에서 호출 가능
5. **성능**: 응답 시간이 합리적

---

**참고**: 실제 테스트는 브라우저 개발자 도구나 Postman을 사용하여 진행하는 것을 권장합니다.
