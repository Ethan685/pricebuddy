interface ProductDetectedMessage {
  type: "PRODUCT_DETECTED";
  payload: { url: string; title: string; price: number; marketplace: string };
}

const API_BASE_URL = "https://your-api-url.com"; // 실제 API URL로 변경

chrome.runtime.onMessage.addListener(
  (msg: ProductDetectedMessage, sender, _sendResponse) => {
    if (msg.type !== "PRODUCT_DETECTED") return;

    const { url, title, price, marketplace } = msg.payload;

    // PriceBuddy API 호출
    fetch(`${API_BASE_URL}/ext/inspect?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        const bestPrice = data.bestPriceKrw;
        const savingPct = data.savingPct;

        if (sender.tab?.id != null) {
          chrome.action.setBadgeText({
            tabId: sender.tab.id,
            text: savingPct > 0 ? `${Math.round(savingPct * 100)}%` : "",
          });
          chrome.action.setBadgeBackgroundColor({
            color: "#10b981",
            tabId: sender.tab.id,
          });
        }

        // 알림 표시
        if (savingPct > 0.1) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon48.png",
            title: "PriceBuddy 딜 발견",
            message: `${title}\n최저가: ${bestPrice.toLocaleString()}원 · ${Math.round(
              savingPct * 100
            )}% 절약 가능`,
          });
        }
      })
      .catch((err) => {
        console.error("PriceBuddy ext inspect error", err);
      });
  }
);

