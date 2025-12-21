import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type AppLanguage = "ko" | "en" | "ja" | "zh" | "es" | "fr" | "de" | "pt" | "ru" | "ar" | "id" | "th" | "vi";
export const SUPPORTED_LANGUAGES: AppLanguage[] = ["ko", "en", "ja", "zh", "es", "fr", "de", "pt", "ru", "ar", "id", "th", "vi"];
export const DEFAULT_LANGUAGE: AppLanguage = "ko";

const STORAGE_KEY = "pb_lang";

export function normalizeLanguage(input?: string): AppLanguage {
  const s = String(input || "").toLowerCase();
  if (s.startsWith("ko")) return "ko";
  if (s.startsWith("ja")) return "ja";
  if (s.startsWith("zh")) return "zh";
  if (s.startsWith("es")) return "es";
  if (s.startsWith("fr")) return "fr";
  if (s.startsWith("de")) return "de";
  if (s.startsWith("pt")) return "pt";
  if (s.startsWith("ru")) return "ru";
  if (s.startsWith("ar")) return "ar";
  if (s.startsWith("id")) return "id";
  if (s.startsWith("th")) return "th";
  if (s.startsWith("vi")) return "vi";
  if (s.startsWith("en")) return "en";
  return DEFAULT_LANGUAGE;
}

export function getLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeLanguage(saved);
  } catch { }
  const nav = (typeof navigator !== "undefined" && (navigator.language || "")) || "";
  return normalizeLanguage(nav);
}

export async function setLanguage(lang: AppLanguage) {
  const normalized = normalizeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch { }
  await i18n.changeLanguage(normalized);
}

