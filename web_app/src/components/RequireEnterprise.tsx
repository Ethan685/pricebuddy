import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';

export function RequireEnterprise({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnterprise, setIsEnterprise] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const db = getFirestore();
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    const userData = userDoc.data();

                    if (userData?.role === 'enterprise') {
                        setIsEnterprise(true);
                    } else {
                        setIsEnterprise(false);
                    }
                } catch (error) {
                    console.error("Failed to check enterprise role", error);
                    setIsEnterprise(false);
                }
            } else {
                setIsEnterprise(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading || (user && isEnterprise === null)) {
        return <div className="min-h-screen bg-[#0B1117] flex items-center justify-center text-white">Verifying Access...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isEnterprise) {
        // Redirect to a page explaining they need an enterprise plan
        // For now, just send them home with an alert (simulated) or special denial page
        return (
            <div className="min-h-screen bg-[#0B1117] flex flex-col items-center justify-center text-[#E6EDF3] p-4 text-center">
                <h1 className="text-3xl font-bold mb-4 text-[#F85149]">Access Denied</h1>
                <p className="mb-8 text-[#9BA7B4]">This area is restricted to Enterprise partners only.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-[#30363D] hover:bg-[#4F7EFF] px-6 py-2 rounded-lg font-bold transition-colors"
                    >
                        Return Home
                    </button>
                    <button
                        onClick={async () => {
                            if (user) {
                                try {
                                    const db = getFirestore();
                                    const { setDoc, doc } = await import('firebase/firestore');
                                    await setDoc(doc(db, 'users', user.uid), { role: 'enterprise' }, { merge: true });
                                    window.location.reload();
                                } catch (e) {
                                    alert('Failed to upgrade: ' + e);
                                }
                            }
                        }}
                        className="border border-[#30363D] hover:border-[#4F7EFF] text-[#4F7EFF] px-6 py-2 rounded-lg font-bold transition-colors"
                    >
                        [DEV] Simulate Upgrade
                    </button>
                </div>
            </div>
        );
    }

    return children;
}
