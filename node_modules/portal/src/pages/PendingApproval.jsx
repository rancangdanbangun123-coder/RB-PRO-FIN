import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function PendingApproval() {
    const { currentUser, logout, checkSession } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    const handleRefresh = async () => {
        setChecking(true);
        try {
            const user = await checkSession();
            if (user && user.status === 'Active') {
                navigate('/dashboard');
            }
        } catch (e) { /* still pending */ }
        setChecking(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-gray-200 dark:border-border-dark overflow-hidden">
                {/* Top accent */}
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400"></div>

                <div className="p-8 sm:p-10 text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 mb-6 ring-2 ring-amber-200 dark:ring-amber-800">
                        <span className="material-icons-round text-amber-500 text-4xl">hourglass_top</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Menunggu Persetujuan
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                        Akun Anda telah berhasil dibuat. Silakan tunggu Admin untuk mengaktifkan akun dan mengatur role Anda.
                    </p>

                    {/* User info card */}
                    {currentUser && (
                        <div className="bg-gray-50 dark:bg-background-dark rounded-lg p-4 mb-6 text-left border border-gray-100 dark:border-border-dark">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="material-icons-round text-primary">person</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                                </div>
                                <span className="ml-auto px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                    Pending
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRefresh}
                            disabled={checking}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-60"
                        >
                            <span className={`material-icons-round text-lg ${checking ? 'animate-spin' : ''}`}>
                                {checking ? 'autorenew' : 'refresh'}
                            </span>
                            {checking ? 'Memeriksa...' : 'Periksa Status'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
                        >
                            <span className="material-icons-round text-lg">logout</span>
                            Keluar
                        </button>
                    </div>

                    {/* Helpful note */}
                    <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                        Hubungi administrator jika Anda membutuhkan akses segera.
                    </p>
                </div>
            </div>
        </div>
    );
}
