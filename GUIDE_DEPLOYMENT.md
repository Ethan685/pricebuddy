# 🚀 Deployment Guide for PriceBuddy

Since the AI agent cannot access your system's secure login flow, you need to run the following steps manually in your terminal.

## 1. Install Google Cloud SDK (if missing)

**Mac (via Homebrew):**
```bash
brew install --cask google-cloud-sdk
```

**Verify:**
```bash
gcloud --version
```

## 2. Authenticate Google Cloud

This will open a browser window to log in.
```bash
gcloud init
```
*   Select your Google Account.
*   Select the project (or create one).

## 3. Install & Authenticate Firebase

**Install:**
(If you see "permission denied" or EACCES error, use sudo)
```bash
sudo npm install -g firebase-tools
```

**Login:**
```bash
firebase login
```

## 4. Run the Deployment Script

Once authenticated, run the script I prepared:

```bash
cd /Users/ethanpark/.gemini/antigravity/scratch/pricebuddy
chmod +x deploy_prod.sh
./deploy_prod.sh
```

---

## 🛑 If you encounter permission errors
If `deploy_prod.sh` fails with "Access Denied" or 403:
1.  Go to [Google Cloud Console](https://console.cloud.google.com/run).
2.  Ensure Cloud Run API is enabled.
3.  Ensure your user has "Cloud Run Admin" and "Service Account User" roles.