const resources = {
  ko: {
    translation: {
      "common.loading": "로딩 중...",
      "common.error": "오류",
      "nav.search": "검색",
      "nav.deals": "핫딜",
      "nav.wishlist": "위시리스트",
      "nav.login": "메일로 시작하기",
      "search.title": "전 세계 최저가 검색",
      "search.placeholder": "어떤 상품을 찾고 계신가요?",
      "search.region.global": "전 세계",
      "search.region.kr": "한국",
      "search.button": "검색",
      "search.noResults": "검색 결과가 없습니다.",
      "landing.hero.subtitle": "AI가 찾아주는 전 세계 최저가와 자동 할인 쿠폰으로\n더 스마트한 쇼핑을 경험하세요.",
      "landing.hero.startButton": "무료로 시작하기",
      "landing.hero.dealsButton": "오늘의 핫딜 보기",
      "landing.stats.products": "분석된 상품",
      "landing.stats.productsValue": "1억+",
      "landing.stats.users": "활성 사용자",
      "landing.stats.usersValue": "50만+",
      "landing.stats.savings": "누적 할인액",
      "landing.stats.savingsValue": "100억+",
      "landing.features.title": "왜 PriceBuddy인가요?",
      "landing.features.comparison.title": "실시간 가격 비교",
      "landing.features.comparison.desc": "국내외 모든 쇼핑몰의 가격을 실시간으로 비교하여 가장 저렴한 구매처를 찾아드립니다.",
      "landing.features.ai.title": "AI 가격 예측",
      "landing.features.ai.desc": "빅데이터 분석을 통해 가격 변동을 예측하고 지금이 구매 적기인지 알려드립니다.",
      "landing.features.cashback.title": "자동 캐시백",
      "landing.features.cashback.desc": "쇼핑할 때마다 자동으로 쌓이는 캐시백으로 더 큰 혜택을 누리세요.",
      "landing.howToUse.title": "이용 방법",
      "landing.howToUse.step1.title": "상품 검색",
      "landing.howToUse.step1.desc": "원하는 상품을 검색하거나 이미지로 찾아보세요.",
      "landing.howToUse.step2.title": "가격 비교",
      "landing.howToUse.step2.desc": "전 세계 쇼핑몰의 가격을 한눈에 비교하세요.",
      "landing.howToUse.step3.title": "알림 설정",
      "landing.howToUse.step3.desc": "원하는 가격에 도달하면 즉시 알림을 받으세요.",
      "landing.howToUse.step4.title": "구매 및 캐시백",
      "landing.howToUse.step4.desc": "최저가로 구매하고 캐시백까지 챙기세요.",
      "landing.deals.title": "오늘의 핫딜",
      "landing.deals.subtitle": "지금 가장 인기 있는 특가 상품을 놓치지 마세요.",
      "landing.deals.viewAll": "전체 보기",
      "landing.cta.title": "쇼핑의 기준을 바꾸다",
      "landing.cta.subtitle": "지금 바로 PriceBuddy와 함께 스마트한 쇼핑을 시작하세요.",
      "landing.cta.button": "무료로 시작하기",
      "deals.empty": "진행 중인 핫딜이 없습니다.",
      "deal.flash": "마감 임박",
      "footer.tagline": "전 세계 최저가 비교. 더 큰 절약.",
      "footer.product": "제품",
      "footer.account": "계정",
      "footer.support": "지원",
      "footer.help": "고객센터",
      "footer.contact": "문의하기",
      "product.priceHistory": "가격 추이",
      "product.priceComparison": "가격 비교",
      "product.share": "공유하기",
      "product.alert.setButton": "가격 알림 설정",
      "product.shipping": "배송비",
      "product.clickToVisit": "구매하러 가기",
      "product.costBreakdown.title": "총 구매 비용 (예상)",
      "product.costBreakdown.basePrice": "상품 가격",
      "product.costBreakdown.shipping": "배송비",
      "product.costBreakdown.tax": "관부가세",
      "product.costBreakdown.verdict": "최종 예상 비용",
      "product.tracking.failed": "추적 시작 실패",
      "product.tracking.noOffers": "상품 정보가 없습니다.",
      "product.tracking.inProgress": "처리 중...",
      "product.tracking.started": "추적 중",
      "product.tracking.start": "가격 추적 시작",
      "product.tracking.successMessage": "가격 추적이 시작되었습니다.",
      "product.tracking.errorMessage": "가격 추적을 시작할 수 없습니다.",
      "product.aiSignal": "AI 추천",
      "product.aiSignal.buy": "지금 구매",
      "product.aiSignal.wait": "기다리세요",
      "product.imagePreparing": "이미지 준비 중...",
      "product.error.loadFailed": "상품 정보를 불러오지 못했습니다.",
    },
  },
  en: {
    translation: {
      "common.loading": "Loading...",
      "common.error": "Error",
      "nav.search": "Search",
      "nav.deals": "Deals",
      "nav.wishlist": "Wishlist",
      "nav.login": "Login",
      "landing.hero.title": "Smart Shopping Starts Here",
      "landing.hero.subtitle": "Experience smarter shopping with AI-powered price tracking\nand automatic coupons from around the world.",
      "landing.hero.startButton": "Get Started Free",
      "landing.hero.dealsButton": "View Today's Deals",
      "landing.stats.products": "Products Analyzed",
      "landing.stats.productsValue": "100M+",
      "landing.stats.users": "Active Users",
      "landing.stats.usersValue": "500K+",
      "landing.stats.savings": "Total Savings",
      "landing.stats.savingsValue": "$10M+",
      "landing.features.title": "Why PriceBuddy?",
      "landing.features.comparison.title": "Real-time Comparison",
      "landing.features.comparison.desc": "Compare prices across global stores in real-time to find the best deal.",
      "landing.features.ai.title": "AI Price Prediction",
      "landing.features.ai.desc": "Predict price trends with big data to know the perfect time to buy.",
      "landing.features.cashback.title": "Automatic Cashback",
      "landing.features.cashback.desc": "Earn automatic cashback on every purchase for bigger savings.",
      "landing.howToUse.title": "How It Works",
      "landing.howToUse.step1.title": "Search",
      "landing.howToUse.step1.desc": "Search for products or upload an image.",
      "landing.howToUse.step2.title": "Compare",
      "landing.howToUse.step2.desc": "Compare prices from global retailers at a glance.",
      "landing.howToUse.step3.title": "Alert",
      "landing.howToUse.step3.desc": "Get notified instantly when prices drop.",
      "landing.howToUse.step4.title": "Earn",
      "landing.howToUse.step4.desc": "Buy at the lowest price and earn cashback.",
      "landing.deals.title": "Today's Deals",
      "landing.deals.subtitle": "Don't miss out on the most popular deals right now.",
      "landing.deals.viewAll": "View All",
      "landing.cta.title": "Redefine Your Shopping",
      "landing.cta.subtitle": "Start smart shopping with PriceBuddy today.",
      "landing.cta.button": "Get Started Free",
      "deals.empty": "No active deals at the moment.",
      "deal.flash": "Flash Deal",
      "footer.tagline": "Compare prices across stores. Save more.",
      "footer.product": "Product",
      "footer.account": "Account",
      "footer.support": "Support",
      "footer.help": "Help Center",
      "footer.contact": "Contact",
      "product.priceHistory": "Price History",
      "product.priceComparison": "Price Comparison",
      "product.share": "Share",
      "product.alert.setButton": "Set Price Alert",
      "product.shipping": "Shipping",
      "product.clickToVisit": "Visit Store",
      "product.costBreakdown.title": "Total Landed Cost",
      "product.costBreakdown.basePrice": "Base Price",
      "product.costBreakdown.shipping": "Shipping",
      "product.costBreakdown.tax": "Tax & Duty",
      "product.costBreakdown.verdict": "YOU PAY (FINAL)",
      "product.tracking.failed": "Tracking Failed",
      "product.tracking.noOffers": "No offers available",
      "product.tracking.inProgress": "Starting...",
      "product.tracking.started": "Tracking Started",
      "product.tracking.start": "Start Price Tracking",
      "product.tracking.successMessage": "Tracking started successfully",
      "product.tracking.errorMessage": "Failed to start tracking",
      "product.aiSignal": "AI Recommendation",
      "product.aiSignal.buy": "Buy Now",
      "product.aiSignal.wait": "Wait",
      "product.imagePreparing": "Image preparing...",
      "product.share": "Share",
      "product.alert.setButton": "Set Price Alert",
      "product.alert.message": "Get notified when price drops",
      "product.error.loadFailed": "Failed to load product",
    },
  },
  ja: {
    translation: {
      "common.loading": "読み込み中…",
      "common.error": "エラー",
      "nav.search": "検索",
      "nav.deals": "セール",
      "nav.wishlist": "ウィッシュリスト",
      "nav.login": "ログイン",
      "search.title": "世界中の最安値を検索",
      "search.placeholder": "何をお探しですか？",
      "search.region.global": "全世界",
      "search.region.kr": "韓国",
      "search.button": "検索",
      "search.noResults": "検索結果がありません。",
      "landing.hero.title": "賢い買い物の始まり",
      "landing.hero.subtitle": "AIによる価格追跡と自動クーポンで、\nよりスマートなショッピング体験を。",
      "landing.hero.startButton": "無料で始める",
      "landing.hero.dealsButton": "今日のセールを見る",
      "landing.stats.products": "分析された商品",
      "landing.stats.users": "アクティブユーザー",
      "landing.stats.savings": "累計割引額",
      "product.priceHistory": "価格推移",
      "product.priceComparison": "価格比較",
      "product.share": "共有",
      "product.alert.setButton": "価格アラート設定",
      "product.alert.message": "価格が下がったら通知を受け取る",
      "product.shipping": "送料",
      "product.clickToVisit": "ストアへ行く",
      "product.costBreakdown.title": "総費用 (予想)",
      "product.costBreakdown.basePrice": "商品価格",
      "product.costBreakdown.shipping": "送料",
      "product.costBreakdown.tax": "関税・消費税",
      "product.costBreakdown.verdict": "最終支払額",
      "product.tracking.failed": "追跡失敗",
      "product.tracking.noOffers": "オファーなし",
      "product.tracking.inProgress": "処理中...",
      "product.tracking.started": "追跡中",
      "product.tracking.start": "価格追跡を開始",
      "product.tracking.successMessage": "追跡を開始しました",
      "product.tracking.errorMessage": "追跡開始に失敗しました",
      "product.aiSignal": "AI推奨",
      "product.aiSignal.buy": "今すぐ購入",
      "product.aiSignal.wait": "待機",
      "product.imagePreparing": "画像準備中...",
      "product.error.loadFailed": "読み込みに失敗しました",
    },
  },
  zh: {
    translation: {
      "common.loading": "加载中...",
      "common.error": "错误",
      "nav.search": "搜索",
      "nav.deals": "特价",
      "nav.wishlist": "收藏夹",
      "nav.login": "登录",
      "search.title": "搜索全球最低价",
      "search.placeholder": "您在找什么商品？",
      "search.region.global": "全球",
      "search.region.kr": "韩国",
      "search.button": "搜索",
      "search.noResults": "未找到结果。",
      "product.share": "Share",
      "product.alert.setButton": "Set Price Alert",
      "product.alert.message": "Get notified when price drops",
      "product.imagePreparing": "Image preparing...",
      "product.error.loadFailed": "Failed to load product",
    }
  },
  es: {
    translation: {
      "common.loading": "Cargando...",
      "common.error": "Error",
      "nav.search": "Buscar",
      "nav.deals": "Ofertas",
      "nav.wishlist": "Favoritos",
      "nav.login": "Entrar",
      "search.title": "Busca el precio más bajo global",
      "search.placeholder": "¿Qué producto buscas?",
      "search.region.global": "Global",
      "search.region.kr": "Corea",
      "search.button": "Buscar",
      "search.noResults": "No se encontraron resultados.",
      "product.share": "Share",
      "product.alert.setButton": "Set Price Alert",
      "product.alert.message": "Get notified when price drops",
      "product.imagePreparing": "Image preparing...",
      "product.error.loadFailed": "Failed to load product",
    }
  },
  fr: {
    translation: {
      "common.loading": "Chargement...",
      "common.error": "Erreur",
      "nav.search": "Rechercher",
      "nav.deals": "Offres",
      "nav.wishlist": "Favoris",
      "nav.login": "Connexion",
      "search.title": "Le meilleur prix mondial",
      "search.placeholder": "Que cherchez-vous ?",
      "search.region.global": "Monde",
      "search.region.kr": "Corée",
      "search.button": "Rechercher",
      "search.noResults": "Aucun résultat trouvé.",
      "product.share": "Share",
      "product.alert.setButton": "Set Price Alert",
      "product.alert.message": "Get notified when price drops",
      "product.imagePreparing": "Image preparing...",
      "product.error.loadFailed": "Failed to load product",
    }
  },
  de: {
    translation: {
      "common.loading": "Laden...",
      "common.error": "Fehler",
      "nav.search": "Suche",
      "nav.deals": "Angebote",
      "nav.wishlist": "Wunschliste",
      "nav.login": "Anmelden",
      "search.title": "Suche den besten Preis weltweit",
      "search.placeholder": "Was suchen Sie?",
      "search.region.global": "Weltweit",
      "search.region.kr": "Korea",
      "search.button": "Suchen",
      "search.noResults": "Keine Ergebnisse gefunden.",
    }
  },
  pt: {
    translation: {
      "common.loading": "Carregando...",
      "common.error": "Erro",
      "nav.search": "Buscar",
      "nav.deals": "Ofertas",
      "nav.wishlist": "Lista de Desejos",
      "nav.login": "Entrar",
      "search.title": "Busque o menor preço global",
      "search.placeholder": "O que você está procurando?",
      "search.region.global": "Global",
      "search.region.kr": "Coreia",
      "search.button": "Buscar",
      "search.noResults": "Nenhum resultado encontrado.",
      "product.share": "Share",
      "product.alert.setButton": "Set Price Alert",
      "product.alert.message": "Get notified when price drops",
      "product.imagePreparing": "Image preparing...",
      "product.error.loadFailed": "Failed to load product",
    }
  },
  ru: {
    translation: {
      "common.loading": "Загрузка...",
      "common.error": "Ошибка",
      "nav.search": "Поиск",
      "nav.deals": "Акции",
      "nav.wishlist": "Избранное",
      "nav.login": "Войти",
      "search.title": "Поиск лучшей цены в мире",
      "search.placeholder": "Что вы ищете?",
      "search.region.global": "Весь мир",
      "search.region.kr": "Корея",
      "search.button": "Найти",
      "search.noResults": "Результатов не найдено.",
    }
  },
  ar: {
    translation: {
      "common.loading": "جار التحميل...",
      "common.error": "خطأ",
      "nav.search": "بحث",
      "nav.deals": "عروض",
      "nav.wishlist": "مفضلة",
      "nav.login": "دخول",
      "search.title": "ابحث عن أقل سعر عالمي",
      "search.placeholder": "ما الذي تبحث عنه؟",
      "search.region.global": "عالمي",
      "search.region.kr": "كوريا",
      "search.button": "بحث",
      "search.noResults": "لم يتم العثور على نتائج.",
    }
  },
  id: {
    translation: {
      "common.loading": "Memuat...",
      "common.error": "Kesalahan",
      "nav.search": "Cari",
      "nav.deals": "Promo",
      "nav.wishlist": "Wishlist",
      "nav.login": "Masuk",
      "search.title": "Cari harga termurah global",
      "search.placeholder": "Apa yang Anda cari?",
      "search.region.global": "Global",
      "search.region.kr": "Korea",
      "search.button": "Cari",
      "search.noResults": "Tidak ada hasil.",
    }
  },
  th: {
    translation: {
      "common.loading": "กำลังโหลด...",
      "common.error": "ข้อผิดพลาด",
      "nav.search": "ค้นหา",
      "nav.deals": "ดีล",
      "nav.wishlist": "รายการที่ชอบ",
      "nav.login": "เข้าสู่ระบบ",
      "search.title": "ค้นหาราคาถูกที่สุดทั่วโลก",
      "search.placeholder": "คุณกำลังมองหาอะไร?",
      "search.region.global": "ทั่วโลก",
      "search.region.kr": "เกาหลี",
      "search.button": "ค้นหา",
      "search.noResults": "ไม่พบผลลัพธ์",
    }
  },
  vi: {
    translation: {
      "common.loading": "Đang tải...",
      "common.error": "Lỗi",
      "nav.search": "Tìm kiếm",
      "nav.deals": "Ưu đãi",
      "nav.wishlist": "Yêu thích",
      "nav.login": "Đăng nhập",
      "search.title": "Tìm giá rẻ nhất thế giới",
      "search.placeholder": "Bạn đang tìm gì?",
      "search.region.global": "Toàn cầu",
      "search.region.kr": "Hàn Quốc",
      "search.button": "Tìm kiếm",
      "search.noResults": "Không tìm thấy kết quả.",
    }
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: (typeof window !== "undefined" ? getLanguage() : DEFAULT_LANGUAGE),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
  });
}

export default i18n;
