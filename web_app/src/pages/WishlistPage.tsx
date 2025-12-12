import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { PriceCard } from '../components/PriceCard';
import { Heart, Loader2 } from 'lucide-react';
import { getAuth } from 'firebase/auth';

export function WishlistPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/admin'); // Redirect to login
            return;
        }

        api.getWishlist()
            .then(setItems)
            .finally(() => setLoading(false));
    }, [auth.currentUser, navigate]);

    return (
        <div className="min-h-screen bg-[#0B1117] text-[#E6EDF3] py-10">
            <Helmet>
                <title>My Wishlist - PriceBuddy</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Heart className="text-[#F85149] fill-current" /> My Wishlist
                    </h1>
                    <p className="text-[#9BA7B4]">Saved products you are watching</p>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#4F7EFF]" size={40} /></div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-[#9BA7B4]">
                        <p className="text-xl mb-4">Your wishlist is empty.</p>
                        <button onClick={() => navigate('/search')} className="text-[#4F7EFF] hover:underline">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items.map(item => (
                            <div key={item.id} onClick={() => navigate(`/product/${item.id}`)} className="cursor-pointer">
                                <PriceCard item={{ title: item.title, totalKRW: item.price }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
