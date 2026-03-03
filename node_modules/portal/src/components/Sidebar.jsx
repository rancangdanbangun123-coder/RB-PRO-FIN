import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Shared Sidebar component used across all pages.
 * 
 * Props:
 *  - activePage: string key for the current page (e.g. 'dashboard', 'material', 'users')
 *  - isMobileMenuOpen: boolean
 *  - onCloseMobileMenu: () => void
 */
export default function Sidebar({ activePage, isMobileMenuOpen, onCloseMobileMenu }) {
    const { currentUser, hasPermission, logout } = useAuth();

    const activeClass = 'bg-primary/10 text-primary font-medium';
    const inactiveClass = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-hover hover:text-slate-900 dark:hover:text-white font-medium transition-colors';

    const linkClass = (page) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg ${activePage === page ? activeClass : inactiveClass} group`;

    const iconClass = (page) =>
        activePage === page
            ? 'material-icons-round text-[20px]'
            : 'material-icons-round text-[20px] group-hover:text-primary transition-colors';

    return (
        <>
            {/* Sidebar */}
            <aside className={`w-64 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-border-dark flex-shrink-0 flex flex-col transition-all duration-300 fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Logo Area */}
                <div className="h-16 flex items-center flex-shrink-0 px-6 border-b border-slate-200 dark:border-border-dark">
                    <div className="flex items-center gap-2">
                        <div className="material-icons-round text-primary text-2xl">apartment</div>
                        <span className="text-xl font-bold tracking-tight">RB PRO-FIN</span>
                    </div>
                </div>
                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <nav className="p-4 space-y-1">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu Utama</p>
                        <Link to="/dashboard" className={linkClass('dashboard')}>
                            <span className={iconClass('dashboard')}>dashboard</span>
                            <span>Dashboard</span>
                        </Link>

                        {hasPermission('view_proyek') && (
                            <Link to="/proyek" className={linkClass('proyek')}>
                                <span className={iconClass('proyek')}>assignment</span>
                                <span>Proyek</span>
                            </Link>
                        )}

                        {hasPermission('view_category') && (
                            <Link to="/category" className={linkClass('category')}>
                                <span className={iconClass('category')}>category</span>
                                <span>Kategori</span>
                            </Link>
                        )}

                        {hasPermission('view_users') && (
                            <Link to="/users" className={linkClass('users')}>
                                <span className={iconClass('users')}>manage_accounts</span>
                                <span>Manajemen Pengguna</span>
                            </Link>
                        )}

                        {hasPermission('view_logistik') && (
                            <>
                                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Logistik</p>
                                <Link to="/subkontraktor" className={linkClass('subkontraktor')}>
                                    <span className={iconClass('subkontraktor')}>people</span>
                                    <span>Subkontraktor</span>
                                </Link>
                                <Link to="/procurement" className={linkClass('procurement')}>
                                    <span className={iconClass('procurement')}>shopping_cart</span>
                                    <span>Pengadaan</span>
                                </Link>
                                <Link to="/material" className={linkClass('material')}>
                                    <span className={iconClass('material')}>category</span>
                                    <span>Material</span>
                                </Link>
                                <Link to="/assets" className={linkClass('assets')}>
                                    <span className={iconClass('assets')}>inventory</span>
                                    <span>Aset & Inventaris</span>
                                </Link>
                            </>
                        )}

                        {(hasPermission('view_keuangan') || hasPermission('view_akuntansi')) && (
                            <>
                                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Keuangan</p>
                                {hasPermission('view_keuangan') && (
                                    <Link to="/invoice" className={linkClass('invoice')}>
                                        <span className={iconClass('invoice')}>receipt</span>
                                        <span>Invoice</span>
                                    </Link>
                                )}
                                {hasPermission('view_akuntansi') && (
                                    <Link to="/akuntansi" className={linkClass('akuntansi')}>
                                        <span className={iconClass('akuntansi')}>account_balance_wallet</span>
                                        <span>Akuntansi</span>
                                    </Link>
                                )}
                                {hasPermission('view_keuangan') && (
                                    <Link to="/laporan" className={linkClass('laporan')}>
                                        <span className={iconClass('laporan')}>receipt_long</span>
                                        <span>Laporan</span>
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>
                {/* User Profile */}
                <div className="p-4 border-t border-slate-200 dark:border-border-dark flex-shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-hover cursor-pointer transition-colors">
                        <img
                            alt="Profile Picture"
                            className="w-9 h-9 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random`}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{currentUser?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{currentUser?.role || 'Member'}</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); logout(); }}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <span className="material-icons-round text-[18px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onCloseMobileMenu} />
            )}
        </>
    );
}
