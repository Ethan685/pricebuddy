# GitHub 백업 설정 가이드

## 현재 상태

✅ Git 저장소 초기화 완료
✅ 변경사항 커밋 완료

## GitHub에 백업하기

### 방법 1: 새 저장소 생성 후 푸시

1. GitHub에서 새 저장소 생성:
   - https://github.com/new 접속
   - 저장소 이름 입력 (예: `pricebuddy`)
   - Public 또는 Private 선택
   - "Create repository" 클릭

2. 원격 저장소 추가 및 푸시:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pricebuddy.git
   git branch -M main
   git push -u origin main
   ```

### 방법 2: 기존 저장소에 푸시

```bash
# 원격 저장소 확인
git remote -v

# 원격 저장소가 없다면 추가
git remote add origin https://github.com/YOUR_USERNAME/pricebuddy.git

# 푸시
git push -u origin main
```

### 방법 3: SSH 사용

```bash
git remote add origin git@github.com:YOUR_USERNAME/pricebuddy.git
git push -u origin main
```

## 현재 커밋된 내용

- ✅ Firebase 프로젝트 설정
- ✅ Firestore 보안 규칙 및 인덱스
- ✅ 배포 스크립트
- ✅ 가이드 문서
- ✅ 코드 개선사항
- ✅ 환경 변수 템플릿

## 주의사항

⚠️ `.env` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.
실제 환경 변수는 별도로 관리하세요.

## 다음 단계

1. GitHub 저장소 생성
2. 원격 저장소 추가
3. 코드 푸시
4. GitHub Actions 설정 (선택)
