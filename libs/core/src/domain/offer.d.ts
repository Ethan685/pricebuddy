import { Marketplace } from "./product";
export interface Offer {
    id: string;
    productId: string;
    marketplace: Marketplace;
    externalId: string;
    url: string;
    basePrice: number;
    currency: string;
    shippingFee: number;
    taxFee: number;
    otherFee: number;
    totalPriceKrw: number;
    lastFetchedAt: string;
}
//# sourceMappingURL=offer.d.ts.map