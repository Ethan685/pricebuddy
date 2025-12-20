/**
 * GA (General Availability) 기준 단일 Express API
 * 모든 HTTP 엔드포인트는 /api/* 경로로 통합
 * 리전: asia-northeast3 (서울)
 */

import express from "express";
import cors from "cors";
import * as admin from "firebase-admin";

// Firebase Admin 초기화 (routes에서 사용하기 전에)
if (!admin.apps.length) {
  admin.initializeApp();
}

// 기존 API 핸들러들 import
import { getDealsHandler } from "./routes/deals";
import { searchProductsHandler } from "./routes/search";
import { getProductHandler } from "./routes/products";
import { createAlertHandler, getAlertsHandler, deleteAlertHandler } from "./routes/alerts";
import { getWishlistHandler, addToWishlistHandler, removeFromWishlistHandler } from "./routes/wishlist";
import { getWalletHandler, getWalletBalanceHandler, getWalletTransactionsHandler } from "./routes/wallet";
import { createCheckoutSessionHandler, stripeWebhookHandler, getSubscriptionHandler } from "./routes/payments";
import { getReferralCodeHandler, redeemReferralHandler } from "./routes/referrals";
import { getPriceHistoryHandler, recordPriceSnapshotHandler } from "./routes/price-tracking";
import { getFeedHandler } from "./routes/feed";
import { enterpriseApiHandler } from "./routes/enterprise";
import { matchSKUHandler } from "./routes/match";

const app = express();

// CORS 설정
app.use(
  cors({
    origin: (origin, callback) => {
      // 개발 환경에서는 모든 origin 허용
      const allowedOrigins = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        ...(process.env.ALLOWED_ORIGINS?.split(",") || []),
      ];
      
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Stripe webhook은 raw body 필요 (다른 라우트보다 먼저)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    region: "asia-northeast3",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// API Routes - /api/* 경로로 통합
const apiRouter = express.Router();

// Deals API
apiRouter.get("/deals", getDealsHandler);

// Search API
apiRouter.get("/search", searchProductsHandler);
apiRouter.post("/search", searchProductsHandler);

// Products API
apiRouter.get("/products/:productId", getProductHandler);

// Alerts API
apiRouter.get("/alerts", getAlertsHandler);
apiRouter.post("/alerts", createAlertHandler);
apiRouter.delete("/alerts/:alertId", deleteAlertHandler);

// Wishlist API
apiRouter.get("/wishlist", getWishlistHandler);
apiRouter.post("/wishlist", addToWishlistHandler);
apiRouter.delete("/wishlist/:productId", removeFromWishlistHandler);

// Wallet API
apiRouter.get("/wallet", getWalletHandler);
apiRouter.get("/wallet/balance", getWalletBalanceHandler);
apiRouter.get("/wallet/transactions", getWalletTransactionsHandler);

// Payments & Subscriptions API
apiRouter.post("/payments/checkout", createCheckoutSessionHandler);
apiRouter.post("/payments/webhook", stripeWebhookHandler); // Stripe webhook (raw body 필요)
apiRouter.get("/subscriptions", getSubscriptionHandler);

// Referrals API
apiRouter.get("/referrals/code", getReferralCodeHandler);
apiRouter.post("/referrals/code", getReferralCodeHandler);
apiRouter.post("/referrals/redeem", redeemReferralHandler);

// Price Tracking API
apiRouter.get("/price-tracking/products/:productId/history", getPriceHistoryHandler);
apiRouter.post("/price-tracking/snapshot", recordPriceSnapshotHandler);

// Feed API
apiRouter.get("/feed", getFeedHandler);

// Enterprise API (모든 /enterprise/* 경로 처리)
apiRouter.use("/enterprise", enterpriseApiHandler);

// Match API (확장 프로그램용)
apiRouter.post("/match", matchSKUHandler);

// Firebase Functions의 경로가 이미 /api이므로, Express 앱 내부에서는 prefix 없이 사용
app.use("/", apiRouter);

// 404 핸들러
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found", path: _req.path });
});

// 에러 핸들러
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

export default app;
