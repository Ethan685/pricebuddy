import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { api } from '../api/api';
import { User, Copy, Ticket, Gift, Medal, Shield, Zap, Award, Truck, Package } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserData = any;

const BADGE_CONFIG: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
    'early_adopter': { label: 'Early Adopter', color: 'text-blue-400', icon: <Zap size={16} /> },
    'vip_member': { label: 'VIP Member', color: 'text-yellow-400', icon: <Medal size={16} /> },
    'community_builder': { label: 'Community Builder', color: 'text-green-400', icon: <Ticket size={16} /> },
    'deal_hunter': { label: 'Deal Hunter', color: 'text-purple-400', icon: <Award size={16} /> }
};

export function ProfilePage() {
    const [user, setUser] = useState<UserData>(null);
    const [userData, setUserData] = useState<UserData>(null);
    const [wallet, setWallet] = useState<UserData>(null);
    const [referralCode, setReferralCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loadingRef, setLoadingRef] = useState(false);

    // Tracking State
    const [trackingNo, setTrackingNo] = useState('');
    const [carrier, setCarrier] = useState('cj_logistics');
    const [trackResult, setTrackResult] = useState<any>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsub = auth.onAuthStateChanged((u) => {
            setUser(u);
            if (u) {
                // Fetch Profile
                const unsubProfile = onSnapshot(doc(db, 'users', u.uid), (docVal) => {
                    const data = docVal.data();
                    setUserData(data);
                    if (data?.referralCode) setReferralCode(data.referralCode);
                });

                // Fetch Wallet
                const unsubWallet = onSnapshot(doc(db, 'cashback_wallet', u.uid), (doc) => {
                    setWallet(doc.data());
                });

                // Check Badges on load
                api.checkBadges();

                return () => { unsubProfile(); unsubWallet(); };
            }
        });
        return () => unsub();
    }, []);

    const handleGenerateCode = async () => {
        try {
            const res = await api.createReferralCode();
            setReferralCode(res.code);
        } catch (e) {
            console.error(e);
            alert("Failed to generate code");
        }
    };

    const handleRedeem = async () => {
        if (!inputCode) return;
        setLoadingRef(true);
        try {
            const res = await api.redeemReferral(inputCode);
            alert(res.message);
            setInputCode('');
        } catch (e: unknown) {
            console.error(e);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((e as any).message || "Redemption failed");
        }
        setLoadingRef(false);
    };

    if (!user) return <div className="min-h-screen bg-[#0B1117] text-white flex items-center justify-center">Please login</div>;

    return (
        <div className="min-h-screen bg-[#0B1117] text-[#E6EDF3] py-10">
            <Helmet>
                <title>Profile - PriceBuddy</title>
            </Helmet>

            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="bg-[#161B22] p-4 rounded-full border border-[#30363D]">
                        <User size={48} className="text-[#4F7EFF]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{userData?.displayName || user.email}</h1>
                        <p className="text-[#9BA7B4] flex items-center gap-2">
                            {userData?.role === 'pro' && <span className="bg-[#1F6FEB] px-2 py-0.5 rounded text-xs text-white font-bold">PRO</span>}
                            {userData?.role === 'pro_plus' && <span className="bg-[#A371F7] px-2 py-0.5 rounded text-xs text-white font-bold">PRO+</span>}
                            Member since {userData?.createdAt?.toDate().toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Wallet & Stats */}
                    <div className="space-y-6">
                        <section className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Ticket className="text-[#238636]" /> Wallet Balance
                            </h2>
                            <div className="text-4xl font-bold text-white mb-2">
                                ₩{(wallet?.balance || 0).toLocaleString()}
                            </div>
                            <p className="text-sm text-[#9BA7B4]">Pending: ₩{(wallet?.pending || 0).toLocaleString()}</p>
                        </section>

                        {/* PRO+ Delivery Tracking */}
                        {(userData?.role === 'pro_plus' || userData?.role === 'admin') && (
                            <section className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#A371F7]">
                                    <Truck className="text-[#A371F7]" /> Delivery Tracking
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <select
                                            className="bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-[#E6EDF3]"
                                            value={carrier}
                                            onChange={(e) => setCarrier(e.target.value)}
                                        >
                                            <option value="cj_logistics">CJ Korea Express</option>
                                            <option value="epost">Korea Post</option>
                                            <option value="lotte">Lotte Global</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Tracking Number"
                                            className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-[#E6EDF3]"
                                            value={trackingNo}
                                            onChange={(e) => setTrackingNo(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="w-full bg-[#A371F7] hover:bg-[#8957E5] text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                                        disabled={!trackingNo || trackingLoading}
                                        onClick={async () => {
                                            setTrackingLoading(true);
                                            try {
                                                const res = await api.trackPackage(carrier, trackingNo);
                                                setTrackResult(res.events[0]); // Show latest event
                                            } catch (e: any) {
                                                alert(e.message);
                                            } finally {
                                                setTrackingLoading(false);
                                            }
                                        }}
                                    >
                                        {trackingLoading ? 'Tracking...' : 'Track Package'}
                                    </button>

                                    {trackResult && (
                                        <div className="bg-[#0D1117] p-3 rounded-lg border border-[#30363D] space-y-2 animate-fade-in-up">
                                            <div className="flex items-center gap-2 text-[#A371F7] font-bold text-sm">
                                                <Package size={16} /> {trackResult.status}
                                            </div>
                                            <div className="text-xs text-[#9BA7B4]">
                                                {trackResult.location} • {new Date(trackResult.time).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-[#E6EDF3]">{trackResult.description}</div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        <section className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Shield className="text-[#A371F7]" /> Badges
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {userData?.badges?.map((badge: string) => (
                                    <div key={badge} className="bg-[#0D1117] p-3 rounded-lg flex items-center gap-3 border border-[#30363D]">
                                        {BADGE_CONFIG[badge]?.icon || <Award />}
                                        <span className={`text-sm font-bold ${BADGE_CONFIG[badge]?.color || 'text-white'}`}>
                                            {BADGE_CONFIG[badge]?.label || badge}
                                        </span>
                                    </div>
                                ))}
                                {(!userData?.badges || userData.badges.length === 0) && (
                                    <p className="text-[#9BA7B4] text-sm col-span-2">No badges yet. Keep using app!</p>
                                )}
                            </div>
                        </section>

                        {/* Subscription Management */}
                        {(userData?.role === 'pro' || userData?.role === 'pro_plus') && (
                            <section className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Shield className="text-[#1F6FEB]" /> Subscription
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-[#0D1117] p-4 rounded-lg border border-[#30363D]">
                                        <div className="text-sm text-[#9BA7B4] mb-1">Current Plan</div>
                                        <div className="text-2xl font-bold text-white">
                                            {userData?.role === 'pro' ? 'PRO' : 'PRO+'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await api.createPortalSession();
                                                if (res.url) {
                                                    window.location.href = res.url;
                                                }
                                            } catch (e: any) {
                                                alert(e.message || 'Failed to open portal');
                                            }
                                        }}
                                        className="w-full bg-[#1F6FEB] hover:bg-[#1a5fcc] text-white font-bold py-3 rounded-lg transition-colors"
                                    >
                                        Manage Subscription
                                    </button>
                                    <p className="text-xs text-[#9BA7B4] text-center">
                                        Update payment method, change plan, or cancel subscription
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Referrals */}
                    <div className="space-y-6">
                        <section className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Gift size={120} />
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Gift className="text-[#F85149]" /> Invite Friends
                                </h2>
                                <div className="group relative">
                                    <div className="cursor-help w-6 h-6 rounded-full border border-[#30363D] flex items-center justify-center text-xs text-[#9BA7B4]">?</div>
                                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-[#30363D] rounded-lg text-sm text-[#E6EDF3] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-[#0D1117] z-10">
                                        Share your code with friends. When they enter it in their profile, both of you get 1,000 KRW Instantly!
                                    </div>
                                </div>
                            </div>
                            <p className="text-[#9BA7B4] mb-6">Earn 1,000 KRW for every friend you invite!</p>

                            {referralCode ? (
                                <div className="bg-[#0D1117] p-4 rounded-xl border border-[#30363D] flex items-center justify-between mb-6">
                                    <span className="text-2xl font-mono font-bold tracking-widest text-white">{referralCode}</span>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(referralCode)}
                                        className="text-[#4F7EFF] hover:text-white transition-colors"
                                    >
                                        <Copy />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerateCode}
                                    className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 rounded-xl font-bold mb-6 transition-colors"
                                >
                                    Generate My Code
                                </button>
                            )}

                            <div className="border-t border-[#30363D] pt-6">
                                <h3 className="font-bold mb-2">Redeem a Code</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputCode}
                                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-2 text-white font-mono focus:border-[#4F7EFF] focus:outline-none"
                                    />
                                    <button
                                        onClick={handleRedeem}
                                        disabled={loadingRef || !inputCode}
                                        className="bg-[#4F7EFF] hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold"
                                    >
                                        Redeem
                                    </button>
                                </div>
                                {userData?.redeemedReferral && (
                                    <p className="text-xs text-[#238636] mt-2 flex items-center gap-1">
                                        <Copy size={12} /> used code: {userData.redeemedCode}
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
