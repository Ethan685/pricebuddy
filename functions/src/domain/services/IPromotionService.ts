import { Promotion } from '../entities/Promotion';

export interface IPromotionService {
    /**
     * Get all currently active promotions.
     */
    getActivePromotions(): Promise<Promotion[]>;

    /**
     * Apply a promotion code to a context (e.g. cart or user).
     * Returns the promotion if valid and applicable, null otherwise.
     */
    applyPromotion(code: string, context: { userId: string; originalAmount?: number }): Promise<Promotion | null>;
}
