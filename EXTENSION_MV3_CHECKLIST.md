# 확장 프로그램 MV3 안정화 체크리스트

**작성일**: 2025-12-20  
**목적**: Manifest V3 호환성 및 안정성 검증

## ✅ 완료된 항목

### 1. Manifest V3 구조
- [x] `manifest_version: 3` 설정
- [x] Service Worker 사용 (`background.service_worker`)
- [x] `host_permissions` 분리 (MV3 요구사항)
- [x] `action` API 사용 (MV2의 `browser_action` 대체)

### 2. API 통신
- [x] GA 구조로 API 엔드포인트 업데이트
- [x] `asia-northeast3` 리전 사용
- [x] 개발/프로덕션 환경 자동 감지
- [x] Match API 통합

### 3. 권한 설정
- [x] `storage` 권한 (데이터 저장)
- [x] `activeTab` 권한 (현재 탭 접근)
- [x] `scripting` 권한 (스크립트 주입)
- [x] `alarms` 권한 (스케줄링)
- [x] `host_permissions` (특정 도메인 접근)

## 🔍 검증 필요 항목

### 1. Service Worker 생명주기
- [ ] Service Worker가 정상적으로 활성화되는지 확인
- [ ] 메시지 리스너가 올바르게 등록되는지 확인
- [ ] 비활성화 후 재활성화 시 상태 복원 확인

### 2. 메시지 전달
- [ ] `content.js` → `background.js` 메시지 전달
- [ ] 비동기 응답 처리 (`return true` 사용)
- [ ] 에러 처리 및 폴백 로직

### 3. Storage API
- [ ] `chrome.storage.local` 사용 확인 (필요시)
- [ ] 데이터 영속성 확인

### 4. Content Script
- [ ] Shadow DOM 사용 (스타일 격리)
- [ ] DOM 조작 안전성
- [ ] 메모리 누수 방지

### 5. 에러 처리
- [ ] 네트워크 오류 처리
- [ ] API 실패 시 폴백 (데모 모드)
- [ ] 사용자 친화적 에러 메시지

## 🐛 알려진 이슈

### 현재 상태
- ✅ API 통신 구조 업데이트 완료
- ✅ Match API 통합 완료
- ⚠️ 실제 테스트 필요 (Chrome 확장 프로그램 로드)

## 📝 테스트 시나리오

### 1. 기본 설치 및 활성화
```
1. Chrome에서 확장 프로그램 로드
2. manifest.json 파싱 확인
3. Service Worker 활성화 확인
4. 콘솔 에러 확인
```

### 2. 상품 페이지 테스트
```
1. Amazon 상품 페이지 방문
2. Content Script 실행 확인
3. 상품 정보 추출 확인
4. Background로 메시지 전송 확인
5. API 호출 확인
6. 팝업 표시 확인
```

### 3. API 통신 테스트
```
1. Match API 호출
2. 응답 처리 확인
3. 에러 케이스 테스트 (네트워크 오류)
4. 폴백 모드 동작 확인
```

### 4. 크로스 도메인 테스트
```
1. Amazon.com
2. Coupang.com
3. Naver.com
```

## 🔧 개선 사항

### 완료
- ✅ GA 구조로 API 엔드포인트 통합
- ✅ 환경 자동 감지 (개발/프로덕션)
- ✅ Match API 전용 엔드포인트 사용

### 예정
- [ ] Service Worker 상태 관리 개선
- [ ] 캐싱 전략 추가
- [ ] 오프라인 모드 개선
- [ ] 성능 모니터링 추가

## 📊 호환성

- ✅ Chrome 88+ (MV3 지원)
- ✅ Edge 88+ (Chromium 기반)
- ⚠️ Firefox (MV2만 지원, 별도 빌드 필요)
- ❌ Safari (WebExtensions API 제한적)

---

**다음 단계**: 실제 Chrome 확장 프로그램으로 로드하여 테스트
