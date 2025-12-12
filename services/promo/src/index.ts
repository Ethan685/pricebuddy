export * from './bandit';

import { Bandit, PromoVariant } from './bandit';

// Singleton instance for Demo
const VARIANTS: PromoVariant[] = [
    { id: 'free_shipping', text: 'Free Shipping on orders > $50' },
    { id: 'discount_5', text: 'Get 5% Off Now!' },
    { id: 'best_value', text: 'Best Value Guaranteed' }
];

export const promoBandit = new Bandit(VARIANTS);
