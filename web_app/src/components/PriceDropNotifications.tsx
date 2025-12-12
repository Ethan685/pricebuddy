import React, { useEffect, useState } from 'react';
import { Bell, TrendingDown, X } from 'lucide-react';

interface PriceDropNotification {
    id: string;
    productId: string;
    title: string;
    message: string;
    oldPrice: number;
    newPrice: number;
    dropPercentage: number;
    createdAt: Date;
    read: boolean;
}

export const PriceDropNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<PriceDropNotification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        loadNotifications();

        // Poll for new notifications every 5 minutes
        const interval = setInterval(loadNotifications, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        // Mock Data due to missing API
        const mockData: PriceDropNotification[] = [
            {
                id: '1',
                productId: 'prod123',
                title: 'Price Drop: iPhone 14',
                message: 'Price dropped by 10%!',
                oldPrice: 1000,
                newPrice: 900,
                dropPercentage: 10,
                createdAt: new Date(),
                read: false
            },
            {
                id: '2',
                productId: 'prod456',
                title: 'Target Hit: Sony XM5',
                message: 'Target price reached.',
                oldPrice: 350,
                newPrice: 300,
                dropPercentage: 14.28,
                createdAt: new Date(Date.now() - 86400000), // 1 day ago
                read: true
            },
            {
                id: '3',
                productId: 'prod789',
                title: 'Price Drop: Samsung Galaxy S23',
                message: 'Price dropped by 15%!',
                oldPrice: 1200,
                newPrice: 1020,
                dropPercentage: 15,
                createdAt: new Date(Date.now() - 172800000), // 2 days ago
                read: false
            }
        ];
        setNotifications(mockData);
        /*
        try {
            const data = await api.getPriceDropNotifications();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
        */
    };

    const markAsRead = async (notificationId: string) => {
        // Mock API call
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        /*
        try {
            await api.markNotificationAsRead(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
        */
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // if (unreadCount === 0) return null; // Commented out to always show bell for testing mock data

    return (
        <>
            {/* Notification Bell */}
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#9BA7B4] hover:text-white transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className="absolute right-0 top-16 w-96 bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-[#30363D] flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <TrendingDown className="text-green-400" size={20} />
                            가격 하락 알림
                        </h3>
                        <button
                            onClick={() => setShowNotifications(false)}
                            className="text-[#9BA7B4] hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="divide-y divide-[#30363D]">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="p-4 hover:bg-[#0D1117] transition-colors cursor-pointer"
                                onClick={() => {
                                    window.location.href = `/product/${notification.productId}`;
                                    markAsRead(notification.id);
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-500/20 p-2 rounded-lg flex-shrink-0">
                                        <TrendingDown className="text-green-400" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white mb-1">
                                            {notification.title}
                                        </div>
                                        <div className="text-sm text-[#9BA7B4] mb-2">
                                            {notification.message}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-[#9BA7B4] line-through">
                                                ₩{notification.oldPrice.toLocaleString()}
                                            </span>
                                            <span className="text-sm font-bold text-green-400">
                                                ₩{notification.newPrice.toLocaleString()}
                                            </span>
                                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                                -{Math.round(notification.dropPercentage)}%
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                        className="text-[#9BA7B4] hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {notifications.length === 0 && (
                        <div className="p-8 text-center text-[#9BA7B4]">
                            알림이 없습니다
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
