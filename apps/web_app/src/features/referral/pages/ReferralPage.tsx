import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { formatKrw } from "@/shared/lib/money";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { httpGet, httpPost } from "@/shared/lib/http";
import { copyToClipboard } from "@/shared/lib/share";

interface ReferralStats {
  referredCount: number;
  totalBonus: number;
  averageBonusPerReferral: number;
}

export function ReferralPage() {
  const { user } = useAuthContext();
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
        httpGet<{ referralCode: string }>(`/referral/code?userId=${user.uid}`),
        httpGet<ReferralStats>(`/referral/stats?userId=${user.uid}`),
      ]);

      setReferralCode(codeData.referralCode);
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

  const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">추천인 프로그램</h1>
        <p className="text-slate-400">
          친구를 초대하고 양쪽 모두 보너스를 받으세요!
        </p>
      </div>

      {/* Referral Code Card */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border-emerald-500/40">
        <div className="text-center py-8">
          <div className="text-sm text-slate-400 mb-4">내 추천 코드</div>
          <div className="text-4xl font-bold text-emerald-400 mb-6 font-mono">
            {referralCode}
          </div>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={handleCopyCode}>
              {copied ? "✓ 복사됨" : "링크 복사"}
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
              카카오톡 공유
            </Button>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="text-2xl mb-2">🎁</div>
          <h3 className="font-semibold mb-2">추천인 보너스</h3>
          <p className="text-slate-400 text-sm mb-3">
            친구가 가입하면 <span className="text-emerald-400 font-bold">5,000원</span>을 받으세요
          </p>
        </Card>
        <Card>
          <div className="text-2xl mb-2">🎉</div>
          <h3 className="font-semibold mb-2">신규 가입 보너스</h3>
          <p className="text-slate-400 text-sm mb-3">
            추천 코드로 가입하면 <span className="text-emerald-400 font-bold">3,000원</span>을 받으세요
          </p>
        </Card>
      </div>

      {/* Stats */}
      {stats && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">내 추천 통계</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-slate-400 mb-1">추천한 친구</div>
              <div className="text-2xl font-bold">{stats.referredCount}명</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">총 보너스</div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatKrw(stats.totalBonus)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">평균 보너스</div>
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

