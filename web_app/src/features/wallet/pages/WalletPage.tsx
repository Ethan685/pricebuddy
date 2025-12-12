import React, { useState } from 'react';
import { Wallet, ArrowUpRight, Clock } from 'lucide-react';





import { useWallet, useWalletLimits, useWithdraw, useSimulateCashback } from '../api/useWallet';

export const WalletPage: React.FC = () => {
    // TanStack Query Hooks
    const { data: wallet, isLoading: loadingWallet } = useWallet();
    const { data: limits } = useWalletLimits();

    // Mutations
    const withdrawMutation = useWithdraw();
    const simulateMutation = useSimulateCashback();

    const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);

    // Derived state for UI safety
    const safeWallet = wallet || { balance: 0, pending: 0, currency: 'KRW' };
    const usageLimits = limits || { withdrawals: 0, maxWithdrawals: 10, totalAmount: 0, maxAmount: 500000 };

    // Toast notifications
    const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' }>>([]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => {
            const newToasts = [...prev, { id, message, type }];
            return newToasts.slice(-3);
        });
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const handleWithdraw = async () => {
        if (withdrawAmount < 10000) {
            alert('Minimum withdrawal is 10,000 KRW');
            return;
        }

        withdrawMutation.mutate(withdrawAmount, {
            onSuccess: () => {
                showToast('✅ Withdrawal successful!', 'success');
                setWithdrawAmount(10000);
            },
            onError: (err: any) => {
                console.error('Withdrawal error:', err);
                showToast(`❌ ${err.message || 'Withdrawal failed'}`, 'error');
            }
        });
    };

    const handleSimulateEarn = () => {
        simulateMutation.mutate(undefined, {
            onSuccess: () => showToast('💰 Simulated 5,000 KRW Earned!', 'success'),
            onError: () => showToast('❌ Simulation failed', 'error')
        });
    };

    const loading = loadingWallet;
    const withdrawing = withdrawMutation.isPending;

    if (loading) return <div className="p-8 text-center text-[#9BA7B4]">Loading wallet...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-[#E6EDF3] mb-6 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-[#4F7EFF]" />
                My Wallet
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Balance Card */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                    <div className="text-[#9BA7B4] text-sm mb-1">Available Balance</div>
                    <div className="text-3xl font-bold text-[#E6EDF3] mb-4">
                        {(safeWallet.balance || 0).toLocaleString()} <span className="text-lg text-[#9BA7B4]">{safeWallet.currency}</span>
                    </div>

                    <div className="mb-4">
                        <label className="text-xs text-[#9BA7B4] block mb-1">Withdraw Amount</label>
                        <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-white focus:border-[#4F7EFF] focus:outline-none"
                        />
                    </div>

                    {/* Usage Limits */}
                    <div className="bg-[#0D1117] p-3 rounded-lg border border-[#30363D] mb-4 space-y-2">
                        <div className="text-xs text-[#9BA7B4] font-bold uppercase tracking-wide mb-2">Daily Limits</div>

                        {/* Withdrawal Count */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#9BA7B4]">Withdrawals</span>
                                <span className={`font-mono font-bold ${usageLimits.withdrawals >= usageLimits.maxWithdrawals
                                    ? 'text-[#F85149]'
                                    : usageLimits.withdrawals >= 7
                                        ? 'text-[#D29922]'
                                        : 'text-[#238636]'
                                    }`}>
                                    {usageLimits.withdrawals}/{usageLimits.maxWithdrawals}
                                </span>
                            </div>
                            <div className="bg-[#161B22] rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all ${usageLimits.withdrawals >= usageLimits.maxWithdrawals
                                        ? 'bg-[#F85149]'
                                        : usageLimits.withdrawals >= 7
                                            ? 'bg-[#D29922]'
                                            : 'bg-[#238636]'
                                        }`}
                                    style={{ width: `${(usageLimits.withdrawals / usageLimits.maxWithdrawals) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Amount Limit */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-[#9BA7B4]">Amount</span>
                                <span className={`font-mono font-bold ${usageLimits.totalAmount >= usageLimits.maxAmount
                                    ? 'text-[#F85149]'
                                    : usageLimits.totalAmount >= 350000
                                        ? 'text-[#D29922]'
                                        : 'text-[#238636]'
                                    }`}>
                                    ₩{usageLimits.totalAmount.toLocaleString()}/₩500,000
                                </span>
                            </div>
                            <div className="bg-[#161B22] rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all ${usageLimits.totalAmount >= usageLimits.maxAmount
                                        ? 'bg-[#F85149]'
                                        : usageLimits.totalAmount >= 350000
                                            ? 'bg-[#D29922]'
                                            : 'bg-[#238636]'
                                        }`}
                                    style={{ width: `${(usageLimits.totalAmount / usageLimits.maxAmount) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleWithdraw}
                        disabled={(wallet.balance || 0) < 10000 || withdrawing}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${(wallet.balance || 0) >= 10000
                            ? 'bg-[#4F7EFF] hover:bg-[#3E63DD] text-white'
                            : 'bg-[#30363D] text-[#9BA7B4] cursor-not-allowed'
                            }`}
                    >
                        {withdrawing ? 'Processing...' : 'Withdraw Funds'}
                        {!withdrawing && <ArrowUpRight className="w-4 h-4" />}
                    </button>
                    <div className="mt-3 text-xs text-[#9BA7B4] text-center">
                        Minimum withdrawal amount: 10,000 {wallet.currency}
                    </div>
                </div>

                {/* Pending / Simulation Card */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6">
                    <div className="text-[#9BA7B4] text-sm mb-1">Pending Cashback</div>
                    <div className="text-3xl font-bold text-[#E6EDF3] mb-4">
                        {(safeWallet.pending || 0).toLocaleString()} <span className="text-lg text-[#9BA7B4]">{safeWallet.currency}</span>
                    </div>

                    <div className="bg-[#121820] p-4 rounded-lg border border-[#30363D]">
                        <div className="text-xs text-[#9BA7B4] mb-2 uppercase tracking-wide font-bold">Dev Tools</div>
                        <button
                            onClick={handleSimulateEarn}
                            className="w-full py-2 bg-[#12B981] hover:bg-[#0EA5E9] text-white border border-[#12B981] rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-cyan-500/20"
                        >
                            + Simulate 5,000 KRW Earning
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Placeholder */}
            {/* In a real app, mapping existing transactions would go here */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#30363D] font-semibold text-[#E6EDF3]">
                    Recent Transactions
                </div>
                <div className="p-6 text-center text-[#9BA7B4] py-12">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No recent transactions found.
                </div>
            </div>

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            px-4 py-3 rounded-lg shadow-lg max-w-sm
                            animate-fade-in-up
                            ${toast.type === 'success'
                                ? 'bg-[#238636] border border-[#2EA043] text-white'
                                : 'bg-[#DA3633] border border-[#F85149] text-white'
                            }
                        `}
                        style={{
                            animation: 'slideInRight 0.3s ease-out'
                        }}
                    >
                        <div className="flex items-start gap-2">
                            <div className="flex-1 whitespace-pre-line text-sm font-medium">
                                {toast.message}
                            </div>
                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="text-white/80 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WalletPage;
