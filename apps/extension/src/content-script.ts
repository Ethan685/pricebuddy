// 사이트별 DOM에서 상품명/가격/URL 추출
function detectProduct() {
  const url = window.location.href;
  let title = document.title;
  let price = 0;
  let marketplace = "";

  // 마켓플레이스 감지
  const host = window.location.hostname;
  if (host.includes("coupang")) {
    marketplace = "coupang";
    const priceEl = document.querySelector("#totalPrice");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("naver")) {
    marketplace = "naver";
    const priceEl = document.querySelector("span._1LY7Dq");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("amazon")) {
    marketplace = host.includes("amazon.co.jp") ? "amazon_jp" : "amazon_us";
    const priceEl = document.querySelector(".a-price-whole");
    const priceFraction = document.querySelector(".a-price-fraction");
    const whole = priceEl?.textContent?.replace(/[^\d]/g, "") || "0";
    const fraction = priceFraction?.textContent?.replace(/[^\d]/g, "") || "0";
    price = parseFloat(whole + "." + fraction);
  } else if (host.includes("rakuten")) {
    marketplace = "rakuten";
    const priceEl = document.querySelector(".price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("mercari")) {
    marketplace = "mercari";
    const priceEl = document.querySelector(".item-price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("ebay")) {
    marketplace = "ebay";
    const priceEl = document.querySelector(".notranslate");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  }

  return { url, title, price, marketplace };
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "PING") {
    sendResponse({ ok: true });
  } else if (msg.type === "GET_PRODUCT") {
    const product = detectProduct();
    sendResponse(product);
  }
});

// 페이지 로드 시 자동 감지
const product = detectProduct();
if (product.marketplace) {
  chrome.runtime.sendMessage({
    type: "PRODUCT_DETECTED",
    payload: product,
  });
}

