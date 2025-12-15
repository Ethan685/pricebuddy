import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpPost } from "@/shared/lib/http";
import { useLanguage } from "@/shared/context/LanguageContext";

export function PaymentSuccessPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const paymentId = searchParams.get("paymentId");
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    if (paymentId && transactionId && user) {
      // 결제 확인
      httpPost("/payment/verify", {
        paymentId,
        transactionId,
      })
        .then(() => {
          console.log("Payment verified");
        })
        .catch((error: unknown) => {
          console.error("Payment verification failed:", error);
        });
    }
  }, [paymentId, transactionId, user]);

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <Card className="text-center py-12">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-4">{t("subscription.payment.success.title")}</h1>
        <p className="text-slate-400 mb-8">
          {t("subscription.payment.success.message")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={() => navigate("/")}>
            {t("subscription.payment.goHome")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/subscription")}>
            {t("subscription.payment.manage")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

