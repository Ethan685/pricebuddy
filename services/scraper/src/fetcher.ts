import axios from 'axios';

const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
];

export async function fetchHtml(url: string, headers: Record<string, string> = {}): Promise<string> {
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    // MOCK SUPPORT for V1.0 Demo
    if (url.includes('mock-test')) {
        console.log('Returning Mock HTML for:', url);
        return `
            <html>
                <head><title>Mock Product</title></head>
                <body>
                    <h2 class="prod-buy-header__title">Sony WH-1000XM5 Mock Test</h2>
                    <div class="prod-price">
                        <span class="total-price"><strong>34800</strong></span>원
                    </div>
                     <img class="prod-image__detail" src="http://example.com/mock.jpg" />
                </body>
            </html>
        `;
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': ua,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                ...headers
            },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error(`Fetch failed for ${url}`, error);
        throw error;
    }
}
