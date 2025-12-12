import { scrapeOffer } from './index';

async function test() {
    // A known product URL (This might fail if product is gone or anti-bot blocks request)
    // We use a known stable item if possible, or expect failure and catch it.
    // Ideally, for unit testing without network, we should mock `fetchHtml`.
    // But this involves "Manual Verification" step.

    // Example: Apple MagSafe Charger on Coupang (URL pattern example)
    const url = 'https://www.coupang.com/vp/products/12345678'; // Fake ID for structure check?
    // Actually, let's use a real one if we want to risk it, OR mock the HTML.

    console.log('Testing Parser with MOCK HTML...');

    // Mocking fetchHtml behavior by manually calling parser
    const { parseCoupang } = require('./parsers/coupang');
    const mockHtml = `
        <html>
            <head><meta property="og:title" content="[Apple] MagSafe Charger"/></head>
            <body>
                <h2 class="prod-buy-header__title">Apple MagSafe Charger</h2>
                <span class="total-price"><strong>55,000원</strong></span>
                <img class="prod-image__detail" src="http://img.coupang.com/image.jpg"/>
            </body>
        </html>
    `;

    const result = parseCoupang({
        marketplace: 'coupang',
        url: 'http://test.com',
        fetchedAt: new Date().toISOString(),
        rawHtml: mockHtml
    });

    console.log('Parsed Result:', result);

    if (result.price === 55000 && result.title.includes('MagSafe')) {
        console.log('[PASS] Coupang Parser Logic Verified');
    } else {
        console.error('[FAIL] Parser output incorrect');
    }
}

test().catch(console.error);
