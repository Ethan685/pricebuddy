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
  } else if (host.includes("auction")) {
    marketplace = "auction";
    const priceEl = document.querySelector(".price_sale");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("interpark")) {
    marketplace = "interpark";
    const priceEl = document.querySelector(".price .salePrice");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("tmon")) {
    marketplace = "tmon";
    const priceEl = document.querySelector(".deal_price .price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("wemakeprice")) {
    marketplace = "wemakeprice";
    const priceEl = document.querySelector(".price .sale");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d]/g, "") || "0");
  } else if (host.includes("amazon")) {
    // Amazon 지역별 감지
    if (host.includes("amazon.co.jp")) {
      marketplace = "amazon_jp";
    } else if (host.includes("amazon.co.uk")) {
      marketplace = "amazon_uk";
    } else if (host.includes("amazon.ca")) {
      marketplace = "amazon_ca";
    } else if (host.includes("amazon.de")) {
      marketplace = "amazon_de";
    } else if (host.includes("amazon.fr")) {
      marketplace = "amazon_fr";
    } else if (host.includes("amazon.it")) {
      marketplace = "amazon_it";
    } else if (host.includes("amazon.es")) {
      marketplace = "amazon_es";
    } else if (host.includes("amazon.com.au")) {
      marketplace = "amazon_au";
    } else if (host.includes("amazon.sg")) {
      marketplace = "amazon_sg";
    } else if (host.includes("amazon.com.mx")) {
      marketplace = "amazon_mx";
    } else if (host.includes("amazon.com.br")) {
      marketplace = "amazon_br";
    } else {
      marketplace = "amazon_us";
    }
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
    // eBay 지역별 감지
    if (host.includes("ebay.co.uk")) {
      marketplace = "ebay_uk";
    } else if (host.includes("ebay.de")) {
      marketplace = "ebay_de";
    } else if (host.includes("ebay.fr")) {
      marketplace = "ebay_fr";
    } else if (host.includes("ebay.it")) {
      marketplace = "ebay_it";
    } else if (host.includes("ebay.es")) {
      marketplace = "ebay_es";
    } else if (host.includes("ebay.com.au")) {
      marketplace = "ebay_au";
    } else {
      marketplace = "ebay_us";
    }
    const priceEl = document.querySelector(".notranslate");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("walmart")) {
    marketplace = "walmart";
    const priceEl = document.querySelector(".price-current");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("target")) {
    marketplace = "target";
    const priceEl = document.querySelector("[data-test='product-price']");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("bestbuy")) {
    marketplace = "bestbuy";
    const priceEl = document.querySelector(".priceView-customer-price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("costco")) {
    marketplace = "costco";
    const priceEl = document.querySelector(".price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("newegg")) {
    marketplace = "newegg";
    const priceEl = document.querySelector(".price-current");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("aliexpress")) {
    marketplace = "aliexpress";
    const priceEl = document.querySelector(".notranslate");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("taobao")) {
    marketplace = "taobao";
    const priceEl = document.querySelector(".tb-rmb-num");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("tmall")) {
    marketplace = "tmall";
    const priceEl = document.querySelector(".tm-price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("lazada")) {
    marketplace = "lazada";
    const priceEl = document.querySelector(".pdp-price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("shopee")) {
    marketplace = "shopee";
    const priceEl = document.querySelector(".product-price");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("zalando")) {
    marketplace = "zalando";
    const priceEl = document.querySelector(".z-vegas-ui_text");
    price = parseFloat(priceEl?.textContent?.replace(/[^\d.]/g, "") || "0");
  } else if (host.includes("asos")) {
    marketplace = "asos";
    const priceEl = document.querySelector(".product-price");
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

