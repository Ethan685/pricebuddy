import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpPost } from "@/shared/lib/http";
import { useLanguage } from "@/shared/context/LanguageContext";

interface PriceAlertButtonProps {
  productId: string;
  currentPrice: number;
}

export function PriceAlertButton({ productId, currentPrice }: PriceAlertButtonProps) {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice * 0.9); // 기본값: 10% 할인
  const [isSet, setIsSet] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetAlert = async () => {
    if (!user) {
      alert(t("auth.loginRequired"));
      return;
    }

    try {
      setLoading(true);
      await httpPost("/alerts", {
        userId: user.uid,
        productId,
        targetPrice,
        currentPrice,
        condition: "below",
      });
      setIsSet(true);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to set alert:", error);
      alert(t("product.alert.setFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (isSet) {
    return (
      <Card className="p-4 bg-emerald-900/20 border-emerald-500/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-emerald-300 font-semibold">
              {t("product.alert.setSuccess")}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {t("product.alert.targetPrice")}: {targetPrice.toLocaleString()}{t("product.alert.targetPriceUnit")} {t("product.alert.targetPriceDesc")}
            </div>
          </div>
          <button
            onClick={() => setIsSet(false)}
            className="text-slate-400 hover:text-red-400"
          >
            {t("common.cancel")}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
      >
        {isOpen ? t("common.close") : t("product.alert.setButton")}
      </Button>

      {isOpen && (
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-4">{t("product.alert.setButton")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("product.alert.targetPrice")} ({t("product.alert.targetPriceUnit")})
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                min="0"
                step="1000"
              />
              <div className="text-xs text-slate-400 mt-1">
                {t("product.alert.currentPrice")}: {currentPrice.toLocaleString()}{t("product.alert.targetPriceUnit")}
                {targetPrice < currentPrice && (
                  <span className="text-emerald-400 ml-2">
                    ({((1 - targetPrice / currentPrice) * 100).toFixed(1)}% {t("product.alert.discount")})
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleSetAlert}
              className="w-full"
              disabled={loading || !user}
            >
              {loading ? t("common.processing") : user ? t("product.alert.setConfirm") : t("auth.loginRequired")}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

