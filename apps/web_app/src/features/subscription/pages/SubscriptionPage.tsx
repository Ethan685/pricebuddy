import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { formatKrw } from "@/shared/lib/money";
import { httpPost } from "@/shared/lib/http";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: "monthly" | "yearly";
  features: string[];
  popular?: boolean;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "monthly",
    features: [
      "기본 가격 비교",
      "일일 5개 알림",
      "기본 가격 히스토리",
      "광고 포함",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 4900,
    period: "monthly",
    features: [
      "무제한 가격 비교",
      "무제한 알림",
      "고급 가격 분석",
      "광고 제거",
      "우선 고객 지원",
      "AI 구매 추천",
    ],
    popular: true,
  },
  {
    id: "premium-yearly",
    name: "Premium",
    price: 49000,
    period: "yearly",
    features: [
      "무제한 가격 비교",
      "무제한 알림",
      "고급 가격 분석",
      "광고 제거",
      "우선 고객 지원",
      "AI 구매 추천",
      "연간 17% 할인",
    ],
  },
];

export function SubscriptionPage() {
  const { user } = useAuthContext();
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
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
        alert("결제 요청에 실패했습니다.");
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("구독에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">로그인이 필요합니다.</p>
        <Button variant="primary" onClick={() => (window.location.href = "/login")}>
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">프리미엄 구독</h1>
        <p className="text-slate-400">
          더 많은 기능과 혜택을 받으세요
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
                인기
              </Badge>
            )}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? "무료" : formatKrw(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-slate-400 text-sm ml-2">
                    /{plan.period === "monthly" ? "월" : "년"}
                  </span>
                )}
              </div>
              {plan.period === "yearly" && (
                <div className="text-sm text-emerald-400">
                  월 {formatKrw(Math.round(plan.price / 12))}원
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-emerald-400 mr-2">✓</span>
                  <span className="text-sm">{feature}</span>
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
                ? "현재 플랜"
                : loading
                ? "처리 중..."
                : "구독하기"}
            </Button>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">자주 묻는 질문</h2>
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold mb-2">언제든지 취소할 수 있나요?</h3>
            <p className="text-sm text-slate-400">
              네, 언제든지 구독을 취소할 수 있습니다. 취소 시 다음 결제일까지는
              프리미엄 기능을 계속 이용하실 수 있습니다.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">무료 플랜과의 차이는?</h3>
            <p className="text-sm text-slate-400">
              프리미엄 플랜은 무제한 알림, 고급 분석, 광고 제거 등 더 많은 기능을
              제공합니다. 무료 플랜은 일일 5개 알림 제한이 있습니다.
            </p>
          </Card>
          <Card>
            <h3 className="font-semibold mb-2">연간 구독의 혜택은?</h3>
            <p className="text-sm text-slate-400">
              연간 구독 시 월간 구독 대비 17% 할인된 가격으로 이용하실 수 있습니다.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

