// content.js

// 1. Robust Product Extraction
function extractProductInfo() {
    const hostname = window.location.hostname;
    let title = "";
    let productId = "";
    let currency = "USD";
    let price = 0;

    // Helper: Meta tag extractor
    const getMeta = (name) => document.querySelector(`meta[name="${name}"]`)?.content ||
        document.querySelector(`meta[property="${name}"]`)?.content;

    title = getMeta('og:title') || document.title;

    if (hostname.includes("amazon")) {
        const titleEl = document.getElementById("productTitle");
        if (titleEl) title = titleEl.innerText.trim();

        // ASIN
        const asinMatch = window.location.href.match(/\/dp\/([A-Z0-9]{10})/);
        if (asinMatch) productId = asinMatch[1];

        // Price (rough attempt)
        const priceEl = document.querySelector('.a-price .a-offscreen');
        if (priceEl) {
            price = parseFloat(priceEl.innerText.replace(/[^0-9.]/g, ''));
        }
    } else if (hostname.includes("coupang")) {
        const titleEl = document.querySelector("h2.prod-buy-header__title");
        if (titleEl) title = titleEl.innerText.trim();

        const idMatch = window.location.href.match(/\/vp\/products\/(\d+)/);
        if (idMatch) productId = idMatch[1];
        currency = "KRW";

        // Coupang Price Extraction - Enhanced Selectors
        const priceSelectors = [
            "span.total-price > strong",
            "span.prod-sale-price > span.total-price > strong",
            ".prod-price .total-price strong",
            "span.price-info-toggle" // Mobile/Responsive sometimes
        ];

        for (const sel of priceSelectors) {
            const el = document.querySelector(sel);
            if (el) {
                const raw = el.innerText.replace(/[^0-9]/g, '');
                if (raw && raw.length > 0) {
                    price = parseFloat(raw);
                    break;
                }
            }
        }
    } else if (hostname.includes("naver")) {
        // Naver SmartStore
        currency = "KRW";
        const priceEl = document.querySelector(".lowest_price_area .price");
        if (priceEl) price = parseFloat(priceEl.innerText.replace(/[^0-9]/g, ''));
    }

    // Fallback: Meta Price (High reliability default)
    if (!price || price === 0) {
        const metaPrice = getMeta('product:price:amount') || getMeta('og:price:amount');
        if (metaPrice) price = parseFloat(metaPrice.replace(/[^0-9.]/g, ''));
    }

    // Sanity check: If price is shockingly low (<1000) for KRW, likely a parsing error or points
    if (currency === 'KRW' && price < 1000) price = 0;

    return { title, productId, hostname, currency, price };
}

// 2. Main Logic
const productInfo = extractProductInfo();

if (productInfo.title && productInfo.title.length > 2) { // Relaxed length check
    console.log("PriceBuddy: Detecting...", productInfo);

    // Check background for deals
    chrome.runtime.sendMessage({
        type: "CHECK_SKU",
        payload: productInfo
    }, (response) => {
        console.log("PriceBuddy Response:", response); // Log response
        if (response && response.bestMatch) {
            showNotification(response.bestMatch, response.potentialSavings);
        } else if (response && response.coupons) {
            showCouponNotification(response.coupons);
        }
    });
}

// 3. Premium UI Overlay (Shadow DOM to prevent style leaks)
function showNotification(bestMatch, savings) {
    const container = document.createElement('div');
    container.id = 'pricebuddy-root';
    document.documentElement.appendChild(container); // Attach to HTML to avoid Body issues(overflow)

    const shadow = container.attachShadow({ mode: 'open' });

    const savingsBadge = savings > 0
        ? `<div class="badge">Save ${savings}%</div>`
        : '<div class="badge info">Best Price Found</div>';

    shadow.innerHTML = `
    <style>
        .card {
            font-family: 'Inter', -apple-system, sans-serif;
            position: fixed; top: 16px; right: 16px; width: 320px;
            background: #0B1117; color: #E6EDF3;
            border: 1px solid #30363D; border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            z-index: 2147483647; overflow: hidden;
            animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .header { background: #161B22; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363D; }
        .brand { color: #4F7EFF; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; }
        .close { cursor: pointer; color: #9BA7B4; font-size: 18px; line-height: 1; }
        .body { padding: 16px; }
        .title { font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #E6EDF3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .price-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .price { font-size: 20px; font-weight: 700; color: #E6EDF3; }
        .merchant { font-size: 12px; color: #9BA7B4; }
        .badge { background: #12B981; color: white; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
        .badge.info { background: #4F7EFF; }
        .btn { display: block; wdiith: 100%; padding: 12px; background: #4F7EFF; color: white; text-align: center; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: background 0.2s; box-sizing: border-box; margin-top: 8px; }
        .btn:hover { background: #3E63DD; }
        .body { padding: 20px; box-sizing: border-box; }
    </style>
    <div class="card">
        <div class="header">
            <div class="brand">
                <span>⚡ PriceBuddy</span>
            </div>
            <div class="close" id="close-btn">×</div>
        </div>
        <div class="body">
            ${savingsBadge}
            <div class="merchant">Found on ${bestMatch.source}</div>
            <div class="title">${bestMatch.title}</div>
            <div class="price-row">
                <span class="price">${bestMatch.price.toLocaleString()} ${bestMatch.currency}</span>
            </div>
            <a href="${bestMatch.url}" target="_blank" class="btn">View Deal</a>
        </div>
    </div>
    `;

    shadow.getElementById('close-btn').onclick = () => container.remove();
}

function showCouponNotification(coupons) {
    // Similar structure for coupons...
    console.log("Coupons found:", coupons);
}
