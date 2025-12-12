import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { formatDateTime } from "@/shared/lib/datetime";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpGet } from "@/shared/lib/http";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

export function WalletPage() {
  const { user } = useAuthContext();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        httpGet<{ balance: number }>(`/wallet/balance?userId=${user.uid}`),
        httpGet<{ transactions: Transaction[] }>(
          `/wallet/transactions?userId=${user.uid}`
        ),
      ]);

      setBalance(balanceData.balance);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
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

  if (loading) {
    return <div className="text-center py-12 text-slate-400">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">내 지갑</h1>
        <p className="text-slate-400">캐시백과 보너스를 확인하세요.</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-emerald-500/40">
        <div className="text-center py-8">
          <div className="text-sm text-slate-400 mb-2">총 잔고</div>
          <div className="text-5xl font-bold text-emerald-400 mb-4">
            {formatKrw(balance)}
          </div>
          <Button variant="primary">출금하기</Button>
        </div>
      </Card>

      {/* Transactions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">거래 내역</h2>
        {transactions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-slate-400">거래 내역이 없습니다.</div>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{tx.description}</div>
                    <div className="text-sm text-slate-400">
                      {formatDateTime(tx.createdAt)}
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {formatKrw(tx.amount)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

