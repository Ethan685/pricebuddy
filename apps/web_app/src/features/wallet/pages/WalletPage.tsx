import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { formatDateTime } from "@/shared/lib/datetime";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpGet } from "@/shared/lib/http";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        httpGet<{ balance: number }>(`/api/wallet/balance?userId=${user.uid}`),
        httpGet<{ transactions: Transaction[] }>(
          `/api/wallet/transactions?userId=${user.uid}`
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
      <div className="mb-12 relative overflow-hidden rounded-3xl p-8 border border-border bg-surface/80 backdrop-blur-md shadow-glass-card">
        <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse-slow pointer-events-none"></div>
        <div className="relative z-10 text-center">
          <div className="inline-block text-sm font-bold tracking-wider text-primary mb-2 uppercase">{t("wallet.level.title") || "CURRENT TIER"}</div>
          <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-textMain to-primary mb-4">
            Gold Member
          </h1>
          <div className="w-full max-w-md mx-auto h-2 bg-surfaceHighlight rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-successNeon w-[75%] animate-slide-up rounded-full shadow-[0_0_10px_rgba(50,255,126,0.5)]"></div>
          </div>
          <p className="text-textMuted text-sm mb-8">{t("wallet.level.desc") || "Save ₩50,000 more to reach Platinum"}</p>

          <div className="grid grid-cols-2 gap-8 mb-8 border-t border-b border-border/30 py-8">
            <div className="text-center">
              <div className="text-sm text-textMuted mb-1">{t("wallet.balance")}</div>
              <div className="text-4xl font-bold text-successNeon font-display animate-scale-in">{formatKrw(balance)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-textMuted mb-1">{t("wallet.totalSaved") || "Total Saved"}</div>
              <div className="text-4xl font-bold text-primary font-display animate-scale-in delay-[100ms]">{formatKrw(balance * 1.5)}</div>
            </div>
          </div>

          <Button variant="primary" className="px-12 py-3 text-lg font-bold shadow-neon-blue hover:shadow-neon-blue/50 transform hover:-translate-y-1 transition-all">{t("wallet.withdraw")}</Button>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-primary rounded-full"></span>
        {t("wallet.transactions")}
      </h2>

      {transactions.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2 border-border bg-transparent">
          <div className="text-6xl mb-4 opacity-50">🕸️</div>
          <div className="text-textMuted text-lg">{t("wallet.empty")}</div>
          <Button variant="secondary" className="mt-4">{t("common.startShopping") || "Start Shopping"}</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <Card key={tx.id} className="hover:border-primary/30 transition-colors animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.amount > 0 ? 'bg-success/20 text-successNeon' : 'bg-surfaceHighlight text-textMuted'}`}>
                    {tx.amount > 0 ? '💰' : '🛒'}
                  </div>
                  <div>
                    <div className="font-semibold text-textMain">{tx.description}</div>
                    <div className="text-sm text-textMuted">
                      {formatDateTime(tx.createdAt)}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-bold text-lg font-display ${tx.amount > 0 ? "text-successNeon" : "text-textMain"
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
  );
}

