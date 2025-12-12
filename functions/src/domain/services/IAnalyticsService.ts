export interface IAnalyticsService {
    /**
     * Track a specific event with parameters.
     * @param eventName Standardized event name (e.g. 'view_product')
     * @param params Optional key-value parameters
     */
    trackEvent(eventName: string, params?: Record<string, any>): Promise<void>;

    /**
     * Log a purchase transaction explicitly.
     */
    logPurchase(transactionId: string, amount: number, currency: string): Promise<void>;
}
