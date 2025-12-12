import { Bandit } from './bandit';

const variants = [
    { id: 'A', text: 'Option A' },
    { id: 'B', text: 'Option B' }
];

const bandit = new Bandit(variants);

console.log('Running Bandit Simulation...');

// Simulate Option A is better (30% vs 10%)
for (let i = 0; i < 1000; i++) {
    const chosen = bandit.selectVariant();
    const successRate = chosen.id === 'A' ? 0.3 : 0.1;
    const isSuccess = Math.random() < successRate;
    bandit.updateReward(chosen.id, isSuccess);
}

const stats = bandit.getStats();
console.log('Final Stats:', stats);

// A should have been chosen more often
const countA = stats.find(s => s.id === 'A')!.alpha + stats.find(s => s.id === 'A')!.beta;
const countB = stats.find(s => s.id === 'B')!.alpha + stats.find(s => s.id === 'B')!.beta;

console.log(`Count A: ${countA}, Count B: ${countB}`);

if (countA > countB) {
    console.log('[PASS] Bandit favored better option A');
} else {
    console.error('[FAIL] Bandit failed to converge');
    process.exit(1);
}
