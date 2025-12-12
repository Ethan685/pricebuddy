import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { api } from '../api/api';
import { Download, FileText, Loader2, BarChart, PieChart, TrendingUp, Users } from 'lucide-react';
import { PriceTrendChart } from '../components/PriceTrendChart';
import { ApiKeyManager } from '../components/ApiKeyManager';

export function EnterpriseDashboard() {
    const [loading, setLoading] = useState<string | null>(null);
    const [stats] = useState<{
        activeMonitors: number;
        priceChanges24h: number;
        competitoralerts: number;
    }>({
        activeMonitors: 124,
        priceChanges24h: 18,
        competitoralerts: 5
    });

    // Mock Data for Charts (matching seeded product "Sony headphones")
    const mockTrendData = [
        { date: '11/01', price: 418000, merchant: 'Coupang' },
        { date: '11/05', price: 415000, merchant: 'Coupang' },
        { date: '11/10', price: 399000, merchant: 'Naver' },
        { date: '11/15', price: 399000, merchant: 'Naver' },
        { date: '11/20', price: 385000, merchant: '11st' },
        { date: '11/25', price: 379000, merchant: 'Coupang' },
        { date: '12/01', price: 389000, merchant: 'Coupang' },
    ];

    const handleGenerate = async (type: string, format: 'csv' | 'pdf') => {
        setLoading(`${type}-${format}`);
        try {
            const data = await api.generateReport(type, format);

            // Auto Download
            const link = document.createElement('a');
            link.href = data.url;
            link.download = `report_${type}_${new Date().toISOString()}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert(`${format.toUpperCase()} Report Generated! (${data.items} items)`);
        } catch (e) {
            console.error(e);
            alert(`Failed to generate ${format.toUpperCase()} report`);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1117] text-[#E6EDF3] py-10">
            <Helmet>
                <title>Enterprise Dashboard - PriceBuddy</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Enterprise Dashboard
                        </h1>
                        <p className="text-[#9BA7B4]">Market Intelligence & Reporting Hub</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-[#161B22] border border-[#30363D] px-4 py-2 rounded-lg text-sm font-mono text-[#4F7EFF] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            LIVE STREAM
                        </div>
                        <div className="bg-[#161B22] border border-[#30363D] px-4 py-2 rounded-lg text-sm font-mono text-[#A371F7]">
                            PLAN: ENTERPRISE
                        </div>
                    </div>
                </header>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[#9BA7B4] text-sm font-bold">MONITORED SKUs</span>
                            <BarChart className="text-[#4F7EFF]" size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.activeMonitors}</div>
                        <div className="text-sm text-[#3FB950] mt-1">+12 this week</div>
                    </div>
                    <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[#9BA7B4] text-sm font-bold">PRICE CHANGES (24H)</span>
                            <TrendingUp className="text-[#A371F7]" size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.priceChanges24h}</div>
                        <div className="text-sm text-[#F85149] mt-1">High volatility detected</div>
                    </div>
                    <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[#9BA7B4] text-sm font-bold">COMPETITOR ALERTS</span>
                            <Users className="text-[#F2CC60]" size={20} />
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.competitoralerts}</div>
                        <div className="text-sm text-[#9BA7B4] mt-1">5 competitors changed prices</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-2">
                        <PriceTrendChart
                            data={mockTrendData}
                            title="Sony WH-1000XM5 Price Trend (30 Days)"
                        />
                    </div>

                    {/* Quick Acts & Key Manager */}
                    <div className="space-y-8">
                        <ApiKeyManager />

                        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left px-4 py-3 bg-[#0D1117] hover:bg-[#30363D] rounded-xl transition-colors text-sm font-bold flex justify-between items-center group">
                                    Add Competitor URL
                                    <span className="text-[#4F7EFF] group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                                <button className="w-full text-left px-4 py-3 bg-[#0D1117] hover:bg-[#30363D] rounded-xl transition-colors text-sm font-bold flex justify-between items-center group">
                                    Bulk Import SKUs (CSV)
                                    <span className="text-[#4F7EFF] group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Report Card 1 */}
                    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 hover:border-[#4F7EFF] transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-blue-500/10 p-3 rounded-xl">
                                <BarChart className="text-blue-400" size={32} />
                            </div>
                            <span className="text-xs font-bold text-[#9BA7B4] bg-[#0D1117] px-2 py-1 rounded">DAILY</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Price Trend Analysis</h3>
                        <p className="text-[#9BA7B4] text-sm mb-6">
                            Export historical pricing data across 50+ monitored categories. Identify seasonal trends.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleGenerate('price_trends', 'csv')}
                                disabled={!!loading}
                                className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                            >
                                {loading === 'price_trends-csv' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                CSV
                            </button>
                            <button
                                onClick={() => handleGenerate('price_trends', 'pdf')}
                                disabled={!!loading}
                                className="flex-1 bg-[#1F6FEB] hover:bg-[#388bfd] text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                            >
                                {loading === 'price_trends-pdf' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Report Card 2 */}
                    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 hover:border-[#A371F7] transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-purple-500/10 p-3 rounded-xl">
                                <PieChart className="text-purple-400" size={32} />
                            </div>
                            <span className="text-xs font-bold text-[#9BA7B4] bg-[#0D1117] px-2 py-1 rounded">WEEKLY</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Competitor Analysis</h3>
                        <p className="text-[#9BA7B4] text-sm mb-6">
                            Compare your positioning against top 5 competitors. Insights on stock levels and pricing strategies.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleGenerate('competitor_analysis', 'csv')}
                                disabled={!!loading}
                                className="flex-1 bg-[#238636] hover:bg-[#2ea043] text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                            >
                                {loading === 'competitor_analysis-csv' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                CSV
                            </button>
                            <button
                                onClick={() => handleGenerate('competitor_analysis', 'pdf')}
                                disabled={!!loading}
                                className="flex-1 bg-[#1F6FEB] hover:bg-[#388bfd] text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                            >
                                {loading === 'competitor_analysis-pdf' ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
