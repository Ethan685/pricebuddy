import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useAuthContext } from "../context/AuthContext";
import { httpPost } from "@/shared/lib/http";

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, loginWithGoogle } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // URL에서 추천 코드 가져오기
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signup(email, password);
      
      // 추천 코드 적용
      if (referralCode && userCredential.user) {
        try {
          await httpPost("/referral/apply", {
            userId: userCredential.user.uid,
            referralCode,
          });
        } catch (refErr) {
          console.error("Failed to apply referral code:", refErr);
          // 추천 코드 실패해도 회원가입은 진행
        }
      }
      
      navigate("/");
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: "google") => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (err: any) {
      setError(err.message || "소셜 로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <h1 className="text-2xl font-bold mb-6 text-center">회원가입</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {referralCode && (
            <div className="p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/40">
              <div className="text-sm text-emerald-300">
                추천 코드가 적용되었습니다: <span className="font-mono">{referralCode}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                가입 시 3,000원 보너스를 받으실 수 있습니다!
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "처리 중..." : "회원가입"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">또는</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => handleSocialSignup("google")}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Google로 회원가입
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          이미 계정이 있으신가요?{" "}
          <a href="/login" className="text-emerald-400 hover:underline">
            로그인
          </a>
        </div>
      </Card>
    </div>
  );
}

