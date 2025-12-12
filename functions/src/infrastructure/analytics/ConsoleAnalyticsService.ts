import { IAnalyticsService } from '../../domain/services/IAnalyticsService';

export class ConsoleAnalyticsService implements IAnalyticsService {
    async trackEvent(eventName: string, params?: Record<string, any>): Promise<void> {
        console.log(`[Analytics] Event: ${eventName}`, params || {});
    }

    async logPurchase(transactionId: string, amount: number, currency: string): Promise<void> {
        console.log(`[Analytics] Purchase: ${transactionId} - ${amount} ${currency}`);
    }
}
