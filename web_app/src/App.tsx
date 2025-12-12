import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

// Eager load critical pages
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './features/search/pages/SearchPage';
import { ProductDetailPage } from './features/product-detail/pages/ProductDetailPage';

// Lazy load non-critical pages
const EnterpriseDashboard = lazy(() => import('./pages/EnterpriseDashboard').then(module => ({ default: module.EnterpriseDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const WalletPage = lazy(() => import('./features/wallet/pages/WalletPage').then(module => ({ default: module.WalletPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then(module => ({ default: module.CommunityPage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(module => ({ default: module.WishlistPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const CashbackPage = lazy(() => import('./pages/CashbackPage').then(module => ({ default: module.CashbackPage })));
const SeedPage = lazy(() => import('./pages/SeedPage').then(module => ({ default: module.SeedPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(module => ({ default: module.PricingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));

import { ConsentBanner } from './components/ConsentBanner';
import { AIChatBot } from './components/AIChatBot';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OnboardingGuide } from './components/OnboardingGuide';
import { reportWebVitals } from './utils/performance';
import { Providers } from './app/providers';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportWebVitals();

    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <Providers>
      <OnboardingGuide />
      <div className="min-h-screen bg-[#0B1117] text-[#E6EDF3] flex flex-col">
        <Header />
        <div className="flex-grow">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/wallet" element={user ? <WalletPage /> : <Navigate to="/login" />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/enterprise" element={<EnterpriseDashboard />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
              <Route path="/seed" element={<SeedPage />} />
              <Route path="/cashback" element={<CashbackPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<AuthPage />} />
            </Routes>
          </Suspense>
        </div>
        <AIChatBot />
        <ConsentBanner />
        <Footer />
      </div>
    </Providers>
  );
}
