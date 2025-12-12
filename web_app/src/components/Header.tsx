import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell, LogOut, Menu, X, Search, User, Globe, Zap, Wallet } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../i18n/translations';

interface Notification {
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt?: { toDate: () => Date };
    data?: { productId?: string };
}

export const Header: React.FC = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // UI State
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [queryStr, setQueryStr] = useState('');

    const notifRef = useRef<HTMLDivElement>(null);
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged((u) => {
            setUser(u);
            if (u) {
                const q = query(
                    collection(db, 'users', u.uid, 'notifications'),
                    orderBy('createdAt', 'desc'),
                    limit(10)
                );
                const unsubNotif = onSnapshot(q, (snap) => {
                    const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Notification[];
                    setNotifications(list);
                    setUnreadCount(list.filter(n => !n.read).length);
                });
                return () => unsubNotif();
            } else {
                setNotifications([]);
            }
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            unsubAuth();
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [auth]);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/');
    };

    const markAllRead = async () => {
        if (!user) return;
        const unread = notifications.filter(n => !n.read);
        for (const n of unread) {
            await updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
        }
    };

    const handleNotificationClick = async (n: Notification) => {
        if (!n.read) {
            await updateDoc(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
        }
        if (n.data?.productId) {
            navigate(`/product/${n.data.productId}`);
            setShowNotifications(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (queryStr.trim()) {
            navigate(`/search?q=${encodeURIComponent(queryStr)}`);
        }
    };

    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Explicitly define available languages
    const languages: { code: Language; label: string }[] = [
        { code: 'en', label: 'English' },
        { code: 'ko', label: '한국어' },
        { code: 'ja', label: '日本語' },
        { code: 'zh', label: '中文' },
        { code: 'es', label: 'Español' },
        { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' },
    ];

    return (
        <>
            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 bg-[#0B1117] flex flex-col p-6 animate-fade-in-up md:hidden">
                    <div className="flex justify-between items-center mb-8">
                        <span className="font-bold text-xl text-white">PriceBuddy</span>
                        <button onClick={() => setIsMenuOpen(false)}><X className="text-[#9BA7B4]" /></button>
                    </div>
                    <nav className="flex flex-col gap-6 text-lg font-medium text-[#E6EDF3]">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>{t('nav.home')}</Link>
                        <Link to="/community" onClick={() => setIsMenuOpen(false)}>{t('nav.community')}</Link>
                        <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>{t('nav.wishlist')}</Link>
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)}>{t('nav.profile')}</Link>
                        {user ? (
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-[#F85149]">Logout</button>
                        ) : (
                            <button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className="text-left text-[#4F7EFF]">{t('nav.signin')}</button>
                        )}
                    </nav>
                </div>
            )}

            <header className="sticky top-0 z-40 w-full border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
                    {/* Logo & Nav */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F7EFF] to-[#A371F7] flex items-center justify-center text-white">
                                ₩
                            </div>
                            <span className="text-white hidden sm:block">PriceBuddy</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/" className="text-sm font-medium text-[#9BA7B4] hover:text-[#E6EDF3] transition-colors">{t('nav.home')}</Link>
                            <Link to="/community" className="text-sm font-medium text-[#9BA7B4] hover:text-[#E6EDF3] transition-colors">{t('nav.community')}</Link>
                            <Link to="/wishlist" className="text-sm font-medium text-[#9BA7B4] hover:text-[#E6EDF3] transition-colors">{t('nav.wishlist')}</Link>
                        </nav>
                    </div>

                    {/* Search & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Language Dropdown */}
                        <div className="relative" ref={langMenuRef}>
                            <button
                                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                className="p-2 text-[#9BA7B4] hover:text-white hover:bg-[#30363D] rounded-full transition-colors flex items-center gap-1 text-xs font-bold uppercase"
                                title="Change Language"
                            >
                                <Globe size={18} />
                                {language}
                            </button>

                            {isLangMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl py-2 z-50 animate-fade-in-up">
                                    <div className="px-3 py-2 border-b border-[#30363D] mb-1">
                                        <h3 className="text-xs font-bold text-[#9BA7B4] uppercase">Select Language</h3>
                                    </div>
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code);
                                                setIsLangMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-[#30363D] transition-colors flex items-center justify-between ${language === lang.code ? 'text-[#4F7EFF] font-bold bg-[#1F6FEB]/10' : 'text-[#E6EDF3]'
                                                }`}
                                        >
                                            {lang.label}
                                            {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-[#4F7EFF]"></span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSearch} className="hidden md:flex relative group">
                            <input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={queryStr}
                                onChange={(e) => setQueryStr(e.target.value)}
                                className="w-64 bg-[#161B22] border border-[#30363D] rounded-full px-4 py-1.5 text-sm text-[#E6EDF3] focus:border-[#4F7EFF] focus:outline-none transition-all Group-hover:border-[#58A6FF]"
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA7B4] hover:text-white">
                                <Search size={16} />
                            </button>
                        </form>

                        {/* Notifications */}
                        {user && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-[#9BA7B4] hover:text-white hover:bg-[#30363D] rounded-full transition-colors relative"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#F85149] rounded-full ring-2 ring-[#0D1117] animate-pulse"></span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl py-2 z-50 animate-fade-in-up">
                                        <div className="px-4 py-2 border-b border-[#30363D] flex justify-between items-center">
                                            <h3 className="font-bold text-sm">Notifications</h3>
                                            <button onClick={markAllRead} className="text-xs text-[#4F7EFF] hover:underline">Mark all read</button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-sm text-[#9BA7B4]">No new notifications</div>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n.id} onClick={() => handleNotificationClick(n)} className={`px-4 py-3 hover:bg-[#0D1117] cursor-pointer transition-colors border-b border-[#30363D]/50 ${!n.read ? 'bg-[#1F6FEB]/10' : ''}`}>
                                                        <p className="text-sm text-[#E6EDF3] mb-1">{n.title}</p>
                                                        <span className="text-xs text-[#9BA7B4]">{n.createdAt?.toDate().toLocaleTimeString()}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Menu */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                {user.role !== 'pro' && user.role !== 'pro_plus' && (
                                    <Link to="/pricing" className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1">
                                        <Zap size={12} fill="currentColor" /> Upgrade
                                    </Link>
                                )}
                                <Link to="/wallet" className="text-[#9BA7B4] hover:text-[#E6EDF3] transition-colors" title="My Wallet">
                                    <Wallet size={20} />
                                </Link>
                                <Link to="/profile" className="w-8 h-8 rounded-full bg-[#30363D] flex items-center justify-center text-[#E6EDF3] hover:ring-2 hover:ring-[#4F7EFF] transition-all overflow-hidden">
                                    {user.photoURL ? <img src={user.photoURL} alt="" /> : <User size={18} />}
                                </Link>
                                <button onClick={handleLogout} className="text-[#9BA7B4] hover:text-[#F85149] transition-colors">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="hidden md:block bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded-full text-sm font-bold transition-transform hover:scale-105"
                            >
                                {t('nav.signin')}
                            </button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button className="md:hidden text-[#9BA7B4]" onClick={() => setIsMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};
