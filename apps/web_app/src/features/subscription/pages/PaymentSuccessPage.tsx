import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpPost } from "@/shared/lib/http";

export function PaymentSuccessPage() {
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
        .catch((error) => {
          console.error("Payment verification failed:", error);
        });
    }
  }, [paymentId, transactionId, user]);

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <Card className="text-center py-12">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold mb-4">결제가 완료되었습니다!</h1>
        <p className="text-slate-400 mb-8">
          프리미엄 구독이 활성화되었습니다. 이제 모든 기능을 이용하실 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={() => navigate("/")}>
            홈으로 가기
          </Button>
          <Button variant="secondary" onClick={() => navigate("/subscription")}>
            구독 관리
          </Button>
        </div>
      </Card>
    </div>
  );
}

