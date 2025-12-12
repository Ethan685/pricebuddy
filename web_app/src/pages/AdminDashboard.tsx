import { useState, useEffect } from 'react';
import { db, functions } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export function AdminDashboard() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [telemetryData, setTelemetryData] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chartData, setChartData] = useState<any[]>([]);

    const [isAdmin] = useState(true);

    useEffect(() => {
        // Check Admin Role (Mock check, real check happens on backend)
        // In real app, use custom claims or fetch user doc

        // 1. Fetch Withdrawals
        const qWithdrawals = query(
            collection(db, 'cashback_ledger'),
            where('type', '==', 'withdrawal'),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        const unsubWithdrawals = onSnapshot(qWithdrawals, (snapshot) => {
            setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 2. Fetch Telemetry
        const qTelemetry = query(
            collection(db, 'telemetry'),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const unsubTelemetry = onSnapshot(qTelemetry, (snapshot) => {
            const events = snapshot.docs.map(doc => doc.data());
            setTelemetryData(events);

            // Aggregate for Chart
            const counts: Record<string, number> = {};
            events.forEach(e => {
                counts[e.eventName] = (counts[e.eventName] || 0) + 1;
            });

            const processed = Object.keys(counts).map(key => ({
                name: key,
                count: counts[key]
            }));
            setChartData(processed);
        });

        return () => {
            unsubWithdrawals();
            unsubTelemetry();
        };
    }, []);

    const handleProcess = async (id: string, action: 'approve' | 'reject') => {
        try {
            const processWithdrawal = httpsCallable(functions, 'processWithdrawal');
            await processWithdrawal({ withdrawalId: id, action });
            alert(`Withdrawal ${action}ed!`);
        } catch (e) {
            console.error(e);
            alert('Failed to process withdrawal');
        }
    };

    if (!isAdmin) return <div className="p-8 text-white">Access Denied</div>;

    return (
        <div className="p-8 text-[#E6EDF3] max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Telemetry Section */}
            <div className="bg-[#121A23] p-6 rounded-2xl mb-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#4F7EFF]" />
                    Live Event Analytics (Last 100)
                </h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                            <XAxis dataKey="name" stroke="#9BA7B4" />
                            <YAxis stroke="#9BA7B4" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
                                itemStyle={{ color: '#E6EDF3' }}
                            />
                            <Bar dataKey="count" fill="#4F7EFF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-xs text-[#9BA7B4]">
                    Total Events: {telemetryData.length}
                </div>
            </div>

            {/* Withdrawals Section */}
            <div className="bg-[#121A23] p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-6">Pending Withdrawals</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#30363D] text-[#9BA7B4]">
                                <th className="pb-4">User ID</th>
                                <th className="pb-4">Amount</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#30363D]">
                            {withdrawals.map(w => (
                                <tr key={w.id}>
                                    <td className="py-4 font-mono text-sm">{w.userId}</td>
                                    <td className="py-4 text-[#4F7EFF] font-bold">{-w.amount} KRW</td>
                                    <td className="py-4 text-[#9BA7B4]">{w.createdAt?.toDate().toLocaleString()}</td>
                                    <td className="py-4 flex gap-2">
                                        <button
                                            onClick={() => handleProcess(w.id, 'approve')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleProcess(w.id, 'reject')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {withdrawals.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-[#9BA7B4]">No pending withdrawals</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
