# 배포 상태

**프로젝트**: pricebuddy-5a869  
**배포 일시**: 2024-12-12

---

## ✅ 완료된 배포

### 1. Firestore 보안 규칙
- **상태**: ✅ 배포 완료
- **파일**: `services/api/firestore.rules`
- **확인**: https://console.firebase.google.com/project/pricebuddy-5a869/firestore/rules

### 2. Firestore 인덱스
- **상태**: ✅ 배포 완료
- **파일**: `services/api/firestore.indexes.json`
- **확인**: https://console.firebase.google.com/project/pricebuddy-5a869/firestore/indexes

---

## ⚠️ 대기 중인 배포

### Functions 배포
- **상태**: ⏳ Blaze 플랜 업그레이드 필요
- **오류**: `Your project pricebuddy-5a869 must be on the Blaze (pay-as-you-go) plan`
- **해결 방법**: Firebase Console에서 Blaze 플랜으로 업그레이드

**업그레이드 링크:**
https://console.firebase.google.com/project/pricebuddy-5a869/usage/details

---

## 🚀 업그레이드 후 배포 방법

### 1. Blaze 플랜 업그레이드
1. 위 링크로 이동
2. "업그레이드" 버튼 클릭
3. 결제 정보 입력 (무료 할당량 내에서는 비용 없음)

### 2. Functions 배포
```bash
cd services/api
firebase deploy --only functions
```

배포되는 Functions:
- `api`: 메인 HTTP API (자동화 기능 포함)
- `updateProductPrices`: 가격 업데이트 스케줄러
- `autoUpdateScrapers`: 스크래퍼 자동 업데이트 스케줄러

---

## 📊 배포 후 확인

### Functions 확인
- **Console**: https://console.firebase.google.com/project/pricebuddy-5a869/functions
- **API 엔드포인트**: `https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api`

### 자동화 API 테스트
```bash
# 프로덕션 API 테스트
API_BASE_URL=https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api \
  ./scripts/test-automation.sh
```

---

## 💡 Blaze 플랜 정보

### 무료 할당량 (매월)
- **Functions 호출**: 200만 회
- **Functions 실행 시간**: 400,000 GB-초
- **Firestore 읽기**: 50,000회/일
- **Firestore 쓰기**: 20,000회/일
- **Storage**: 5GB

### 초기 단계에서는 무료 할당량으로 충분합니다!

---

## 📋 다음 단계

1. **Blaze 플랜 업그레이드** (필수)
   - https://console.firebase.google.com/project/pricebuddy-5a869/usage/details

2. **Functions 배포**
   ```bash
   cd services/api
   firebase deploy --only functions
   ```

3. **배포 확인**
   - Functions Console에서 확인
   - API 엔드포인트 테스트

4. **환경 변수 설정** (선택)
   ```bash
   firebase functions:config:set \
     web_app.url="https://pricebuddy-5a869.web.app"
   ```

---

**Firestore 배포는 완료되었습니다! Blaze 플랜 업그레이드 후 Functions를 배포하세요.** 🚀
