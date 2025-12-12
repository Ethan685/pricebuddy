import { useState, useEffect } from 'react';
import { Key, Trash2, Plus, Copy, Check } from 'lucide-react';
import { api } from '../api/api';


interface ApiKey {
    id: string;
    keyPreview?: string;
    key?: string;
    label: string;
    createdAt: string;
    lastUsed: string;
    usageCount?: number;
}

export function ApiKeyManager() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const [copied, setCopied] = useState<string | null>(null);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

    // Fetch existing keys on mount
    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const result = await api.listApiKeys();
            setKeys(result.keys);
        } catch (e) {
            console.error('Failed to fetch keys:', e);
        }
    };

    const handleCreateKey = async () => {
        if (!newLabel) return;
        setLoading(true);
        try {
            const newKey = await api.createApiKey(newLabel);

            // Store the full key temporarily to show it once
            setNewlyCreatedKey(newKey.key);

            // Refresh list
            await fetchKeys();
            setNewLabel('');

            // Clear the full key after 30 seconds
            setTimeout(() => setNewlyCreatedKey(null), 30000);
        } catch (e) {
            console.error(e);
            alert('Failed to create key');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure? This will break any integrations using this key.')) return;
        try {
            await api.revokeApiKey(id);
            await fetchKeys();
        } catch (e) {
            console.error(e);
            alert('Failed to revoke key');
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Key className="text-[#A371F7]" size={24} />
                API Key Management
            </h3>
            <p className="text-[#9BA7B4] text-sm mb-6">
                Manage API keys to access PriceBuddy Intelligence API via server-side integrations.
                Keep these keys secret.
            </p>

            {/* Create New Key */}
            <div className="flex gap-2 mb-8">
                <input
                    type="text"
                    placeholder="Key Label (e.g. Staging Server)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-lg px-4 py-2 text-[#E6EDF3] focus:border-[#A371F7] focus:outline-none"
                />
                <button
                    onClick={handleCreateKey}
                    disabled={!newLabel || loading}
                    className="bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus size={16} />
                    Generate
                </button>
            </div>

            {/* Keys List */}
            <div className="space-y-4">
                {/* Show newly created key with full value (one-time display) */}
                {newlyCreatedKey && (
                    <div className="bg-[#238636]/10 border border-[#238636] rounded-xl p-4 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-2 text-[#3FB950] font-bold">
                            <Check size={20} />
                            New API Key Created!
                        </div>
                        <p className="text-xs text-[#9BA7B4] mb-3">
                            Save this key now. You won't be able to see it again.
                        </p>
                        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 flex items-center justify-between">
                            <code className="font-mono text-sm text-[#E6EDF3] break-all">{newlyCreatedKey}</code>
                            <button
                                onClick={() => copyToClipboard(newlyCreatedKey, 'new-key')}
                                className="ml-4 text-[#4F7EFF] hover:text-white transition-colors"
                            >
                                {copied === 'new-key' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                )}

                {keys.map((key) => (
                    <div key={key.id} className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-[#E6EDF3]">{key.label}</span>
                                <span className="text-xs bg-[#30363D] text-[#9BA7B4] px-2 py-0.5 rounded-full">
                                    Last used: {key.lastUsed}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 font-mono text-sm text-[#9BA7B4]">
                                {key.keyPreview || key.key || 'pk_live_••••••'}
                                {(key.keyPreview || key.key) && (
                                    <button
                                        onClick={() => copyToClipboard(key.keyPreview || key.key || '', key.id)}
                                        className="hover:text-white transition-colors"
                                        title="Copy Key"
                                    >
                                        {copied === key.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleRevoke(key.id)}
                            className="text-[#F85149] hover:bg-[#F85149]/10 p-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Revoke
                        </button>
                    </div>
                ))}

                {keys.length === 0 && (
                    <div className="text-center text-[#9BA7B4] py-4">
                        No API keys generated yet.
                    </div>
                )}
            </div>
        </div>
    );
}
