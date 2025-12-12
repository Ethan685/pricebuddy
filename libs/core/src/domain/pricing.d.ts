import { Marketplace } from "./product";
export interface PricingInput {
    marketplace: Marketplace;
    country: string;
    basePrice: number;
    currency: string;
    weightKg?: number;
}
export interface PricingOutput {
    itemPriceKrw: number;
    shippingFeeKrw: number;
    taxFeeKrw: number;
    totalPriceKrw: number;
}
//# sourceMappingURL=pricing.d.ts.map