"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductDetails = void 0;
const functions = __importStar(require("firebase-functions"));
/**
 * Get product details by ID
 */
exports.getProductDetails = functions.https.onCall(async (data, context) => {
    const { productId } = data;
    if (!productId) {
        throw new functions.https.HttpsError('invalid-argument', 'Product ID is required');
    }
    try {
        // For now, return mock data since we don't have a product database yet
        // In production, this would query Firestore or call the merchant API
        return {
            product: {
                id: productId,
                title: '제품 상세 정보를 불러올 수 없습니다',
                description: '네이버 쇼핑 API는 개별 제품 상세 정보를 제공하지 않습니다. 구매하려면 아래 링크를 클릭하세요.',
                images: [],
                minPrice: 0,
                maxPrice: 0,
                currency: 'KRW',
                rating: 0,
                reviewCount: 0,
                specs: {},
                category: ''
            },
            offers: [],
            priceHistory: []
        };
    }
    catch (error) {
        console.error('Get product details error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch product details');
    }
});
//# sourceMappingURL=product-details.js.map