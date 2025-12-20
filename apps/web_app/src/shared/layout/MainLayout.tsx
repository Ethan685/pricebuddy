import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { useTranslation } from "react-i18next";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-surface/80 backdrop-blur-xl shadow-glass-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-successNeon bg-clip-text text-transparent">
              PriceBuddy
            </div>
            <span className="text-xs text-textMuted hidden sm:inline">Global</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/search">
              <Button 
                variant={isActive("/search") ? "primary" : "secondary"} 
                className="text-sm px-4 py-2"
              >
                {t("nav.search", { defaultValue: "Search" })}
              </Button>
            </Link>
            <Link to="/deals">
              <Button 
                variant={isActive("/deals") ? "primary" : "secondary"} 
                className="text-sm px-4 py-2"
              >
                {t("nav.deals", { defaultValue: "Deals" })}
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button 
                variant={isActive("/wishlist") ? "primary" : "secondary"} 
                className="text-sm px-4 py-2"
              >
                {t("nav.wishlist", { defaultValue: "Wishlist" })}
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="secondary" className="text-sm px-4 py-2 hidden sm:inline-flex">
                {t("nav.login", { defaultValue: "Login" })}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-surface/50 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">PriceBuddy</h3>
              <p className="text-sm text-textMuted">
                {t("footer.tagline", { defaultValue: "Compare prices across stores. Save more." })}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.product", { defaultValue: "Product" })}</h4>
              <ul className="space-y-2 text-sm text-textMuted">
                <li><Link to="/search" className="hover:text-primary transition-colors">Search</Link></li>
                <li><Link to="/deals" className="hover:text-primary transition-colors">Deals</Link></li>
                <li><Link to="/recommendations" className="hover:text-primary transition-colors">Recommendations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.account", { defaultValue: "Account" })}</h4>
              <ul className="space-y-2 text-sm text-textMuted">
                <li><Link to="/wishlist" className="hover:text-primary transition-colors">Wishlist</Link></li>
                <li><Link to="/wallet" className="hover:text-primary transition-colors">Wallet</Link></li>
                <li><Link to="/subscription" className="hover:text-primary transition-colors">Subscription</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("footer.support", { defaultValue: "Support" })}</h4>
              <ul className="space-y-2 text-sm text-textMuted">
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.help", { defaultValue: "Help Center" })}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t("footer.contact", { defaultValue: "Contact" })}</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/30 text-center text-sm text-textMuted">
            <p>© 2025 PriceBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
