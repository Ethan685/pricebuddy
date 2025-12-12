import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/api';

interface ShareButtonProps {
    productId: string;
    title: string;
    text?: string;
}

export function ShareButton({ productId, title, text }: ShareButtonProps) {
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        const url = api.getShareUrl(productId);
        const shareData = {
            title: title,
            text: text || `Check out this deal on PriceBuddy!`,
            url: url
        };

        try {
            if (navigator.share && /mobile/i.test(navigator.userAgent)) {
                await navigator.share(shareData);
                setShared(true);
            } else {
                await navigator.clipboard.writeText(url);
                setShared(true);
                // Fallback alert or toast could go here
            }

            setTimeout(() => setShared(false), 2000);
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all duration-300 ${shared
                ? 'bg-[#238636] text-white border border-[#238636]'
                : 'bg-[#161B22] border border-[#30363D] text-[#E6EDF3] hover:border-[#4F7EFF] hover:text-[#4F7EFF]'
                }`}
        >
            {shared ? <Check size={16} /> : <Share2 size={16} />}
            {shared ? 'Copied!' : 'Share'}
        </button>
    );
}
