#!/bin/bash
set -e

echo "🚀 Starting Production Deployment..."

# 0. Config
REGION="asia-northeast3" 
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="pricebuddy-api"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: No GCP Project configured. Run 'gcloud init' or set project."
  exit 1
fi

echo "🔹 Using Project: $PROJECT_ID"

# 1. Deploy API to Cloud Run
echo "📦 Building & Deploying API Service..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production

# Get Cloud Run URL
API_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
echo "✅ API Deployed at: $API_URL"

# 2. Build Frontend with API URL
echo "🏗 Building Web App..."
export VITE_API_BASE_URL=$API_URL
cd web_app
npm install
npm run build
cd ..

# 3. Deploy Hosting
echo "🌍 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "🎉 Deployment Complete!"
echo "👉 Frontend: $(firebase hosting:site --json | jq -r '.[0].defaultUrl')"
echo "👉 Backend: $API_URL"
