FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --omit=dev

COPY tsconfig.json .
COPY src ./src

RUN npx tsc -p tsconfig.json

ENV PORT=8080

CMD ["node", "dist/index.js"]

