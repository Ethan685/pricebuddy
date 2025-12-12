import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../api/api';
import { tokens } from '../../../theme/tokens';
import { TrendingDown, TrendingUp, Minus, ThumbsUp, ThumbsDown, Bell, X, Heart } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useLanguage } from '../../../contexts/LanguageContext';
import { clientV1 } from '../../../api/client-v1';

import { ShareButton } from '../../../components/ShareButton';
import { SocialShare } from '../../../components/SocialShare';
import { PriceTrendChart } from '../../../components/PriceTrendChart';

import { useProductDetail, useProductInsights } from '../api/useProductDetail';

export const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLanguage();

    // 1. Fetch Product Data
    const { data: detailData, isLoading: loadingProduct } = useProductDetail(id || '');

    // Construct derived state (safe defaults)
    const product = detailData?.product || null;
    const offers = detailData?.offers || [];
    const priceHistory = detailData?.priceHistory || [];

    // 2. Fetch AI Insights (Dependent on product/history)
    // We pass mock reviews if real ones aren't available yet
    const { data: insights } = useProductInsights(
        id || '',
        priceHistory,
        ["Excellent value.", "Good battery.", "Fast shipping."] // TODO: Fetch real reviews
    );

    const prediction = insights?.prediction;
    const reviewAnalysis = insights?.reviewAnalysis;
    const promoVariant = insights?.promo;

    // Alert Modal State
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [targetPrice, setTargetPrice] = useState<number | string>('');
    const [inWishlist, setInWishlist] = useState(false);

    // Initial Targe Price Effect
    useEffect(() => {
        if (product) {
            setTargetPrice(Math.round(product.minPrice * 0.9));
            api.logEvent('view_item', { productId: product.id, title: product.title });
        }
    }, [product?.id]);

    const loading = loadingProduct;

    const handleSetAlert = async () => {
        if (!product || !id) return;
        const auth = getAuth();
        if (!auth.currentUser) {
            alert("Please login to set alerts");
            return;
        }

        try {
            await api.createPriceAlert(id, Number(targetPrice), product.minPrice);
            alert("Price Alert Set!");
            setShowAlertModal(false);
        } catch (e) {
            console.error(e);
            alert("Failed to set alert");
        }
    };

    const toggleWishlist = async () => {
        if (!product) return;
        try {
            const res = await api.toggleWishlist(product.id, {
                title: product.title,
                price: product.minPrice,
                image: product.images[0]
            });
            setInWishlist(res.added);
            alert(res.message);
        } catch (e) {
            alert("Login to use Wishlist");
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0B1117] text-white flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen bg-[#0B1117] text-white flex items-center justify-center">Product not found</div>;

    const renderSignalParams = () => {
        if (!prediction) return null;
        switch (prediction.signal) {
            case 'BUY_NOW': return { color: tokens.color.success, icon: <TrendingDown />, text: "BUY NOW" };
            case 'WAIT': return { color: tokens.color.warning, icon: <TrendingUp />, text: "WAIT" };
            default: return { color: tokens.color.muted, icon: <Minus />, text: "NEUTRAL" };
        }
    };
    const signal = renderSignalParams();

    return (
        <div style={{ padding: '20px', backgroundColor: tokens.color.bg, minHeight: '100vh', color: tokens.color.text, maxWidth: '1200px', margin: '0 auto' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="relative overflow-hidden rounded-2xl bg-[#161B22] border border-[#30363D] aspect-square flex items-center justify-center group">
                        {(product.images?.[0] || product.imageUrl || product.image) ? (
                            <img
                                src={product.images?.[0] || product.imageUrl || product.image}
                                alt={product.title}
                                className="max-w-full max-h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '48px', color: tokens.color.muted }}>Image Placeholder</span>
                        )}
                        <span className="hidden text-4xl text-gray-600">🖼️</span>
                    </div>
                </div>

                <div>
                    <h1 style={{ fontSize: tokens.typography.display, marginBottom: '8px', lineHeight: 1.2 }}>{product.title}</h1>

                    {/* Merchant / Platform Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-[#E6EDF3]">
                            <span>🛍️</span>
                            <span className="font-bold">{offers.length > 0 ? offers[0].merchantName : 'Unknown Merchant'}</span>
                        </div>
                        <div className="bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-[#E6EDF3]">
                            <span>🇯🇵</span>
                            <span>Direct Import from Japan</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div style={{ fontSize: '32px', color: tokens.color.brand, fontWeight: 'bold' }}>
                            {product.minPrice.toLocaleString()} {product.currency}
                        </div>
                        <ShareButton productId={product.id} title={product.title} />
                        <button
                            onClick={() => setShowAlertModal(true)}
                            className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] hover:border-[#4F7EFF] px-4 py-2 rounded-full transition-colors text-sm font-bold"
                        >
                            <Bell size={16} className="text-[#4F7EFF]" />
                            {t('product.track')}
                        </button>
                    </div>

                    {/* 💰 CASHBACK DISPLAY */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">💰</span>
                            <div>
                                <div className="text-lg font-bold text-green-400">
                                    구매 시 {Math.round(product.minPrice * 0.05).toLocaleString()} {product.currency} 캐시백!
                                </div>
                                <div className="text-sm text-[#9BA7B4]">
                                    구매 후 자동 지급 (출금 가능)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🎁 SOCIAL SHARE REWARD (NEW) */}
                    <SocialShare
                        productId={product.id}
                        productTitle={product.title}
                        productPrice={product.minPrice}
                        productImage={product.images?.[0] || product.imageUrl}
                    />

                    {/* 🛒 ENHANCED BUY BUTTON */}
                    <div className="flex gap-3 mb-8">
                        {offers.length > 0 && (
                            <a
                                href={offers[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => api.logEvent('click_affiliate', { productId: id, merchant: offers[0].merchantName })}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg text-center flex items-center justify-center gap-2"
                            >
                                🛒 최저가로 바로 구매하기
                            </a>
                        )}
                        <button
                            onClick={toggleWishlist}
                            className={`px-4 rounded-lg border border-[#30363D] hover:border-[#F85149] hover:text-[#F85149] transition-colors ${inWishlist ? 'text-[#F85149] border-[#F85149]' : 'text-[#9BA7B4]'}`}
                        >
                            <Heart className={inWishlist ? "fill-current" : ""} />
                        </button>
                    </div>

                    {prediction && signal && (
                        <>
                            <div style={{
                                backgroundColor: '#161B22',
                                border: `1px solid ${signal.color}`,
                                borderRadius: tokens.radius.card,
                                padding: '20px',
                                marginBottom: '24px'
                            }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span style={{ color: signal.color }}>{signal.icon}</span>
                                    <span style={{ color: signal.color, fontWeight: 'bold', fontSize: '18px' }}>
                                        {t('product.ai_signal')}: {signal.text}
                                    </span>
                                    <span className="text-xs text-[#9BA7B4] ml-auto">Confidence: {Math.round(prediction.confidence * 100)}%</span>
                                </div>
                                <p className="text-[#E6EDF3] mb-2">{prediction.reason}</p>
                                {prediction.targetPrice && (
                                    <p className="text-sm text-[#9BA7B4]">{t('product.target_price')}: {prediction.targetPrice.toLocaleString()} {product.currency}</p>
                                )}
                            </div>

                            {/* 🔔 SMART ALERT RECOMMENDATION */}
                            {prediction.recommendation === 'wait' && (
                                <div className="bg-orange-500/10 border border-orange-500 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📉</span>
                                        <div className="flex-1">
                                            <div className="font-bold text-orange-400 mb-2">
                                                AI 추천: 가격 하락 예상
                                            </div>
                                            <p className="text-sm text-[#9BA7B4] mb-3">
                                                지금 구매하면 손해! 더 저렴해질 수 있어요.
                                            </p>
                                            <button
                                                onClick={() => setShowAlertModal(true)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <Bell size={16} />
                                                가격 하락 시 알림받기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* 🎰 SMART PROMO BANNER (Bandit Engine) */}
                    {promoVariant && (
                        <div
                            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 rounded-xl p-6 mb-8 cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => {
                                clientV1.trackPromoConversion(promoVariant.id);
                                alert(`Coupon Applied: ${promoVariant.text}`);
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">🎁</span>
                                    <div>
                                        <div className="text-sm text-purple-400 font-bold mb-1">Recommended for You</div>
                                        <div className="text-xl font-bold text-white">{promoVariant.text}</div>
                                    </div>
                                </div>
                                <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold transition-colors">
                                    Claim Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Price Chart with Forecast */}
                    <div className="mb-8">
                        <PriceTrendChart
                            title="Price History & AI Forecast"
                            data={[
                                ...priceHistory.map(p => ({ date: new Date(p.date).toLocaleDateString(), price: p.price, merchant: p.merchant })),
                                ...(prediction?.forecast || []).map((p: any) => ({
                                    date: new Date(p.ts).toLocaleDateString(),
                                    forecastPrice: p.price,
                                    merchant: 'AI Forecast'
                                }))
                            ]}
                        />
                    </div>

                    {/* Review Analysis */}
                    {reviewAnalysis && (
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: tokens.typography.title, marginBottom: '12px' }}>{t('product.analysis')}</h2>
                            <div className="bg-[#161B22] p-4 rounded-xl border border-[#30363D] mb-4">
                                <p className="text-lg font-medium mb-3">"{reviewAnalysis.summary}"</p>
                                <div className="flex flex-wrap gap-2">
                                    {reviewAnalysis.clusters.map((cluster: any) => (
                                        <div key={cluster.topic} className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2
                                            ${cluster.sentiment === 'positive' ? 'bg-[#238636]/20 text-[#3FB950]' :
                                                cluster.sentiment === 'negative' ? 'bg-[#DA3633]/20 text-[#F85149]' : 'bg-[#30363D] text-[#9BA7B4]'}`}>
                                            {cluster.sentiment === 'positive' ? <ThumbsUp size={14} /> : cluster.sentiment === 'negative' ? <ThumbsDown size={14} /> : null}
                                            {cluster.topic}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Offers */}
                    <h2 style={{ fontSize: tokens.typography.title, marginBottom: '12px' }}>Offers</h2>
                    {offers.map((offer, index) => (
                        <div key={`${offer.id}-${index}`} style={{
                            backgroundColor: tokens.color.card,
                            padding: '16px',
                            marginBottom: 'px',
                            borderRadius: tokens.radius.card,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: `1px solid ${offer.totalPrice === product.minPrice ? tokens.color.brand : '#30363D'}`
                        }}>
                            <div>
                                <span style={{ fontSize: tokens.typography.body, display: 'block' }}>{offer.merchantName}</span>
                                {offer.totalPrice === product.minPrice && <span className="text-xs text-[#4F7EFF] font-bold">{t('product.best_price')}</span>}
                            </div>
                            <span style={{ fontSize: tokens.typography.body, fontWeight: 'bold' }}>
                                {(offer.totalPrice || offer.price || product.minPrice || 0).toLocaleString()} {product.currency}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Alert Modal */}
            {
                showAlertModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#161B22] w-full max-w-sm rounded-2xl border border-[#30363D] p-6 shadow-2xl animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Bell className="text-[#4F7EFF]" />
                                    {t('product.set_alert')}
                                </h3>
                                <button onClick={() => setShowAlertModal(false)} className="text-[#9BA7B4] hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2 text-[#9BA7B4]">{t('product.target_price')}</label>
                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4F7EFF]"
                                    placeholder="Enter target price"
                                />
                                <p className="text-xs text-[#9BA7B4] mt-2">
                                    Current: {product.minPrice.toLocaleString()} {product.currency}
                                </p>
                            </div>
                            <button
                                onClick={handleSetAlert}
                                className="w-full bg-[#4F7EFF] hover:bg-[#6B93FF] text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                {t('product.set_alert')}
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
