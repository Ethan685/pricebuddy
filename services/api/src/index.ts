import * as functions from "firebase-functions";
import express from "express";
import { searchRouter } from "./routes/search";
import { productDetailRouter } from "./routes/product-detail";
import { extRouter } from "./routes/ext";
import { dealsRouter } from "./routes/deals";
import { walletRouter } from "./routes/wallet";
import { alertsRouter } from "./routes/alerts";
import { purchasesRouter } from "./routes/purchases";
import { cashbackRouter } from "./routes/cashback";
import { referralRouter } from "./routes/referral";
import { recommendationsRouter } from "./routes/recommendations";
import { paymentRouter } from "./routes/payment";
import { priceTrackingRouter } from "./routes/price-tracking";
import { monitoringRouter } from "./routes/monitoring";
import { autoMarketingRouter } from "./routes/auto-marketing";
import { autoSupportRouter } from "./routes/auto-support";
import { autoAffiliateRouter } from "./routes/auto-affiliate";
import { errorMiddleware } from "./middleware/error";
import { updateProductPrices } from "./routes/price-scheduler";

const app = express();

// CORS 설정 (수동 헤더 추가)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://pricebuddy-5a869.web.app",
    "https://pricebuddy-5a869.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// 루트 경로 핸들러
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "PriceBuddy API",
    version: "1.0.0",
    endpoints: {
      search: "/search",
      products: "/products",
      monitoring: "/monitoring",
      autoMarketing: "/auto-marketing",
      autoSupport: "/auto-support",
      autoAffiliate: "/auto-affiliate",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 라우팅
app.use("/search", searchRouter);
app.use("/products", productDetailRouter);
app.use("/ext", extRouter);
app.use("/deals", dealsRouter);
app.use("/wallet", walletRouter);
app.use("/alerts", alertsRouter);
app.use("/purchases", purchasesRouter);
app.use("/cashback", cashbackRouter);
app.use("/referral", referralRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/payment", paymentRouter);
app.use("/price-tracking", priceTrackingRouter);
app.use("/monitoring", monitoringRouter);
app.use("/auto-marketing", autoMarketingRouter);
app.use("/auto-support", autoSupportRouter);
app.use("/auto-affiliate", autoAffiliateRouter);

// 에러 핸들링
app.use(errorMiddleware);

export const api = functions
  .region("asia-northeast3")
  .https.onRequest(app);

// 스케줄러 함수들 export
export { updateProductPrices } from "./routes/price-scheduler";
export { autoUpdateScrapers } from "./routes/scraper-auto-update";
export { processScrapeJobs } from "./scheduled/processJobs";

// Notifications 서비스의 스케줄러는 별도로 export
// services/notifications/src/index.ts에서 직접 배포

