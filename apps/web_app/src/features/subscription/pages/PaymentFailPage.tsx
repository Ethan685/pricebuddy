import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

export function PaymentFailPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto mt-16">
      <Card className="text-center py-12">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-bold mb-4">결제에 실패했습니다</h1>
        <p className="text-slate-400 mb-8">
          결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={() => navigate("/subscription")}>
            다시 시도
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            홈으로 가기
          </Button>
        </div>
      </Card>
    </div>
  );
}

