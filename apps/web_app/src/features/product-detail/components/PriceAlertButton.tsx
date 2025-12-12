import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpPost } from "@/shared/lib/http";

interface PriceAlertButtonProps {
  productId: string;
  currentPrice: number;
}

export function PriceAlertButton({ productId, currentPrice }: PriceAlertButtonProps) {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice * 0.9); // 기본값: 10% 할인
  const [isSet, setIsSet] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetAlert = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
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
      alert("알림 설정에 실패했습니다.");
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
              가격 알림이 설정되었습니다
            </div>
            <div className="text-xs text-slate-400 mt-1">
              목표 가격: {targetPrice.toLocaleString()}원 도달 시 알림을 보내드립니다.
            </div>
          </div>
          <button
            onClick={() => setIsSet(false)}
            className="text-slate-400 hover:text-red-400"
          >
            취소
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
        {isOpen ? "닫기" : "가격 알림 설정"}
      </Button>

      {isOpen && (
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-4">가격 알림 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                목표 가격 (원)
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
                현재 가격: {currentPrice.toLocaleString()}원
                {targetPrice < currentPrice && (
                  <span className="text-emerald-400 ml-2">
                    ({((1 - targetPrice / currentPrice) * 100).toFixed(1)}% 할인 시)
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
              {loading ? "설정 중..." : user ? "알림 설정하기" : "로그인 필요"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

