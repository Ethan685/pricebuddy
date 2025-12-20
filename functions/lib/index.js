"use strict";
/**
 * GA (General Availability) 기준 단일 진입점
 * 모든 API는 /api/* 경로로 통합된 Express 앱을 통해 제공
 * 리전: asia-northeast3 (서울)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCreateShareLink = exports.apiListAlerts = exports.apiCreateAlert = exports.apiGetPrices = exports.apiGetProduct = exports.apiSearchProducts = exports.deals = exports.api = void 0;
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const api_1 = __importDefault(require("./api"));
// Firebase Admin 초기화
if (!admin.apps.length) {
    admin.initializeApp();
}
// 단일 Express API 엔트리 포인트
exports.api = functions
    .region("asia-northeast3")
    .runWith({
    timeoutSeconds: 60,
    memory: "512MB",
})
    .https.onRequest(api_1.default);
// 기존 함수들은 하위 호환성을 위해 유지 (점진적 마이그레이션)
// TODO: 모든 기능을 /api/* 경로로 마이그레이션 후 제거
var deals_1 = require("./http/deals");
Object.defineProperty(exports, "deals", { enumerable: true, get: function () { return deals_1.deals; } });
var rest_1 = require("./api/rest");
Object.defineProperty(exports, "apiSearchProducts", { enumerable: true, get: function () { return rest_1.apiSearchProducts; } });
Object.defineProperty(exports, "apiGetProduct", { enumerable: true, get: function () { return rest_1.apiGetProduct; } });
Object.defineProperty(exports, "apiGetPrices", { enumerable: true, get: function () { return rest_1.apiGetPrices; } });
Object.defineProperty(exports, "apiCreateAlert", { enumerable: true, get: function () { return rest_1.apiCreateAlert; } });
Object.defineProperty(exports, "apiListAlerts", { enumerable: true, get: function () { return rest_1.apiListAlerts; } });
Object.defineProperty(exports, "apiCreateShareLink", { enumerable: true, get: function () { return rest_1.apiCreateShareLink; } });
