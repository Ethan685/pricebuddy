import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LANGUAGES = ["en", "ko"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

const resources = {
  en: {
    translation: {
      "landing.hero.title": "Compare total cost (item + shipping + fees) across stores.",
      "landing.hero.subtitle": "Compare instantly by adding price + shipping + platform fees.",
      "landing.hero.startButton": "Start search",
      "landing.hero.dealsButton": "View deals",

      "landing.stats.productsValue": "1.2M+",
      "landing.stats.products": "Tracked products",
      "landing.stats.usersValue": "120K+",
      "landing.stats.users": "Users",
      "landing.stats.savingsValue": "$28M+",
      "landing.stats.savings": "Savings",

      "landing.features.title": "Key features",
      "landing.features.comparison.title": "Total cost comparison",
      "landing.features.comparison.desc": "Compare including price + shipping + platform fees.",
      "landing.features.ai.title": "AI deal insights",
      "landing.features.ai.desc": "Recommends price-drop and best buy timing.",
      "landing.features.cashback.title": "Cashback wallet",
      "landing.features.cashback.desc": "Manage cashback and rewards in one place.",

      "landing.howToUse.title": "How it works",
      "landing.howToUse.step1.title": "Search",
      "landing.howToUse.step1.desc": "Paste a link or search by keyword.",
      "landing.howToUse.step2.title": "Compare",
      "landing.howToUse.step2.desc": "See total cost across stores at a glance.",
      "landing.howToUse.step3.title": "Track",
      "landing.howToUse.step3.desc": "Set alerts for price drops and restocks.",
      "landing.howToUse.step4.title": "Buy smart",
      "landing.howToUse.step4.desc": "Pick the best option and checkout confidently.",

      "landing.categories.title": "Popular categories",
      "landing.categories.subtitle": "Browse deals by category.",
      "landing.categories.category1.title": "Electronics",
      "landing.categories.category1.desc": "Phones, laptops, gadgets",
      "landing.categories.category2.title": "Home & living",
      "landing.categories.category2.desc": "Kitchen, furniture, daily goods",
      "landing.categories.category3.title": "Fashion",
      "landing.categories.category3.desc": "Clothing, shoes, accessories",

      "landing.deals.title": "Deals",
      "landing.deals.viewAll": "View all",

      "landing.cta.title": "Start saving today",
      "landing.cta.subtitle": "Find the best total price in seconds.",
      "landing.cta.button": "Get started",

      "common.loading": "Loading...",
      "common.error": "An error occurred",
      "common.error.retryLater": "An error occurred. Please try again later.",
      "common.retry": "Retry",

      "search.title": "Search Products",
      "search.placeholder": "Search for products...",
      "search.region.global": "Global",
      "search.region.kr": "Korea",
      "search.button": "Search",
      "search.noResults": "No results found",

      "deals.title": "Deals",
      "deals.subtitle": "Find the best deals and discounts",
      "deals.filter.all": "All",
      "deals.sort.discount": "Discount",
      "deals.sort.price": "Price",
      "deals.sort.time": "Time",
      "deals.empty": "No deals available",
      "deal.flash": "Flash Deal",

      "nav.search": "Search",
      "nav.deals": "Deals",
      "nav.wishlist": "Wishlist",
      "nav.login": "Login",

      "footer.tagline": "Compare prices across stores. Save more.",
      "footer.product": "Product",
      "footer.account": "Account",
      "footer.support": "Support",
      "footer.help": "Help Center",
      "footer.contact": "Contact"
    }
  },
  ko: {
    translation: {
      "landing.hero.title": "여러 쇼핑몰의 총액(상품+배송+수수료)을 한 번에 비교하세요.",
      "landing.hero.subtitle": "가격+배송비+플랫폼 수수료까지 합산해 바로 비교합니다.",
      "landing.hero.startButton": "검색 시작",
      "landing.hero.dealsButton": "딜 보기",

      "landing.stats.productsValue": "120만+",
      "landing.stats.products": "추적 상품",
      "landing.stats.usersValue": "12만+",
      "landing.stats.users": "사용자",
      "landing.stats.savingsValue": "₩289만+",
      "landing.stats.savings": "절감액",

      "landing.features.title": "핵심 기능",
      "landing.features.comparison.title": "총액 비교",
      "landing.features.comparison.desc": "상품가+배송비+수수료까지 포함해 비교합니다.",
      "landing.features.ai.title": "AI 딜 인사이트",
      "landing.features.ai.desc": "가격 하락/구매 타이밍을 추천합니다.",
      "landing.features.cashback.title": "캐시백 지갑",
      "landing.features.cashback.desc": "캐시백/리워드를 한 곳에서 관리합니다.",

      "landing.howToUse.title": "사용 방법",
      "landing.howToUse.step1.title": "검색",
      "landing.howToUse.step1.desc": "링크를 붙여넣거나 키워드로 검색합니다.",
      "landing.howToUse.step2.title": "비교",
      "landing.howToUse.step2.desc": "쇼핑몰별 총액을 한눈에 비교합니다.",
      "landing.howToUse.step3.title": "추적",
      "landing.howToUse.step3.desc": "가격 하락/재입고 알림을 설정합니다.",
      "landing.howToUse.step4.title": "똑똑하게 구매",
      "landing.howToUse.step4.desc": "가장 유리한 옵션으로 구매합니다.",

      "landing.categories.title": "인기 카테고리",
      "landing.categories.subtitle": "카테고리별 딜을 둘러보세요.",
      "landing.categories.category1.title": "전자제품",
      "landing.categories.category1.desc": "휴대폰, 노트북, 가전",
      "landing.categories.category2.title": "홈·리빙",
      "landing.categories.category2.desc": "주방, 가구, 생활용품",
      "landing.categories.category3.title": "패션",
      "landing.categories.category3.desc": "의류, 신발, 액세서리",

      "landing.deals.title": "딜",
      "landing.deals.viewAll": "전체 보기",

      "landing.cta.title": "지금 바로 절약을 시작하세요",
      "landing.cta.subtitle": "몇 초 만에 최저 총액을 찾아드립니다.",
      "landing.cta.button": "시작하기",

      "common.loading": "로딩 중...",
      "common.error": "오류가 발생했습니다",
      "common.error.retryLater": "오류가 발생했습니다. 나중에 다시 시도해주세요.",
      "common.retry": "다시 시도",

      "search.title": "상품 검색",
      "search.placeholder": "상품을 검색하세요...",
      "search.region.global": "전체",
      "search.region.kr": "한국",
      "search.button": "검색",
      "search.noResults": "검색 결과가 없습니다",

      "deals.title": "딜",
      "deals.subtitle": "최고의 딜과 할인을 찾아보세요",
      "deals.filter.all": "전체",
      "deals.sort.discount": "할인율",
      "deals.sort.price": "가격",
      "deals.sort.time": "시간",
      "deals.empty": "딜이 없습니다",
      "deal.flash": "플래시 딜",

      "nav.search": "검색",
      "nav.deals": "딜",
      "nav.wishlist": "위시리스트",
      "nav.login": "로그인",

      "footer.tagline": "여러 쇼핑몰 가격을 비교하고 더 많이 절약하세요.",
      "footer.product": "제품",
      "footer.account": "계정",
      "footer.support": "지원",
      "footer.help": "도움말",
      "footer.contact": "문의"
    }
  }
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });
}

export default i18n;
