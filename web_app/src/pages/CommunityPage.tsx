import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, ArrowBigUp, ArrowBigDown, Share2, ExternalLink, Flame, Clock, Plus, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { api } from '../api/api';
import { getAuth } from 'firebase/auth';
import type { CommunityPost } from '../types';

export function CommunityPage() {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot');
    const [showPostForm, setShowPostForm] = useState(false);

    // Form State
    const [newPost, setNewPost] = useState({ title: '', url: '', price: '', currency: 'KRW' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubAuth = auth.onAuthStateChanged(setUser);
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        let q = query(collection(db, 'community_posts'), orderBy('createdAt', 'desc'));

        if (sortBy === 'hot') {
            q = query(collection(db, 'community_posts'), orderBy('votes', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
            })) as CommunityPost[];
            setPosts(fetchedPosts);
        });

        return () => unsubscribe();
    }, [sortBy]);

    const handleVote = async (id: string, delta: number) => {
        if (!user) {
            alert("Please sign in to vote!");
            return;
        }
        // Optimistic UI update could happen here, but we rely on real-time listener for simplicity
        try {
            await api.voteCommunityPost(id, delta);
        } catch (e) {
            console.error(e);
            alert("Failed to vote.");
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            await api.createCommunityPost({
                ...newPost,
                price: parseFloat(newPost.price)
            });
            setShowPostForm(false);
            setNewPost({ title: '', url: '', price: '', currency: 'KRW' });
        } catch (e) {
            console.error(e);
            alert("Failed to post.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#0B1117] text-[#E6EDF3]">
            <Helmet>
                <title>Community Deals - PriceBuddy</title>
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Deal Community</h1>
                        <p className="text-[#9BA7B4]">Share and discover the hottest price drops found by our users.</p>
                    </div>
                    <button
                        onClick={() => user ? setShowPostForm(true) : alert("Please sign in to post!")}
                        className="bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Post a Deal
                    </button>
                </div>

                {/* Create Post Modal/Form Overlay */}
                {showPostForm && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 w-full max-w-md shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Post a New Deal</h2>
                                <button onClick={() => setShowPostForm(false)} className="text-[#9BA7B4] hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#9BA7B4] mb-1">Items URL</label>
                                    <input
                                        type="url"
                                        required
                                        className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-white focus:border-[#58A6FF] outline-none transition-colors"
                                        value={newPost.url}
                                        onChange={e => setNewPost({ ...newPost, url: e.target.value })}
                                        placeholder="https://coupang.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#9BA7B4] mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-white focus:border-[#58A6FF] outline-none transition-colors"
                                        value={newPost.title}
                                        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                        placeholder="e.g. Sony WH-1000XM5"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-[#9BA7B4] mb-1">Price</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-white focus:border-[#58A6FF] outline-none transition-colors"
                                            value={newPost.price}
                                            onChange={e => setNewPost({ ...newPost, price: e.target.value })}
                                            placeholder="350000"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="block text-sm font-medium text-[#9BA7B4] mb-1">Currency</label>
                                        <select
                                            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-white focus:border-[#58A6FF] outline-none transition-colors"
                                            value={newPost.currency}
                                            onChange={e => setNewPost({ ...newPost, currency: e.target.value })}
                                        >
                                            <option value="KRW">KRW</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-3 rounded-lg transition-colors mt-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Posting...' : 'Share Deal'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-4 mb-6 border-b border-[#30363D] pb-4">
                    <button
                        onClick={() => setSortBy('hot')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${sortBy === 'hot' ? 'bg-[#1F6FEB]/20 text-[#58A6FF]' : 'text-[#9BA7B4] hover:bg-[#161B22]'}`}
                    >
                        <Flame className="w-4 h-4" />
                        Hot Deals
                    </button>
                    <button
                        onClick={() => setSortBy('new')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${sortBy === 'new' ? 'bg-[#1F6FEB]/20 text-[#58A6FF]' : 'text-[#9BA7B4] hover:bg-[#161B22]'}`}
                    >
                        <Clock className="w-4 h-4" />
                        Newest
                    </button>
                </div>

                {/* Feed */}
                <div className="space-y-4">
                    {posts.length === 0 && (
                        <div className="text-center py-20 text-[#9BA7B4] border border-[#30363D] border-dashed rounded-xl">
                            No deals yet. Be the first to share!
                        </div>
                    )}
                    {posts.map(post => (
                        <div key={post.id} className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex gap-4 hover:border-[#58A6FF]/50 transition-colors">
                            {/* Vote Column */}
                            <div className="flex flex-col items-center gap-1 bg-[#0D1117] rounded-lg p-2 h-fit min-w-[3rem]">
                                <button onClick={() => handleVote(post.id, 1)} className="text-[#9BA7B4] hover:text-[#FF7B72] transition-colors">
                                    <ArrowBigUp className="w-6 h-6" />
                                </button>
                                <span className={`font-bold text-sm ${post.votes > 0 ? 'text-[#FF7B72]' : post.votes < 0 ? 'text-[#4F7EFF]' : 'text-[#E6EDF3]'}`}>
                                    {post.votes}
                                </span>
                                <button onClick={() => handleVote(post.id, -1)} className="text-[#9BA7B4] hover:text-[#4F7EFF] transition-colors">
                                    <ArrowBigDown className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#E6EDF3] mb-1 leading-snug">
                                            {post.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-[#9BA7B4] mb-3">
                                            <span className="text-[#58A6FF] font-medium">@{post.authorName || 'Anonymous'}</span>
                                            <span>•</span>
                                            <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
                                            {post.isHot && (
                                                <span className="flex items-center gap-1 bg-[#FF7B72]/10 text-[#FF7B72] px-2 py-0.5 rounded-full text-xs font-bold border border-[#FF7B72]/20">
                                                    <Flame className="w-3 h-3" /> HOT
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {post.imageUrl && (
                                        <img src={post.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg border border-[#30363D] hidden sm:block" />
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <a
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[#4F7EFF] hover:underline font-bold text-lg"
                                    >
                                        {post.currency === 'KRW' ? '₩' : ''}{Number(post.price).toLocaleString()}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#30363D]/50">
                                    <button className="flex items-center gap-2 text-[#9BA7B4] hover:bg-[#30363D]/50 px-2 py-1 rounded transition-colors text-sm font-medium">
                                        <MessageSquare className="w-4 h-4" />
                                        {post.comments} Comments
                                    </button>
                                    <button className="flex items-center gap-2 text-[#9BA7B4] hover:bg-[#30363D]/50 px-2 py-1 rounded transition-colors text-sm font-medium">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
