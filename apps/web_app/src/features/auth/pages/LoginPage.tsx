import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { useAuthContext } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
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
        <h1 className="text-2xl font-bold mb-6 text-center">로그인</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
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
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Google로 로그인
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          계정이 없으신가요?{" "}
          <a href="/signup" className="text-emerald-400 hover:underline">
            회원가입
          </a>
        </div>
      </Card>
    </div>
  );
}

