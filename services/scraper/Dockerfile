FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

# 필요한 패키지 직접 설치
RUN npm install -g typescript
RUN npm install cheerio@^1.0.0 fastify@^4.28.0 playwright@^1.48.0 axios@^1.6.0 @types/node@^20.0.0

# 소스 코드 복사
COPY package.json ./
COPY tsconfig.docker.json tsconfig.json
COPY src ./src

# 빌드
RUN npx tsc -p tsconfig.json

ENV PORT=8080

CMD ["node", "dist/index.js"]
