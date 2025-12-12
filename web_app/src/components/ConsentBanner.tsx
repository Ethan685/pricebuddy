import { useState } from 'react';
import { X, Cookie, ShieldCheck } from 'lucide-react';

export function ConsentBanner() {
    const [isVisible, setIsVisible] = useState(() => {
        return !localStorage.getItem('pb_consent_v1');
    });

    const handleAccept = () => {
        localStorage.setItem('pb_consent_v1', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('pb_consent_v1', 'declined');
        // In real app, disable tracking pixels here
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#161B22] border-t border-[#30363D] p-6 z-50 shadow-2xl animate-slide-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-900/20 rounded-xl text-[#4F7EFF] hidden md:block">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                            <Cookie className="w-5 h-5 text-[#E6EDF3] md:hidden" />
                            We value your privacy
                        </h3>
                        <p className="text-[#9BA7B4] text-sm leading-relaxed max-w-2xl">
                            We use cookies to enhance your experience, analyze site traffic, and deliver personalized content.
                            By clicking "Accept All", you consent to our use of cookies.
                            See our <a href="/legal" className="text-[#4F7EFF] underline hover:text-blue-400">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDecline}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-[#30363D] text-[#E6EDF3] font-medium hover:bg-[#30363D] transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-[#1F6FEB] text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="md:hidden absolute top-4 right-4 text-[#9BA7B4]"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
