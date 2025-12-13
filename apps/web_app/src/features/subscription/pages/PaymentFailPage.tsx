import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";

export function PaymentFailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <Card className="text-center py-12">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-bold mb-4">{t("subscription.payment.fail.title")}</h1>
        <p className="text-slate-400 mb-8">
          {t("subscription.payment.fail.message")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={() => navigate("/subscription")}>
            {t("common.retry")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            {t("subscription.payment.goHome")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

