import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useAuthContext } from "../context/AuthContext";
import { httpPost } from "@/shared/lib/http";
import { useLanguage } from "@/shared/context/LanguageContext";

export function SignupPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
      setError(t("auth.signup.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.signup.passwordMinLength"));
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signup(email, password);

      // 추천 코드 적용
      if (referralCode && userCredential.user) {
        try {
          await httpPost("/api/referral/apply", {
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
      setError(err.message || t("auth.signup.failed"));
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
      setError(err.message || t("auth.socialLogin.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <h1 className="text-2xl font-bold mb-6 text-center">{t("auth.signup.title")}</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t("auth.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              placeholder={t("auth.emailPlaceholder")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("auth.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              placeholder={t("auth.passwordPlaceholder")}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("auth.confirmPassword")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
              placeholder={t("auth.passwordPlaceholder")}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t("auth.signup.referralCode")} ({t("common.optional")})</label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 uppercase font-mono placeholder:normal-case"
              placeholder={t("auth.signup.referralCodePlaceholder")}
            />
            {referralCode && (
              <div className="mt-2 text-xs text-emerald-400">
                {t("auth.signup.referralBonus")}
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? t("common.processing") : t("auth.signup.button")}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-400">{t("auth.or")}</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => handleSocialSignup("google")}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {t("auth.socialSignup.google")}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          {t("auth.hasAccount")}{" "}
          <a href="/login" className="text-emerald-400 hover:underline">
            {t("auth.login.link")}
          </a>
        </div>
      </Card>
    </div>
  );
}

