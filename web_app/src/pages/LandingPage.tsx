import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { api } from '../api/api';
import type { Product } from '../types';
import { PriceCard } from '../components/PriceCard';
import { PremiumDeals } from '../components/PremiumDeals';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LandingPage() {
    const [feed, setFeed] = useState<Product[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const navigate = useNavigate();

    const { t } = useLanguage();

    useEffect(() => {
        api.getUserFeed().then(setFeed);
    }, []);

    return (
        <div className="min-h-screen bg-[#0B1117] text-[#E6EDF3]">
            <Helmet>
                <title>PriceBuddy - {t('hero.title')}</title>
                <meta name="description" content={t('hero.subtitle') || "Global Price Comparison, AI Predictions, and Cashback."} />
            </Helmet>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
                    <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-white sm:text-7xl whitespace-pre-line">
                        {t('hero.title')}
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-[#9BA7B4]">
                        {t('hero.subtitle')}
                    </p>

                    {/* Visual Search Lens */}
                    <div
                        className={`mt-10 max-w-2xl mx-auto bg-[#161B22] border-2 border-dashed ${isScanning ? 'border-[#4F7EFF] animate-pulse' : 'border-[#30363D] hover:border-[#4F7EFF]'} rounded-2xl p-8 transition-all cursor-pointer relative group overflow-hidden`}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#4F7EFF]', 'bg-[#1F6FEB]/10'); }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#4F7EFF]', 'bg-[#1F6FEB]/10'); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsScanning(true);
                            // Simulate scanning delay
                            setTimeout(() => {
                                navigate('/search?q=Sony+WH-1000XM5');
                            }, 2000);
                        }}
                    >
                        <div className="flex flex-col items-center gap-4 relative z-10">
                            <div className="p-4 bg-[#0D1117] rounded-full group-hover:scale-110 transition-transform">
                                {isScanning ? (
                                    <Loader2 className="w-8 h-8 text-[#4F7EFF] animate-spin" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F7EFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                )}
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {isScanning ? t('scanner.analyzing') : t('scanner.label')}
                                </h3>
                                <p className="text-[#9BA7B4] text-sm">
                                    {isScanning ? "Identifying product and matching prices..." : "Drag & Drop product image"}
                                </p>
                            </div>
                        </div>

                        {/* Scanning Beam Animation */}
                        {isScanning && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4F7EFF] to-transparent animate-[scan_2s_ease-in-out_infinite]" style={{ boxShadow: '0 0 15px #4F7EFF' }}></div>
                        )}
                    </div>

                    <div className="mt-10 flex justify-center gap-x-6">
                        <Link to="/search" className="rounded-full bg-[#4F7EFF] px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                            {t('hero.cta')}
                        </Link>
                        <a href="#" className="rounded-full bg-[#121A23] px-8 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-gray-700 hover:bg-gray-800">
                            Download Extension
                        </a>
                    </div>
                </div>
            </div>

            {/* Recommended Feed */}
            {feed.length > 0 && (
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <div className="mx-auto max-w-2xl lg:text-center mb-10">
                        <h2 className="text-base font-semibold leading-7 text-[#4F7EFF]">{t('feed.title')}</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Trending Deals</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {feed.map(product => (
                            <div key={product.id} onClick={() => navigate(`/product/${product.id}`, { state: { product } })} className="cursor-pointer hover:opacity-80 transition-opacity">
                                <PriceCard item={{ title: product.title, totalKRW: product.minPrice }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🔥 PREMIUM DEALS SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <PremiumDeals />
            </div>

            {/* How It Works Section */}
            <div className="bg-[#161B22]/50 border-y border-[#30363D] py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center mb-16">
                        <h2 className="text-base font-semibold leading-7 text-[#4F7EFF]">Simple Process</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">How PriceBuddy Works</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop Only) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-[#4F7EFF]/0 via-[#4F7EFF]/50 to-[#4F7EFF]/0 -translate-y-1/2 z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#0D1117] border-2 border-[#4F7EFF] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-blue-500/20">1</div>
                            <h3 className="text-xl font-bold text-white mb-3">Search or Paste</h3>
                            <p className="text-[#9BA7B4]">Search for a product or paste a URL from Coupang, Naver, or Amazon.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#0D1117] border-2 border-[#A371F7] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-purple-500/20">2</div>
                            <h3 className="text-xl font-bold text-white mb-3">Check AI Signal</h3>
                            <p className="text-[#9BA7B4]">Our AI analyzes price history to tell you: <span className="text-[#3FB950] font-bold">BUY</span> or <span className="text-[#F85149] font-bold">WAIT</span>.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#0D1117] border-2 border-[#3FB950] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-green-500/20">3</div>
                            <h3 className="text-xl font-bold text-white mb-3">Save & Earn</h3>
                            <p className="text-[#9BA7B4]">Buy at the lowest price and earn automatic cashback to your wallet.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-[#4F7EFF]">Shop Smarter</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to save money</p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                                Price History Charts
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[#9BA7B4]">
                                <p className="flex-auto">See the real price history. Know if today's "deal" is actually a deal.</p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                                AI Price Prediction
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[#9BA7B4]">
                                <p className="flex-auto">Our AI predicts if prices will drop soon. Should you buy now or wait?</p>
                            </dd>
                        </div>
                        <div className="flex flex-col">
                            <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                                Automatic Cashback
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-[#9BA7B4]">
                                <p className="flex-auto">Earn rewards just for shopping as you normally do. Withdraw to your bank.</p>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
