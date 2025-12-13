# Firebase Authentication 오류 해결 가이드

## 오류: `auth/configuration-not-found`

이 오류는 Firebase Authentication이 제대로 설정되지 않았을 때 발생합니다.

## 단계별 해결 방법

### 1단계: Firebase Authentication 활성화

1. **Firebase Console 접속:**
   ```
   https://console.firebase.google.com/project/pricebuddy-5a869/authentication
   ```

2. **Authentication 활성화:**
   - "시작하기" 또는 "Get started" 버튼 클릭
   - 첫 활성화 시 약간의 시간이 걸릴 수 있습니다

3. **Sign-in method 설정:**
   - "Sign-in method" 탭 클릭
   - "이메일/비밀번호" (Email/Password) 클릭
   - "사용 설정" (Enable) 토글을 켜기
   - "저장" (Save) 클릭

### 2단계: API 키 확인

1. **프로젝트 설정 확인:**
   ```
   https://console.firebase.google.com/project/pricebuddy-5a869/settings/general
   ```

2. **웹 앱 설정 확인:**
   - "내 앱" 섹션에서 웹 앱이 등록되어 있는지 확인
   - API 키가 올바른지 확인

### 3단계: Google Cloud Console에서 API 활성화

1. **Google Cloud Console 접속:**
   ```
   https://console.cloud.google.com/apis/library?project=pricebuddy-5a869
   ```

2. **필요한 API 활성화:**
   - "Identity Toolkit API" 검색 및 활성화
   - "Firebase Authentication API" 검색 및 활성화

### 4단계: 브라우저 캐시 삭제

1. **강력 새로고침:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **또는 개발자 도구에서:**
   - DevTools 열기 (F12)
   - Network 탭에서 "Disable cache" 체크
   - 페이지 새로고침

## 여전히 오류가 발생하는 경우

1. **Firebase 프로젝트 재확인:**
   - 프로젝트가 정상적으로 활성화되어 있는지 확인
   - Blaze 플랜이 활성화되어 있는지 확인

2. **환경 변수 재확인:**
   - `apps/web_app/.env` 파일이 올바른지 확인
   - 빌드를 다시 실행

3. **Firebase SDK 버전 확인:**
   - 최신 버전의 Firebase SDK 사용 확인

## 참고 링크

- Firebase Authentication 문서: https://firebase.google.com/docs/auth
- Firebase Console: https://console.firebase.google.com/project/pricebuddy-5a869
