import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { formatKrw } from "@/shared/lib/money";
import { httpPost } from "@/shared/lib/http";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Link } from "react-router-dom";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: "monthly" | "yearly";
  features: string[];
  popular?: boolean;
}

// Note: Features will be translated using i18n keys
const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "monthly",
    features: [
      "basic_price_comparison",
      "daily_5_alerts",
      "basic_price_history",
      "ads_included",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 4900,
    period: "monthly",
    features: [
      "unlimited_price_comparison",
      "unlimited_alerts",
      "advanced_price_analysis",
      "ad_free",
      "priority_support",
      "ai_recommendations",
    ],
    popular: true,
  },
  {
    id: "premium-yearly",
    name: "Premium",
    price: 49000,
    period: "yearly",
    features: [
      "unlimited_price_comparison",
      "unlimited_alerts",
      "advanced_price_analysis",
      "ad_free",
      "priority_support",
      "ai_recommendations",
      "yearly_17_discount",
    ],
  },
];

export function SubscriptionPage() {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert(t("auth.loginRequired"));
      return;
    }

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan || plan.price === 0) return;

    setLoading(true);
    try {
      // 결제 요청
      const result = await httpPost<{
        success: boolean;
        paymentId: string;
        transactionId: string;
      }>("/payment/subscribe", {
        userId: user.uid,
        planId,
        amount: plan.price,
        currency: "KRW",
        customerEmail: user.email || "",
        customerName: user.displayName || "",
      });

      if (result.success && result.paymentId) {
        // 결제 페이지로 리다이렉트 (PortOne/Toss Payments)
        // 실제로는 결제 제공업체의 결제 페이지로 이동
        const paymentUrl = `${import.meta.env.VITE_API_BASE_URL || ""}/payment/redirect?paymentId=${result.paymentId}`;
        window.location.href = paymentUrl;
      } else {
        alert(t("subscription.paymentFailed"));
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      alert(t("subscription.subscribeFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">{t("auth.loginRequired")}</p>
        <Link to="/login">
          <Button variant="primary">{t("auth.loginButton")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">{t("subscription.title")}</h1>
        <p className="text-slate-400">
          {t("subscription.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? "border-emerald-500/40 bg-emerald-900/10 scale-105"
                : ""
            }`}
          >
            {plan.popular && (
              <Badge
                variant="success"
                className="absolute -top-3 left-1/2 -translate-x-1/2"
              >
                {t("subscription.popular")}
              </Badge>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? t("subscription.free") : formatKrw(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-slate-400 text-sm ml-2">
                    /{plan.period === "monthly" ? t("subscription.period.month") : t("subscription.period.year")}
                  </span>
                )}
              </div>
              {plan.period === "yearly" && (
                <div className="text-sm text-emerald-400">
                  {t("subscription.period.month")} {formatKrw(Math.round(plan.price / 12))}{t("subscription.currency")}
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-emerald-400 mr-2">✓</span>
                  <span className="text-sm">{t(`subscription.features.${feature}`) || feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? "primary" : "secondary"}
              className="w-full"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || plan.id === "free"}
            >
              {plan.id === "free"
                ? t("subscription.currentPlan")
                : loading
                ? t("common.processing")
                : t("subscription.subscribe")}
            </Button>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("subscription.faq.title")}</h2>
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-2">{t("subscription.faq.cancel.title")}</h3>
            <p className="text-sm text-slate-400">
              {t("subscription.faq.cancel.answer")}
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">{t("subscription.faq.difference.title")}</h3>
            <p className="text-sm text-slate-400">
              {t("subscription.faq.difference.answer")}
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">{t("subscription.faq.yearly.title")}</h3>
            <p className="text-sm text-slate-400">
              {t("subscription.faq.yearly.answer")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

