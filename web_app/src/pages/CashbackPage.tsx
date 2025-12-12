import { useState, useEffect } from 'react';
import { db, functions } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { authService } from '../api/auth';
import { Wallet, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function CashbackPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [balance, setBalance] = useState({ amount: 0, currency: 'KRW' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [ledger, setLedger] = useState<any[]>([]);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        // 1. Listen to Wallet Balance
        // Better to direct doc listener
        const docUnsub = onSnapshot(query(collection(db, 'cashback_wallet'), where('__name__', '==', user.uid)), (snap) => {
            if (!snap.empty) {
                const data = snap.docs[0].data();
                setBalance({ amount: data.balance || 0, currency: data.currency || 'KRW' });
            }
        });

        // 2. Listen to Ledger
        const q = query(
            collection(db, 'cashback_ledger'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const ledgerUnsub = onSnapshot(q, (snapshot) => {
            setLedger(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            docUnsub();
            ledgerUnsub();
        };
    }, [user]);

    const handleSimulateEarn = async () => {
        if (!user) return;
        setProcessing(true);
        try {
            const simulate = httpsCallable(functions, 'simulateCashbackEarned');
            await simulate();
            // No need to manual update, listener calls
        } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(e);
            alert(`Error: ${e.message}`);
        }
        setProcessing(false);
    };

    const handleWithdraw = async () => {
        if (!user) return;
        const amount = prompt("Enter withdrawal amount (Min 10,000 KRW):", "10000");
        if (!amount) return;

        setProcessing(true);
        try {
            const withdraw = httpsCallable(functions, 'requestWithdrawal');
            await withdraw({ amount: parseInt(amount) });
            alert("Withdrawal requested successfully!");
        } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(e);
            alert(`Withdrawal Failed: ${e.message}`);
        }
        setProcessing(false);
    };

    if (authLoading) return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center text-white">
                <Wallet className="w-16 h-16 text-[#4F7EFF] mb-4" />
                <h1 className="text-2xl font-bold mb-2">My Rewards</h1>
                <p className="text-[#9BA7B4] mb-6">Login to see your cashback balance.</p>
                <button
                    onClick={() => authService.signInWithGoogle()}
                    className="bg-[#4F7EFF] text-white px-6 py-3 rounded-xl font-bold"
                >
                    Sign In to View
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto text-[#E6EDF3] pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Wallet className="text-green-400" />
                    My Rewards
                </h1>
                <p className="text-[#9BA7B4]">Earn automatic cashback on your purchases.</p>
            </header>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#1F6FEB] to-[#4F7EFF] rounded-3xl p-8 mb-8 shadow-lg shadow-blue-900/20">
                <div className="text-blue-100 text-sm font-medium mb-1">Total Balance</div>
                <div className="text-4xl font-bold text-white mb-6">
                    ₩ {balance.amount.toLocaleString()}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleWithdraw}
                        disabled={processing || balance.amount < 10000}
                        className="flex-1 bg-white text-[#4F7EFF] py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Withdraw
                    </button>
                    {/* Dev Only Button */}
                    <button
                        onClick={handleSimulateEarn}
                        disabled={processing}
                        className="flex-1 bg-white/20 text-white py-3 rounded-xl font-bold hover:bg-white/30 transition-all backdrop-blur-sm border border-white/10"
                    >
                        + Simulate Earn
                    </button>
                </div>
                <div className="mt-4 text-xs text-blue-200 text-center">
                    Min. withdrawal 10,000 KRW
                </div>
            </div>

            {/* Active Offers */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#4F7EFF]" />
                Hot Cashback Deals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                    { id: '1', merchant: 'Coupang', rate: '2%', desc: 'On all electronics', color: 'bg-red-900/20 text-red-500' },
                    { id: '2', merchant: 'AliExpress', rate: '5%', desc: 'Super Choice Items', color: 'bg-orange-900/20 text-orange-500' },
                    { id: '3', merchant: '11st', rate: '1.5%', desc: 'Fashion category', color: 'bg-red-900/20 text-red-400' },
                    { id: '4', merchant: 'Gmarket', rate: '1%', desc: 'Smile Club members', color: 'bg-green-900/20 text-green-500' },
                ].map(offer => (
                    <div key={offer.id} className="bg-[#161B22] p-4 rounded-xl border border-[#30363D] flex justify-between items-center hover:bg-[#1C2128] transition-colors cursor-pointer" onClick={() => alert(`Redirecting to ${offer.merchant}... (Tracking Activated)`)}>
                        <div>
                            <div className="font-bold text-lg">{offer.merchant}</div>
                            <div className="text-xs text-[#9BA7B4]">{offer.desc}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-full font-bold text-sm ${offer.color}`}>
                            {offer.rate}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ledger */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-[#9BA7B4]" />
                Transaction History
            </h2>

            <div className="space-y-3">
                {ledger.map(entry => (
                    <div key={entry.id} className="bg-[#161B22] p-4 rounded-xl border border-[#30363D] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                ${entry.amount > 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                {entry.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="font-medium">
                                    {entry.description || (entry.type === 'withdrawal' ? 'Withdrawal Request' : 'Cashback Earned')}
                                </div>
                                <div className="text-xs text-[#9BA7B4]">
                                    {entry.createdAt?.toDate().toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className={`font-bold ${entry.amount > 0 ? 'text-green-400' : 'text-[#E6EDF3]'}`}>
                            {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                        </div>
                    </div>
                ))}
                {ledger.length === 0 && (
                    <div className="text-center py-10 text-[#9BA7B4] bg-[#161B22] rounded-xl border border-[#30363D] border-dashed">
                        No transactions yet. Start shopping!
                    </div>
                )}
            </div>
        </div>
    );
}
