export interface PromoVariant {
    id: string;
    text: string;
}

export class Bandit {
    private alpha: Record<string, number> = {};
    private beta: Record<string, number> = {};
    private variants: PromoVariant[];

    constructor(variants: PromoVariant[]) {
        this.variants = variants;
        variants.forEach(v => {
            this.alpha[v.id] = 1; // Start with 1 to avoid 0 probability
            this.beta[v.id] = 1;
        });
    }

    // Thompson Sampling
    public selectVariant(): PromoVariant {
        let maxSample = -1;
        let bestVariant = this.variants[0];

        this.variants.forEach(v => {
            const sample = this.sampleBeta(this.alpha[v.id], this.beta[v.id]);
            if (sample > maxSample) {
                maxSample = sample;
                bestVariant = v;
            }
        });

        return bestVariant;
    }

    public updateReward(variantId: string, success: boolean) {
        if (this.alpha[variantId] !== undefined) {
            if (success) {
                this.alpha[variantId]++;
            } else {
                this.beta[variantId]++;
            }
        }
    }

    public getStats() {
        return this.variants.map(v => ({
            id: v.id,
            alpha: this.alpha[v.id],
            beta: this.beta[v.id],
            rate: this.alpha[v.id] / (this.alpha[v.id] + this.beta[v.id])
        }));
    }

    // Simple Box-Muller transform for Beta approximation or use standard library
    // For V1 (No Dep), we can use a simpler approximation:
    // Beta(a, b) mean is a/(a+b). But we need randomness.
    // Let's use a simple approximation for Gamma distribution to generate Beta.
    // X ~ Gamma(a, 1), Y ~ Gamma(b, 1) => X / (X + Y) ~ Beta(a, b)
    private sampleBeta(alpha: number, beta: number): number {
        const x = this.sampleGamma(alpha);
        const y = this.sampleGamma(beta);
        return x / (x + y);
    }

    // Marsaglia and Tsang’s Method for Gamma Distribution
    // Reference: https://en.wikipedia.org/wiki/Gamma_distribution#Generating_gamma-distributed_random_variables
    private sampleGamma(a: number): number {
        // Handle small a < 1 case
        if (a < 1) {
            return this.sampleGamma(a + 1) * Math.pow(Math.random(), 1 / a);
        }

        const d = a - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        let v = 0;
        let x = 0;

        while (true) {
            let U = Math.random();
            let V = Math.random(); // Standard Normal? No, need Normal(0,1)
            // Box-Muller for Normal
            let u1 = Math.random();
            let u2 = Math.random();
            let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

            x = z;
            v = 1 + c * x;

            if (v <= 0) continue;

            v = v * v * v;
            if (U < 1 - 0.0331 * x * x * x * x) return d * v;
            if (Math.log(U) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
        }
    }
}
