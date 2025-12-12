# PriceBuddy

Global price comparison & cashback platform

## 프로젝트 구조

```
pricebuddy/
├── libs/
│   ├── core/          # 도메인 모델 (Product, Offer, Pricing)
│   └── infra/         # Firebase/Firestore 설정
├── services/
│   ├── api/           # BFF (Firebase Functions)
│   ├── pricing/       # 가격 계산 엔진
│   ├── scraper/       # Playwright + cheerio 스크래핑
│   ├── review/        # FastAPI 리뷰 분석 서비스
│   └── forecast/      # FastAPI 가격 예측 서비스
└── apps/
    └── web_app/       # React 19 + Vite + TanStack Query
```

## 시작하기

### 1. 사전 요구사항

- Node.js 18+ (`.nvmrc` 참고)
- pnpm 8+
- Python 3.11+ (Review/Forecast 서비스용)
- Firebase CLI (API 서비스 배포용)
- Docker (마이크로서비스 배포용)

### 2. 의존성 설치

```bash
# 루트에서 모든 워크스페이스 의존성 설치
pnpm install

# 또는 Makefile 사용
make install
```

### 3. 환경 변수 설정

각 서비스의 `.env.example`을 참고하여 `.env` 파일 생성:

```bash
# Web App
cp apps/web_app/.env.example apps/web_app/.env

# API Service
cp services/api/.env.example services/api/.env
```

### 4. 개발 서버 실행

```bash
# 모든 서비스 동시 실행
pnpm dev

# 또는 개별 실행
make dev-web      # Web App만
make dev-api      # API 서비스만
make dev-scraper  # Scraper 서비스만
```

### 5. 빌드

```bash
# 전체 빌드
pnpm build

# 또는 Makefile 사용
make build
```

## 환경 변수

### Web App
- `VITE_API_BASE_URL`: API 서버 URL (기본값: http://localhost:5001)

### API Service
- `SCRAPER_BASE_URL`: Scraper 서비스 URL
- `REVIEW_BASE_URL`: Review 서비스 URL
- `FORECAST_BASE_URL`: Forecast 서비스 URL

## 배포

### Cloud Run (Review/Forecast/Scraper)

```bash
# Review 서비스
cd services/review
gcloud builds submit --tag gcr.io/$PROJECT_ID/pricebuddy-review:1
gcloud run deploy pricebuddy-review --image gcr.io/$PROJECT_ID/pricebuddy-review:1

# Forecast 서비스
cd services/forecast
gcloud builds submit --tag gcr.io/$PROJECT_ID/pricebuddy-forecast:1
gcloud run deploy pricebuddy-forecast --image gcr.io/$PROJECT_ID/pricebuddy-forecast:1
```

### Firebase Functions (API)

```bash
cd services/api
firebase deploy --only functions
```

## 기술 스택

- **Frontend**: React 19, Vite, Tailwind CSS, TanStack Query, Recharts
- **Backend**: Firebase Functions, Express
- **Database**: Firestore
- **Scraping**: Playwright, Cheerio
- **AI/ML**: Transformers (HuggingFace), Statsmodels (SARIMAX)
- **Infrastructure**: Cloud Run, Firebase
- **Package Manager**: pnpm (workspace)
- **Language**: TypeScript, Python 3.11

## 프로젝트 구조 상세

### libs/
- **core**: 공유 도메인 모델 및 타입 정의
- **infra**: Firebase/Firestore 초기화 및 유틸리티

### services/
- **api**: BFF (Backend for Frontend) - Firebase Functions 기반
- **pricing**: 가격 계산 엔진 (환율, 세금, 배송비)
- **scraper**: 웹 스크래핑 서비스 (Playwright + Cheerio)
- **review**: 리뷰 감성 분석 서비스 (FastAPI + HuggingFace)
- **forecast**: 가격 예측 서비스 (FastAPI + Statsmodels)

### apps/
- **web_app**: React 웹 애플리케이션

## 개발 가이드

자세한 내용은 [CONTRIBUTING.md](./CONTRIBUTING.md) 참고

