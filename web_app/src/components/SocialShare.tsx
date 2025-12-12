import React, { useState } from 'react';
import { Share2, Check, Gift } from 'lucide-react';
/* import { api } from '../api/api'; */

interface SocialShareProps {
    productId: string;
    productTitle: string;
    productPrice: number;
    productImage?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
    productId,
    productTitle,
    productPrice,
    productImage
}) => {
    const [shared, setShared] = useState(false);
    const [reward, setReward] = useState(0);

    const sharePrice = Math.round(productPrice * 0.9); // 10% 할인가
    const cashbackReward = 1000; // ₩1,000 캐시백

    const handleKakaoShare = async () => {
        // Kakao Share API
        if (window.Kakao) {
            try {
                window.Kakao.Share.sendDefault({
                    objectType: 'feed',
                    content: {
                        title: `🔥 ${productTitle}`,
                        description: `PriceBuddy에서 최저가 발견! ₩${sharePrice.toLocaleString()}`,
                        imageUrl: productImage || 'https://via.placeholder.com/300',
                        link: {
                            mobileWebUrl: `${window.location.origin}/product/${productId}`,
                            webUrl: `${window.location.origin}/product/${productId}`,
                        },
                    },
                    buttons: [
                        {
                            title: '최저가 확인하기',
                            link: {
                                mobileWebUrl: `${window.location.origin}/product/${productId}`,
                                webUrl: `${window.location.origin}/product/${productId}`,
                            },
                        },
                    ],
                });

                // 공유 성공 시 캐시백 지급
                // await api.addCashback(cashbackReward, 'social_share', productId);
                setReward(cashbackReward);
                setShared(true);

                // 3초 후 리셋
                setTimeout(() => setShared(false), 3000);
            } catch (error) {
                console.error('Share failed:', error);
            }
        } else {
            // Fallback: 일반 공유
            const shareUrl = `${window.location.origin}/product/${productId}`;
            const shareText = `🔥 ${productTitle} - 최저가 ₩${sharePrice.toLocaleString()}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: shareText,
                        url: shareUrl
                    });

                    // Mock API call
                    console.log(`Shared via Web Share API, reward: ${cashbackReward}`);
                    // await api.addCashback(cashbackReward, 'social_share', productId);
                    alert(`Shared via Web Share API! +${cashbackReward} KRW Cashback (Mock)`);
                    setReward(cashbackReward);
                    setShared(true);
                    setTimeout(() => setShared(false), 3000);
                } catch (error) {
                    console.error('Share failed:', error);
                }
            } else {
                // Copy to clipboard
                navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                alert('링크가 복사되었습니다!');
            }
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Gift className="text-purple-400" size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">
                        친구에게 공유하고 ₩{cashbackReward.toLocaleString()} 받기!
                    </h3>
                    <p className="text-sm text-[#9BA7B4] mb-3">
                        카카오톡으로 공유하면 즉시 캐시백 지급 (출금 가능)
                    </p>

                    {shared ? (
                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 flex items-center gap-2">
                            <Check className="text-green-400" size={20} />
                            <div>
                                <div className="font-bold text-green-400">
                                    ₩{reward.toLocaleString()} 캐시백 지급 완료!
                                </div>
                                <div className="text-xs text-[#9BA7B4]">
                                    지갑에서 확인하세요
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleKakaoShare}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <Share2 size={18} />
                            카카오톡으로 공유하고 ₩{cashbackReward.toLocaleString()} 받기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Kakao SDK 초기화 (index.html에 추가 필요)
declare global {
    interface Window {
        Kakao: any;
    }
}
