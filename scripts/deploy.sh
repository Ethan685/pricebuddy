#!/bin/bash

# PriceBuddy 배포 스크립트
# 사용법: ./scripts/deploy.sh [service]
# 예시: ./scripts/deploy.sh api
# 예시: ./scripts/deploy.sh all

set -e

PROJECT_ID=${FIREBASE_PROJECT_ID:-"your-project-id"}
REGION=${FIREBASE_REGION:-"asia-northeast3"}

# 색상 출력
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 변수 확인
check_env() {
    if [ "$PROJECT_ID" = "your-project-id" ]; then
        log_error "FIREBASE_PROJECT_ID 환경 변수를 설정해주세요."
        exit 1
    fi
    log_info "프로젝트 ID: $PROJECT_ID"
    log_info "리전: $REGION"
}

# Firebase Functions 배포
deploy_api() {
    log_info "Firebase Functions 배포 시작..."
    cd services/api
    
    # Firebase 프로젝트 설정
    firebase use $PROJECT_ID || firebase projects:list
    
    # 빌드
    log_info "빌드 중..."
    npm run build
    
    # 배포
    log_info "배포 중..."
    firebase deploy --only functions --project $PROJECT_ID
    
    cd ../..
    log_info "Firebase Functions 배포 완료!"
}

# Cloud Run 서비스 배포
deploy_scraper() {
    log_info "Scraper 서비스 배포 시작..."
    cd services/scraper
    
    # Docker 이미지 빌드
    log_info "Docker 이미지 빌드 중..."
    docker build -t gcr.io/$PROJECT_ID/pricebuddy-scraper:latest .
    
    # 이미지 푸시
    log_info "이미지 푸시 중..."
    docker push gcr.io/$PROJECT_ID/pricebuddy-scraper:latest
    
    # Cloud Run 배포
    log_info "Cloud Run 배포 중..."
    gcloud run deploy pricebuddy-scraper \
        --image gcr.io/$PROJECT_ID/pricebuddy-scraper:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --project $PROJECT_ID
    
    cd ../..
    log_info "Scraper 서비스 배포 완료!"
}

deploy_review() {
    log_info "Review 서비스 배포 시작..."
    cd services/review
    
    # Docker 이미지 빌드
    log_info "Docker 이미지 빌드 중..."
    docker build -t gcr.io/$PROJECT_ID/pricebuddy-review:latest .
    
    # 이미지 푸시
    log_info "이미지 푸시 중..."
    docker push gcr.io/$PROJECT_ID/pricebuddy-review:latest
    
    # Cloud Run 배포
    log_info "Cloud Run 배포 중..."
    gcloud run deploy pricebuddy-review \
        --image gcr.io/$PROJECT_ID/pricebuddy-review:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --project $PROJECT_ID
    
    cd ../..
    log_info "Review 서비스 배포 완료!"
}

deploy_forecast() {
    log_info "Forecast 서비스 배포 시작..."
    cd services/forecast
    
    # Docker 이미지 빌드
    log_info "Docker 이미지 빌드 중..."
    docker build -t gcr.io/$PROJECT_ID/pricebuddy-forecast:latest .
    
    # 이미지 푸시
    log_info "이미지 푸시 중..."
    docker push gcr.io/$PROJECT_ID/pricebuddy-forecast:latest
    
    # Cloud Run 배포
    log_info "Cloud Run 배포 중..."
    gcloud run deploy pricebuddy-forecast \
        --image gcr.io/$PROJECT_ID/pricebuddy-forecast:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --memory 1Gi \
        --cpu 1 \
        --project $PROJECT_ID
    
    cd ../..
    log_info "Forecast 서비스 배포 완료!"
}

# Web App 배포
deploy_web() {
    log_info "Web App 배포 시작..."
    cd apps/web_app
    
    # 빌드
    log_info "빌드 중..."
    pnpm build
    
    # Vercel 배포 (선택)
    if command -v vercel &> /dev/null; then
        log_info "Vercel 배포 중..."
        vercel deploy --prod
    else
        log_warn "Vercel CLI가 설치되지 않았습니다. 수동으로 배포해주세요."
    fi
    
    cd ../..
    log_info "Web App 배포 완료!"
}

# Firestore 인덱스 배포
deploy_indexes() {
    log_info "Firestore 인덱스 배포 중..."
    cd services/api
    firebase deploy --only firestore:indexes --project $PROJECT_ID
    cd ../..
    log_info "Firestore 인덱스 배포 완료!"
}

# Firestore 보안 규칙 배포
deploy_rules() {
    log_info "Firestore 보안 규칙 배포 중..."
    cd services/api
    firebase deploy --only firestore:rules --project $PROJECT_ID
    cd ../..
    log_info "Firestore 보안 규칙 배포 완료!"
}

# 메인 함수
main() {
    check_env
    
    case "$1" in
        api)
            deploy_api
            ;;
        scraper)
            deploy_scraper
            ;;
        review)
            deploy_review
            ;;
        forecast)
            deploy_forecast
            ;;
        web)
            deploy_web
            ;;
        indexes)
            deploy_indexes
            ;;
        rules)
            deploy_rules
            ;;
        all)
            log_info "전체 서비스 배포 시작..."
            deploy_scraper
            deploy_review
            deploy_forecast
            deploy_api
            deploy_indexes
            deploy_rules
            deploy_web
            log_info "전체 배포 완료!"
            ;;
        *)
            echo "사용법: $0 [api|scraper|review|forecast|web|indexes|rules|all]"
            echo ""
            echo "예시:"
            echo "  $0 api          # Firebase Functions만 배포"
            echo "  $0 scraper      # Scraper 서비스만 배포"
            echo "  $0 all          # 모든 서비스 배포"
            exit 1
            ;;
    esac
}

main "$@"

