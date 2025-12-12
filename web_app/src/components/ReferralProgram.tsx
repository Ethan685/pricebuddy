import React, { useState } from 'react';
import { Copy, Users, Check, Gift } from 'lucide-react';
/* import { api } from '../api/api'; */

export const ReferralProgram: React.FC = () => {
    const [referralCode, setReferralCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState({
        referrals: 0,
        totalEarned: 0,
        pendingRewards: 0
    });

    React.useEffect(() => {
        loadReferralData();
    }, []);

    const loadReferralData = async () => {
        // Commented out API call and using mock data
        // try {
        //     const data = await api.getReferralStats();
        //     setReferralCode(data.referralCode);
        //     setStats(data.stats);
        // } catch (error) {
        //     console.error('Failed to load referral data:', error);
        // }

        // Mock API data
        setReferralCode('PRICEBUDDY-VIP');
        setStats({
            referrals: 12, // Corresponds to totalReferrals in mock
            totalEarned: 12000,
            pendingRewards: 3000 // Example mock value
        });
    };

    const copyReferralLink = () => {
        const referralLink = `${window.location.origin}?ref=${referralCode}`;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToKakao = () => {
        if (window.Kakao) {
            window.Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '🎁 PriceBuddy 가입하고 ₩3,000 받기!',
                    description: '가격비교 + AI 추천 + 캐시백까지! 지금 가입하고 즉시 ₩3,000 받으세요',
                    imageUrl: 'https://via.placeholder.com/300',
                    link: {
                        mobileWebUrl: `${window.location.origin}?ref=${referralCode}`,
                        webUrl: `${window.location.origin}?ref=${referralCode}`,
                    },
                },
                buttons: [
                    {
                        title: '₩3,000 받고 가입하기',
                        link: {
                            mobileWebUrl: `${window.location.origin}?ref=${referralCode}`,
                            webUrl: `${window.location.origin}?ref=${referralCode}`,
                        },
                    },
                ],
            });
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-500 rounded-2xl p-6 mb-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-3 rounded-full">
                    <Users className="text-purple-400" size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        친구 초대하고 함께 받기
                    </h2>
                    <p className="text-[#9BA7B4] text-sm">
                        친구도 ₩3,000, 나도 ₩5,000 캐시백!
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats.referrals}</div>
                    <div className="text-xs text-[#9BA7B4] mt-1">초대한 친구</div>
                </div>
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                        ₩{stats.totalEarned.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#9BA7B4] mt-1">총 받은 금액</div>
                </div>
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">
                        ₩{stats.pendingRewards.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#9BA7B4] mt-1">대기 중</div>
                </div>
            </div>

            {/* Referral Link */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-4">
                <label className="block text-sm font-bold text-[#9BA7B4] mb-2">
                    내 추천 링크
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={`${window.location.origin}?ref=${referralCode}`}
                        readOnly
                        className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-2 text-white text-sm"
                    />
                    <button
                        onClick={copyReferralLink}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? '복사됨!' : '복사'}
                    </button>
                </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={shareToKakao}
                    className="bg-[#FEE500] hover:bg-[#FDD835] text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    💬 카카오톡 공유
                </button>
                <button
                    onClick={copyReferralLink}
                    className="bg-[#161B22] border border-[#30363D] hover:border-purple-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Gift size={18} />
                    링크 복사
                </button>
            </div>

            {/* How it Works */}
            <div className="mt-6 p-4 bg-[#161B22] border border-[#30363D] rounded-xl">
                <h3 className="font-bold text-white mb-3 text-sm">🎁 작동 방식</h3>
                <div className="space-y-2 text-xs text-[#9BA7B4]">
                    <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">1.</span>
                        <span>친구가 당신의 링크로 가입</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">2.</span>
                        <span>친구가 첫 구매 시 <strong className="text-green-400">₩3,000</strong> 캐시백</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">3.</span>
                        <span>당신도 <strong className="text-green-400">₩5,000</strong> 캐시백 즉시 지급!</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
