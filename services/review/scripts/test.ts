import { analyzeReviews } from './review';

const mockReviews = [
    "This product is amazing! I love it.",
    "Terrible experience, broken on arrival.",
    "It's okay, not great but does the job.",
    "Best purchase ever, highly recommended."
];

console.log('Running Review Analysis Test...');
const result = analyzeReviews(mockReviews);
console.log('Result:', JSON.stringify(result, null, 2));

if (result.sentiment === 'POSITIVE' && result.positiveKeywords.includes('amazing')) {
    console.log('[PASS] Review Logic Verified');
} else {
    console.error('[FAIL] Review output incorrect');
    process.exit(1);
}
