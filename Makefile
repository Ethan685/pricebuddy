.PHONY: install dev build test clean

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

clean:
	rm -rf node_modules
	rm -rf */node_modules
	rm -rf */*/node_modules
	rm -rf dist build lib

# 개별 서비스 실행
dev-web:
	cd apps/web_app && pnpm dev

dev-api:
	cd services/api && pnpm serve

dev-scraper:
	cd services/scraper && pnpm dev

# Docker 빌드
docker-review:
	cd services/review && docker build -t pricebuddy-review .

docker-forecast:
	cd services/forecast && docker build -t pricebuddy-forecast .

docker-scraper:
	cd services/scraper && docker build -t pricebuddy-scraper .

