import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useLanguage } from "@/shared/context/LanguageContext";

interface OnboardingWizardProps {
    onComplete: (preferences: string[]) => void;
    onSkip: () => void;
}

const INTERESTS = [
    { id: "tech", label: "💻 Tech & Gadgets", icon: "💻" },
    { id: "fashion", label: "👗 Fashion", icon: "👗" },
    { id: "beauty", label: "💄 Beauty", icon: "💄" },
    { id: "home", label: "🏠 Home & Living", icon: "🏠" },
    { id: "gaming", label: "🎮 Gaming", icon: "🎮" },
    { id: "sports", label: "⚽ Sports", icon: "⚽" },
    { id: "baby", label: "👶 Baby & Kids", icon: "👶" },
    { id: "pet", label: "🐾 Pets", icon: "🐾" },
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const toggleInterest = (id: string) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(selectedInterests.filter((i) => i !== id));
        } else {
            setSelectedInterests([...selectedInterests, id]);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else {
            onComplete(selectedInterests);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />

            <Card className="w-full max-w-lg relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-surfaceHighlight">
                    <div
                        className="h-full bg-successNeon transition-all duration-500 ease-out"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    {step === 1 ? (
                        <div className="space-y-6 animate-slide-up">
                            <div className="text-center">
                                <div className="text-4xl mb-4 animate-bounce">👋</div>
                                <h2 className="text-3xl font-display font-bold mb-2 bg-gradient-to-r from-textMain to-primary bg-clip-text text-transparent">
                                    {t("onboarding.welcome.title") || "Welcome to PriceBuddy"}
                                </h2>
                                <p className="text-textMuted text-lg">
                                    {t("onboarding.welcome.desc") || "Let's personalize your shopping feed. What are you interested in?"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {INTERESTS.map((interest) => (
                                    <button
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`p-4 rounded-xl border transition-all duration-200 text-left flex items-center gap-3 ${selectedInterests.includes(interest.id)
                                                ? "border-primary bg-primary/10 shadow-neon-blue/20 shadow-inner"
                                                : "border-border bg-surfaceHighlight/50 hover:bg-surfaceHighlight"
                                            }`}
                                    >
                                        <span className="text-2xl">{interest.icon}</span>
                                        <span className={`font-medium ${selectedInterests.includes(interest.id) ? "text-primary" : "text-textMain"}`}>
                                            {interest.label}
                                        </span>
                                        {selectedInterests.includes(interest.id) && (
                                            <span className="ml-auto text-successNeon">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-slide-up text-center py-8">
                            <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-pulse-slow">
                                ✨
                            </div>
                            <div>
                                <h2 className="text-3xl font-display font-bold mb-4">
                                    {t("onboarding.ready.title") || "All Set!"}
                                </h2>
                                <p className="text-textMuted text-lg max-w-sm mx-auto">
                                    {t("onboarding.ready.desc") || "We've curated the best deals just for you. Happy shopping!"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border bg-surfaceHighlight/30 flex justify-between items-center backdrop-blur-md">
                    <button
                        onClick={onSkip}
                        className="text-textMuted hover:text-textMain text-sm font-medium px-4 py-2 hover:bg-surfaceHighlight rounded-lg transition-colors"
                    >
                        {t("common.skip") || "Skip for now"}
                    </button>

                    <Button
                        onClick={handleNext}
                        variant="primary"
                        className="px-8 shadow-neon-blue hover:scale-105 transition-transform"
                        disabled={step === 1 && selectedInterests.length === 0}
                    >
                        {step === 1 ? (t("common.next") || "Next") : (t("common.start") || "Get Started")} →
                    </Button>
                </div>
            </Card>
        </div>
    );
}
