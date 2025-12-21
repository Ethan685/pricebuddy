import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { formatKrw } from "@/shared/lib/money";
import { useDeals } from "@/features/deals/api/useDeals";

export function LandingPage() {
  const { t } = useTranslation();
  const { deals } = useDeals(8);
  const displayDeals = deals.length > 0 ? deals.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30 text-textMain overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-successNeon/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "3s" }} />
          <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[80px] mix-blend-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in shadow-glass">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-successNeon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-successNeon"></span>
            </span>
            <span className="text-sm font-medium text-textMain/80 tracking-wide">AI-Powered Price Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1] animate-fade-in drop-shadow-2xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 pb-2">
              {t("landing.hero.title")}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-textMuted mb-12 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in delay-100">
            {t("landing.hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in delay-200">
            <Link to="/search">
              <Button
                variant="primary"
                className="h-14 px-8 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-300 font-semibold bg-gradient-to-r from-primary to-primaryDark border-none"
              >
                {t("landing.hero.startButton")}
              </Button>
            </Link>
            <Link to="/deals">
              <Button
                variant="secondary"
                className="h-14 px-8 text-lg rounded-full border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300 font-medium backdrop-blur-sm"
              >
                {t("landing.hero.dealsButton")}
              </Button>
            </Link>
          </div>

          {/* Stats Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto animate-slide-up delay-300">
            {[
              { value: t("landing.stats.productsValue"), label: t("landing.stats.products") },
              { value: t("landing.stats.usersValue"), label: t("landing.stats.users") },
              { value: t("landing.stats.savingsValue"), label: t("landing.stats.savings") },
            ].map((stat, idx) => (
              <div key={idx} className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-2 font-display">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-textMuted uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
              {t("landing.features.title")}
            </h2>
            <div className="h-1 w-20 bg-primary/50 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "✨", title: t("landing.features.comparison.title"), desc: t("landing.features.comparison.desc") },
              { icon: "🤖", title: t("landing.features.ai.title"), desc: t("landing.features.ai.desc") },
              { icon: "💎", title: t("landing.features.cashback.title"), desc: t("landing.features.cashback.desc") },
            ].map((feature, idx) => (
              <div key={idx} className="group p-10 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                <div className="relative z-10">
                  <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-textMuted leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-32 bg-black/20 relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t("landing.deals.title")}</h2>
              <p className="text-lg text-textMuted">{t("landing.deals.subtitle")}</p>
            </div>
            <Link to="/deals">
              <span className="text-primary hover:text-primaryDark transition-colors font-medium flex items-center gap-2 group">
                {t("landing.deals.viewAll")} <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>

          {displayDeals.length === 0 ? (
            <div className="p-20 text-center rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
              <div className="text-6xl mb-6 opacity-50">🏷️</div>
              <p className="text-xl text-textMuted mb-8">{t("deals.empty")}</p>
              <Link to="/search">
                <Button variant="primary" className="rounded-full px-8 py-3">Start Searching</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayDeals.map((deal) => (
                <Link key={deal.id} to={`/products/${deal.productId || deal.id}`} className="group block">
                  <div className="h-full rounded-2xl bg-surfaceHighlight border border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 flex flex-col">
                    <div className="relative aspect-[4/3] bg-surface overflow-hidden">
                      {deal.imageUrl ? (
                        <img
                          src={deal.imageUrl}
                          alt={deal.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <span className="text-4xl opacity-20">📦</span>
                        </div>
                      )}

                      {deal.isFlashDeal && (
                        <Badge variant="error" className="absolute top-3 right-3 shadow-lg backdrop-blur-md border border-red-500/30">
                          {t("deal.flash")}
                        </Badge>
                      )}

                      {deal.discountPercent && deal.discountPercent > 0 && (
                        <Badge variant="error" className="absolute bottom-3 left-3 shadow-lg font-bold text-lg">
                          -{deal.discountPercent}%
                        </Badge>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wide">
                        {deal.marketplace || "Global"}
                      </div>
                      <h3 className="font-semibold text-lg text-white mb-auto line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {deal.title}
                      </h3>

                      <div className="mt-4 pt-4 border-t border-white/5 flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-white">
                          {formatKrw(deal.price || deal.discountedPrice || 0)}
                        </span>
                        {deal.originalPrice && deal.originalPrice > (deal.price || deal.discountedPrice || 0) && (
                          <span className="text-sm text-textMuted line-through">
                            {formatKrw(deal.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            {t("landing.cta.title")}
          </h2>
          <p className="text-xl text-textMuted mb-12 max-w-2xl mx-auto">
            {t("landing.cta.subtitle")}
          </p>
          <Link to="/search">
            <Button
              variant="primary"
              className="h-16 px-12 text-xl rounded-full shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_70px_-15px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-300 font-bold"
            >
              {t("landing.cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
