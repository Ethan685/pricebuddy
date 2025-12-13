import { computePrice } from "../src/pricing-engine";
import { setRates } from "../src/forex/rates-store";
describe("computePrice", () => {
    beforeAll(() => {
        setRates({ USD: 1300 });
    });
    it("KR, under threshold => no tax", () => {
        const out = computePrice({
            marketplace: "amazon_jp",
            country: "KR",
            basePrice: 50, // 50 USD
            currency: "USD",
            weightKg: 1,
        });
        expect(out.taxFeeKrw).toBe(0);
        expect(out.totalPriceKrw).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=pricing-engine.test.js.map