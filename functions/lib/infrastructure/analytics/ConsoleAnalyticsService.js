"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleAnalyticsService = void 0;
class ConsoleAnalyticsService {
    async trackEvent(eventName, params) {
        console.log(`[Analytics] Event: ${eventName}`, params || {});
    }
    async logPurchase(transactionId, amount, currency) {
        console.log(`[Analytics] Purchase: ${transactionId} - ${amount} ${currency}`);
    }
}
exports.ConsoleAnalyticsService = ConsoleAnalyticsService;
