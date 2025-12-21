import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpGet, httpPost } from "@/shared/lib/http";
import { copyToClipboard } from "@/shared/lib/share";
import { useLanguage } from "@/shared/context/LanguageContext";
import { Link } from "react-router-dom";

interface ReferralStats {
  referredCount: number;
  totalBonus: number;
  averageBonusPerReferral: number;
}

export function ReferralPage() {
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [codeData, statsData] = await Promise.all([
        httpGet<{ code: string }>(`/api/referral/code?userId=${user.uid}`),
        httpGet<ReferralStats>(`/api/referral/stats?userId=${user.uid}`),
      ]);


      setReferralCode(codeData.code);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (referralCode) {
      const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;
      await copyToClipboard(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("referral.title")}</h1>
        <p className="text-slate-400">
          {t("referral.subtitle")}
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-emerald-500/40">
        <div className="text-center py-8">
          <div className="text-sm text-slate-400 mb-4">{t("referral.myCode")}</div>
          <div className="text-4xl font-bold text-emerald-400 mb-6 font-mono">
            {referralCode}
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={handleCopyCode}>
              {copied ? t("referral.copied") : t("referral.copyLink")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.open(
                  `https://api.kakaotalk.com/v1/share/talk/friends?url=${encodeURIComponent(shareUrl)}`,
                  "_blank"
                );
              }}
            >
              {t("product.share.kakao")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="text-2xl mb-2">🎁</div>
          <h3 className="font-semibold mb-2">{t("referral.referrerBonus.title")}</h3>
          <p className="text-slate-400 text-sm mb-3">
            {t("referral.referrerBonus.desc")}
          </p>
        </Card>
        <Card>
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="font-semibold mb-2">{t("referral.newUserBonus.title")}</h3>
          <p className="text-slate-400 text-sm mb-3">
            {t("referral.newUserBonus.desc")}
          </p>
        </Card>
      </div>

      {/* Stats */}
      {stats && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">{t("referral.stats.title")}</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-slate-400 mb-1">{t("referral.stats.referredCount")}</div>
              <div className="text-2xl font-bold">{stats.referredCount}{t("referral.stats.countUnit")}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">{t("referral.stats.totalBonus")}</div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatKrw(stats.totalBonus)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">{t("referral.stats.averageBonus")}</div>
              <div className="text-2xl font-bold">
                {formatKrw(Math.round(stats.averageBonusPerReferral))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

