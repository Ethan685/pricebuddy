/**
 * GA (General Availability) 기준 단일 진입점
 * 모든 API는 /api/* 경로로 통합된 Express 앱을 통해 제공
 * 리전: asia-northeast3 (서울)
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import apiApp from "./api";

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

// 단일 Express API 엔트리 포인트
export const api = functions
  .region("asia-northeast3")
  .runWith({
    timeoutSeconds: 60,
    memory: "512MB",
  })
  .https.onRequest(apiApp);

// 기존 함수들은 하위 호환성을 위해 유지 (점진적 마이그레이션)
// TODO: 모든 기능을 /api/* 경로로 마이그레이션 후 제거
export { deals } from "./http/deals";
export { apiSearchProducts, apiGetProduct, apiGetPrices, apiCreateAlert, apiListAlerts, apiCreateShareLink } from "./api/rest";
