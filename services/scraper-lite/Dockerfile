FROM mcr.microsoft.com/playwright:v1.50.0-jammy
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm i
COPY src ./src
RUN npm run build
EXPOSE 8080
CMD ["npm","run","start"]
