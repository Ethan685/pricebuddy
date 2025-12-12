import { Routes, Route } from "react-router-dom";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import { SearchPage } from "@/features/search/pages/SearchPage";
import { ProductDetailPage } from "@/features/product-detail/pages/ProductDetailPage";
import { DealsPage } from "@/features/deals/pages/DealsPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { WishlistPage } from "@/features/wishlist/pages/WishlistPage";
import { WalletPage } from "@/features/wallet/pages/WalletPage";
import { PurchaseHistoryPage } from "@/features/purchase-history/pages/PurchaseHistoryPage";
import { ReferralPage } from "@/features/referral/pages/ReferralPage";
import { SubscriptionPage } from "@/features/subscription/pages/SubscriptionPage";
import { PaymentSuccessPage } from "@/features/subscription/pages/PaymentSuccessPage";
import { PaymentFailPage } from "@/features/subscription/pages/PaymentFailPage";
import { ComparisonPage } from "@/features/comparison/pages/ComparisonPage";
import { RecommendationsPage } from "@/features/recommendations/pages/RecommendationsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/deals" element={<DealsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/compare" element={<ComparisonPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/wallet" element={<WalletPage />} />
      <Route path="/purchases" element={<PurchaseHistoryPage />} />
      <Route path="/referral" element={<ReferralPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/subscription/success" element={<PaymentSuccessPage />} />
      <Route path="/subscription/fail" element={<PaymentFailPage />} />
    </Routes>
  );
}

