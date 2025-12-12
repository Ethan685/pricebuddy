import { useState, useEffect } from 'react';
import { X, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OnboardingGuide() {
    const [step, setStep] = useState(0);
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Skip onboarding on localhost to prevent annoyance during dev
        if (window.location.hostname === 'localhost') return;

        const seen = localStorage.getItem('pricebuddy_onboarding_v1');
        if (!seen) {
            // Delay slightly for dramatic effect
            const timer = setTimeout(() => setVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        localStorage.setItem('pricebuddy_onboarding_v1', 'done');
    };

    const handleNext = () => {
        if (step < 2) {
            setStep(s => s + 1);
        } else {
            handleDismiss();
        }
    };

    const steps = [
        {
            title: "Welcome to PriceBuddy",
            body: "Your AI-powered shopping assistant that helps you stop overpaying. Let's show you how to save.",
            icon: <div className="text-4xl">👋</div>,
            action: null
        },
        {
            title: "Smart AI Search",
            body: "Don't just search. Analyze. We track price history and predict if you should Buy Now or Wait.",
            icon: <Search size={48} className="text-[#4F7EFF]" />,
            action: () => navigate('/search')
        },
        {
            title: "Join the Community",
            body: "Find real-time hot deals shared by other smart shoppers. Vote on deals and earn badges.",
            icon: <Users size={48} className="text-[#A371F7]" />,
            action: () => navigate('/community')
        }
    ];

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-[#161B22] border border-[#30363D] p-8 rounded-2xl max-w-md w-full shadow-2xl relative">
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-[#9BA7B4] hover:text-white"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-[#0D1117] rounded-full flex items-center justify-center mb-6 border border-[#30363D]">
                        {steps[step].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{steps[step].title}</h2>
                    <p className="text-[#9BA7B4] text-lg leading-relaxed">{steps[step].body}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        {[0, 1, 2].map(i => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#4F7EFF]' : 'w-2 bg-[#30363D]'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={handleNext}
                        className="bg-[#1F6FEB] hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                    >
                        {step === 2 ? "Get Started" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}
