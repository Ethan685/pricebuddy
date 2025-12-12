export interface IReferralService {
    /**
     * Generate a unique referral code for a user.
     * Should be idempotent (return same code if exists).
     */
    generateReferralCode(userId: string): Promise<string>;

    /**
     * Check if a referral code is valid.
     */
    validateReferralCode(code: string): Promise<boolean>;

    /**
     * Attribute a referral to a new user.
     * @param code The referral code used
     * @param newUserId The user ID of the referee
     */
    attributeReferral(code: string, newUserId: string): Promise<void>;
}
