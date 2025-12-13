# Firebase API 키 설정 가이드

## 문제
Firebase API 키가 설정되지 않아 인증 오류가 발생합니다:
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## 해결 방법

### 방법 1: Firebase Console에서 설정 가져오기 (권장)

1. **Firebase Console 접속:**
   - https://console.firebase.google.com/project/pricebuddy-5a869/settings/general

2. **웹 앱 추가/확인:**
   - "내 앱" 섹션에서 웹 앱이 있는지 확인
   - 없으면 "웹 앱 추가" 버튼 클릭 (</> 아이콘)
   - 앱 닉네임 입력 후 등록

3. **설정 정보 복사:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "pricebuddy-5a869.firebaseapp.com",
     projectId: "pricebuddy-5a869",
     storageBucket: "pricebuddy-5a869.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

4. **환경 변수 파일 생성:**
   ```bash
   cd apps/web_app
   cat > .env << 'ENVEOF'
   VITE_FIREBASE_API_KEY=AIzaSy...  # 위에서 복사한 apiKey
   VITE_FIREBASE_AUTH_DOMAIN=pricebuddy-5a869.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=pricebuddy-5a869
   VITE_FIREBASE_STORAGE_BUCKET=pricebuddy-5a869.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789  # 위에서 복사한 messagingSenderId
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef  # 위에서 복사한 appId
   VITE_API_BASE_URL=https://asia-northeast3-pricebuddy-5a869.cloudfunctions.net/api
   ENVEOF
   ```

5. **빌드 및 재배포:**
   ```bash
   cd apps/web_app
   npm run build
   cd ../..
   firebase deploy --only hosting
   ```

### 방법 2: Firebase CLI로 웹 앱 등록

```bash
firebase apps:create WEB --project pricebuddy-5a869
```

그 후 Firebase Console에서 설정을 확인하고 위의 방법 1을 따라하세요.

## 참고
- `.env` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함되어 있음)
- 프로덕션 환경에서는 Firebase Hosting의 환경 변수 기능을 사용할 수도 있습니다
