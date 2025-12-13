import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { formatDateTime } from "@/shared/lib/datetime";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpGet } from "@/shared/lib/http";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Link } from "react-router-dom";

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
  const { t } = useLanguage();
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
        <p className="text-slate-400 mb-4">{t("auth.loginRequired")}</p>
        <Link to="/login">
          <Button variant="primary">{t("auth.loginButton")}</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">{t("common.loading")}</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("wallet.title")}</h1>
        <p className="text-slate-400">{t("wallet.subtitle")}</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-emerald-500/40">
        <div className="text-center py-8">
          <div className="text-sm text-slate-400 mb-2">{t("wallet.balance")}</div>
          <div className="text-5xl font-bold text-emerald-400 mb-4">
            {formatKrw(balance)}
          </div>
          <Button variant="primary">{t("wallet.withdraw")}</Button>
        </div>
      </Card>

      {/* Transactions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("wallet.transactions")}</h2>
        {transactions.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-slate-400">{t("wallet.empty")}</div>
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

