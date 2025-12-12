import React from 'react';
import { Check, X, Zap } from 'lucide-react';
import { api } from '../api/api';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// import { tokens } from '../theme/tokens';

export const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const handleUpgrade = async (planId: string) => {
        if (!auth.currentUser) {
            alert("Please login first");
            navigate('/login');
            return;
        }

        try {
            // Updated for v2.0 Real Stripe
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await api.createCheckoutSession(planId) as any;

            if (response && response.url) {
                window.location.href = response.url;
            } else {
                // Fallback for mock mode if URL is missing (won't happen in prod logic)
                alert(`Successfully upgraded to ${planId.toUpperCase()}!`);
                navigate('/profile');
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert("Upgrade failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1117] text-[#E6EDF3] py-20 px-4">
            <div className="max-w-6xl mx-auto text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-[#9BA7B4]">Choose the plan that fits your shopping style.</p>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8 flex flex-col">
                    <h3 className="text-2xl font-bold mb-2">Free</h3>
                    <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-[#9BA7B4] font-normal">/mo</span></div>
                    <p className="text-[#9BA7B4] mb-8">Essential tools for casual shoppers.</p>

                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="Global Price Comparison" />
                        <FeatureItem text="Price History Checks" />
                        <FeatureItem text="5 Price Alerts" />
                        <FeatureItem text="Cashback Rewards" />
                        <FeatureItem text="AI Predictions" included={false} />
                        <FeatureItem text="Unlimited Alerts" included={false} />
                    </div>

                    <button className="w-full py-4 rounded-xl border border-[#30363D] font-bold text-[#E6EDF3] hover:bg-[#21262D] transition-colors">
                        Current Plan
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-[#161B22] border border-[#4F7EFF] rounded-2xl p-8 flex flex-col relative transform scale-105 shadow-2xl shadow-blue-900/20">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#4F7EFF] text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                        Most Popular
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-[#4F7EFF]">Pro</h3>
                    <div className="text-4xl font-bold mb-6">$4.99<span className="text-lg text-[#9BA7B4] font-normal">/mo</span></div>
                    <p className="text-[#9BA7B4] mb-8">Power tools for smart shoppers & deal hunters.</p>

                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="Everything in Free" />
                        <FeatureItem text="Unlimited Price Alerts" highlight />
                        <FeatureItem text="AI Price Prediction" highlight />
                        <FeatureItem text="SKU Matching & Compare" highlight />
                        <FeatureItem text="Priority Support" />
                        <FeatureItem text="Ad-Free Experience" />
                    </div>

                    <button
                        onClick={() => handleUpgrade('pro')}
                        className="w-full py-4 rounded-xl bg-[#4F7EFF] hover:bg-[#4F7EFF]/90 font-bold text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap size={20} className="fill-current" />
                        Upgrade to Pro
                    </button>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8 flex flex-col">
                    <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                    <div className="text-4xl font-bold mb-6">$99<span className="text-lg text-[#9BA7B4] font-normal">/mo</span></div>
                    <p className="text-[#9BA7B4] mb-8">For resellers and businesses monitoring scale.</p>

                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="Everything in Pro" />
                        <FeatureItem text="Bulk SKU Monitoring (1k+)" />
                        <FeatureItem text="API Access" />
                        <FeatureItem text="Export to CSV/PDF" />
                        <FeatureItem text="Dedicated Account Manager" />
                    </div>

                    <button
                        onClick={() => navigate('/b2b')}
                        className="w-full py-4 rounded-xl border border-[#30363D] font-bold text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
                    >
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text, included = true, highlight = false }: { text: string; included?: boolean; highlight?: boolean }) => (
    <div className={`flex items-center gap-3 ${included ? 'text-[#E6EDF3]' : 'text-[#484F58]'}`}>
        {included ? (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${highlight ? 'bg-[#4F7EFF] text-white' : 'bg-[#238636] text-white'}`}>
                <Check size={12} strokeWidth={4} />
            </div>
        ) : (
            <X size={20} />
        )}
        <span className={highlight ? 'font-bold text-white' : ''}>{text}</span>
    </div>
);
