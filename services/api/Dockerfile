# Use Node 20
FROM node:20-slim

WORKDIR /app

# Install PNPM (or use NPM workspaces)
# Since user uses NPM, we use NPM workspaces.

# 1. Copy Manifests for Dependency Installation
COPY package.json package-lock.json ./
COPY libs/core/package.json ./libs/core/
COPY libs/infra/package.json ./libs/infra/
COPY services/pricing/package.json ./services/pricing/
COPY services/scraper/package.json ./services/scraper/
COPY services/matcher/package.json ./services/matcher/
COPY services/forecast/package.json ./services/forecast/
COPY services/review/package.json ./services/review/
COPY services/promo/package.json ./services/promo/
COPY services/api/package.json ./services/api/

# 2. Install Dependencies (from root to link workspaces)
# We use --omit=dev for production, but we need devDeps to build TS.
# Strategy: Install all, Build, Prune.
RUN npm install

# 3. Copy Source Code
COPY libs ./libs
COPY services ./services

# 4. Build Libraries & Services
# Build dependencies first
WORKDIR /app/libs/core
RUN npm run build
WORKDIR /app/services/pricing
RUN npm run build
WORKDIR /app/services/scraper
RUN npm run build
# (Add other services if they have build steps)

# 5. Build API
WORKDIR /app/services/api
RUN npm run build

# 6. Runtime
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start API
CMD ["npm", "run", "start"]
