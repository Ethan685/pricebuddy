# 에뮬레이터 재시작 가이드

**작성일**: 2025-12-20  
**목적**: GA 구조 변경 후 에뮬레이터 재시작 필요

## 🔄 재시작 필요 이유

GA 구조로 통합된 Express API (`/api/*`)를 사용하려면 에뮬레이터가 새로 빌드된 함수를 로드해야 합니다.

## 📋 재시작 절차

### 1. 현재 에뮬레이터 종료

터미널에서 실행 중인 에뮬레이터를 찾아 종료:

```bash
# 에뮬레이터 프로세스 확인
ps aux | grep "firebase.*emulator"

# 프로세스 종료 (PID 확인 후)
kill <PID>
```

또는 에뮬레이터가 실행 중인 터미널에서 `Ctrl+C`로 종료

### 2. Functions 빌드 확인

```bash
cd functions
npm run build
```

빌드가 성공했는지 확인 (에러가 없어야 함)

### 3. 에뮬레이터 재시작

```bash
# 프로젝트 루트에서
firebase emulators:start --only functions,firestore
```

### 4. 함수 로드 확인

에뮬레이터가 시작되면 다음 메시지가 표시되어야 합니다:

```
✔  functions[asia-northeast3-api]: http function initialized (http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api).
```

### 5. Health API 테스트

```bash
curl http://127.0.0.1:5001/pricebuddy-5a869/asia-northeast3/api/health
```

예상 응답:
```json
{"ok":true,"region":"asia-northeast3","timestamp":"..."}
```

## ✅ 확인 사항

- [ ] Functions 빌드 성공
- [ ] 에뮬레이터 시작 성공
- [ ] `asia-northeast3-api` 함수 로드 확인
- [ ] Health API 응답 확인

## 🐛 문제 해결

### 함수가 로드되지 않는 경우

1. **빌드 확인**: `functions/lib/` 디렉토리에 파일이 있는지 확인
2. **에러 로그 확인**: 에뮬레이터 콘솔에서 에러 메시지 확인
3. **캐시 클리어**: `functions/lib/` 디렉토리 삭제 후 재빌드

```bash
rm -rf functions/lib
cd functions
npm run build
```

### "Function does not exist" 에러

- 에뮬레이터가 이전 빌드를 사용하고 있을 수 있음
- 완전히 종료 후 재시작 필요

---

**참고**: 에뮬레이터는 코드 변경 시 자동으로 재로드되지 않으므로, Functions 코드를 변경한 후에는 수동으로 재시작해야 합니다.
