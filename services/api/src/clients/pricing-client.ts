import { computePrice } from "@pricebuddy/pricing";
import type { PricingInput } from "@pricebuddy/core";

export const pricingClient = {
  compute(input: PricingInput, offer: any) {
    const priced = computePrice(input);
    return {
      ...offer,
      itemPriceKrw: priced.itemPriceKrw,
      shippingFeeKrw: priced.shippingFeeKrw,
      taxFeeKrw: priced.taxFeeKrw,
      totalPriceKrw: priced.totalPriceKrw,
    };
  },
};

