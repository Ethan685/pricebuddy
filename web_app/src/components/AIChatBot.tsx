import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Product } from '../types';

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    products?: Product[];
}

export function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'bot', text: 'Hi! I can help you find products or check prices. Try saying "Find cheap headphones".' }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const functions = getFunctions();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chatFn = httpsCallable<{ message: string }, any>(functions, 'chatWithAI');
            const result = await chatFn({ message: userMsg });
            const data = result.data;

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'bot',
                text: data.text,
                products: data.products
            }]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: "Sorry, I'm having trouble connecting to my brain right now." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-[#4F7EFF] hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl z-50 flex items-center justify-center transition-transform hover:scale-110 group animate-bounce-slow"
            >
                <Bot className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-[#161B22] border border-[#30363D] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#0D1117] border-b border-[#30363D]">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#4F7EFF]/20 rounded-lg">
                        <Bot className="w-5 h-5 text-[#4F7EFF]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#E6EDF3]">PriceBuddy AI</h3>
                        <p className="text-xs text-[#9BA7B4] flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-[#9BA7B4] hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B1117]/50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                            ? 'bg-[#1F6FEB] text-white rounded-br-none'
                            : 'bg-[#161B22] border border-[#30363D] text-[#E6EDF3] rounded-bl-none'
                            }`}>
                            <p>{msg.text}</p>

                            {msg.products && msg.products.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {msg.products.map((prod, idx) => (
                                        <div key={idx} className="flex gap-2 p-2 bg-[#0D1117] rounded-lg border border-[#30363D] hover:border-[#4F7EFF] cursor-pointer transition-colors group">
                                            {prod.images && prod.images[0] && (
                                                <img src={prod.images[0]} alt="" className="w-12 h-12 rounded object-cover" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-xs truncate group-hover:text-[#4F7EFF] transition-colors">{prod.title}</div>
                                                <div className="text-xs text-[#9BA7B4]">
                                                    {prod.currency === 'KRW' ? '₩' : '$'}{prod.minPrice.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl rounded-bl-none p-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#4F7EFF] animate-spin" />
                            <span className="text-xs text-[#9BA7B4]">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-[#0D1117] border-t border-[#30363D]">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about prices..."
                        className="flex-1 bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-2 text-sm text-[#E6EDF3] focus:outline-none focus:border-[#4F7EFF] transition-colors placeholder-[#9BA7B4]"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="bg-[#4F7EFF] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
