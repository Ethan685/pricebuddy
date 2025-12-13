import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { useAuthContext } from "@/features/auth/context/AuthContext";
import { useLanguage } from "@/shared/context/LanguageContext";
import { LanguageSelector } from "@/shared/components/LanguageSelector";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout, loading } = useAuthContext();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <h1 className="text-2xl font-bold hover:text-emerald-400 transition-colors">
                {t("app.name")}
              </h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                to="/deals"
                className="text-slate-300 hover:text-emerald-400 transition-colors"
              >
                {t("nav.deals")}
              </Link>
              <Link
                to="/search"
                className="text-slate-300 hover:text-emerald-400 transition-colors"
              >
                {t("nav.search")}
              </Link>
              {user && (
                <>
                  <Link
                    to="/wishlist"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {t("nav.wishlist")}
                  </Link>
                  <Link
                    to="/purchases"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {t("nav.purchases")}
                  </Link>
                  <Link
                    to="/wallet"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {t("nav.wallet")}
                  </Link>
                  <Link
                    to="/referral"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {t("nav.referral")}
                  </Link>
                  <Link
                    to="/subscription"
                    className="text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {t("nav.premium")}
                  </Link>
                </>
              )}
              <LanguageSelector />
              {loading ? (
                <div className="text-slate-400 text-sm">{t("common.loading")}</div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  <span className="text-slate-300 text-sm">
                    {user.email}
                  </span>
                  <Button
                    variant="secondary"
                    className="text-sm"
                    onClick={logout}
                  >
                    {t("nav.logout")}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="secondary" className="text-sm">
                      {t("nav.login")}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" className="text-sm">
                      {t("nav.signup")}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

