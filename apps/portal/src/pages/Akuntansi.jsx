import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projects as PROJECT_DATA } from '../data/projectData';
import AddTransactionModal from '../components/AddTransactionModal';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Akuntansi() {
    const { currentUser, hasPermission } = useAuth();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [editData, setEditData] = useState(null);

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);

    useEffect(() => {
        const catData = JSON.parse(localStorage.getItem("categories")) || [];
        const subData = JSON.parse(localStorage.getItem("subCategories")) || [];
        const trxs = JSON.parse(localStorage.getItem("transactions")) || [];
        setCategories(catData);
        setSubCategories(subData);
        setAllTransactions(trxs);
    }, []);

    const handleSaveTransaction = (newTrx) => {
        // If in 'Semua Proyek' view, the modal sends the chosen project NAME in newTrx.project
        // We need to find the corresponding project ID to save it correctly.
        let actualProjectId = selectedProjectId;
        if (selectedProjectId === 'all' && newTrx.project) {
            const matchedProject = PROJECT_DATA.find(p => p.name === newTrx.project);
            if (matchedProject) {
                actualProjectId = matchedProject.id;
            }
        }

        const trxToSave = { ...newTrx, projectId: actualProjectId, createdBy: currentUser?.name || 'Sistem' };

        const existingIndex = allTransactions.findIndex(t => t.id === trxToSave.id);
        let updatedTrxs;
        if (existingIndex >= 0) {
            updatedTrxs = [...allTransactions];
            updatedTrxs[existingIndex] = trxToSave;
        } else {
            updatedTrxs = [trxToSave, ...allTransactions];
        }

        setAllTransactions(updatedTrxs);
        localStorage.setItem("transactions", JSON.stringify(updatedTrxs));
    };

    const handleDeleteTransaction = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const updatedTrxs = allTransactions.filter(t => t.id !== id);
            setAllTransactions(updatedTrxs);
            localStorage.setItem("transactions", JSON.stringify(updatedTrxs));
        }
    };

    const userProjects = useMemo(() => {
        const role = currentUser?.role?.toLowerCase() || '';
        if (hasPermission('view_all_projects') || role === 'logistik') {
            return PROJECT_DATA;
        }
        return PROJECT_DATA.filter(p => p.pm === currentUser?.name);
    }, [currentUser, hasPermission]);

    const selectedProjectName = useMemo(() => {
        if (selectedProjectId === 'all') return 'Semua Proyek';
        const project = userProjects.find(p => p.id === selectedProjectId);
        return project ? project.name : 'Proyek Tidak Ditemukan';
    }, [selectedProjectId, userProjects]);

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    // Calculate summary and filter transactions based on selected project
    const { totalIncome, totalExpense, balance, recentTransactions } = useMemo(() => {
        let filtered = allTransactions;
        if (selectedProjectId !== 'all') {
            filtered = allTransactions.filter(t => t.projectId === selectedProjectId);
        } else {
            const userProjectIds = userProjects.map(p => p.id);
            filtered = allTransactions.filter(t => userProjectIds.includes(t.projectId));
        }

        let income = 0;
        let expense = 0;

        filtered.forEach(t => {
            if (t.type === 'in') income += t.amount;
            else if (t.type === 'out') expense += t.amount;
        });

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
            recentTransactions: showAllTransactions ? filtered : filtered.slice(0, 5)
        };
    }, [selectedProjectId, allTransactions, showAllTransactions]);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased h-screen flex overflow-hidden">
            <Sidebar activePage="akuntansi" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />{/* Overlay for mobile sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Akuntansi & Keuangan</h1>
                    </div>

                    {/* Header Controls */}
                    <div className="flex items-center gap-3">
                        <div className="relative group hidden sm:block">
                            <button
                                onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors min-w-[200px] justify-between"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className={`w-2 h-2 rounded-full ${selectedProjectId === 'all' ? 'bg-slate-400' : 'bg-green-500'}`}></span>
                                    <span className="truncate max-w-[150px]">{selectedProjectName}</span>
                                </div>
                                <span className="material-icons text-sm ml-1 text-slate-400">expand_more</span>
                            </button>

                            {isProjectMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProjectMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 max-h-96 overflow-y-auto custom-scrollbar">
                                        <button
                                            onClick={() => {
                                                setSelectedProjectId('all');
                                                setIsProjectMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${selectedProjectId === 'all' ? 'text-primary font-medium bg-slate-50 dark:bg-slate-700/50' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                <span>Semua Proyek</span>
                                            </div>
                                            {selectedProjectId === 'all' && <span className="material-icons text-primary">check</span>}
                                        </button>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                        {userProjects.map((project) => (
                                            <button
                                                key={project.id}
                                                onClick={() => {
                                                    setSelectedProjectId(project.id);
                                                    setIsProjectMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${project.id === selectedProjectId ? 'text-primary font-medium bg-slate-50 dark:bg-slate-700/50' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    <span className="truncate">{project.id} - {project.name}</span>
                                                </div>
                                                {project.id === selectedProjectId && <span className="material-icons text-primary">check</span>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Tracker Header & Add Button */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Financial Tracker</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola arus kas masuk dan keluar berdasarkan Proyek.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/30 font-medium"
                            >
                                <span className="material-icons-round">add_circle</span>
                                Tambah Transaksi
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-100 dark:from-slate-700/50 to-transparent pointer-events-none"></div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Saldo</p>
                                <h3 className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(balance)}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                                    <span className="material-icons-round text-[14px]">account_balance_wallet</span>
                                    <span>Dompet: {selectedProjectName}</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pemasukan (In)</p>
                                <h3 className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">+{formatCurrency(totalIncome)}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-slate-400">Bulan Ini</span>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <span className="material-icons-round text-[12px]">trending_up</span> 12%
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pengeluaran (Out)</p>
                                <h3 className="text-2xl font-bold text-red-600 dark:text-red-500 mt-1">-{formatCurrency(totalExpense)}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-slate-400">Bulan Ini</span>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <span className="material-icons-round text-[12px]">trending_flat</span> 0%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions placeholder - wait, let's add a basic list */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden mt-6">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 dark:text-white">Riwayat Transaksi</h3>
                                <button
                                    onClick={() => setShowAllTransactions(prev => !prev)}
                                    className="text-sm text-primary hover:text-primary-hover font-medium"
                                >
                                    {showAllTransactions ? 'Tampilkan Sedikit' : 'Lihat Semua'}
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {recentTransactions.length > 0 ? recentTransactions.map((trx) => (
                                    <div
                                        key={trx.id}
                                        className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedTransaction(trx)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${trx.type === 'in' ? 'bg-green-100 dark:bg-green-500/20 text-green-600' : 'bg-red-100 dark:bg-red-500/20 text-red-600'}`}>
                                                <span className="material-icons-round">{trx.type === 'in' ? 'arrow_downward' : 'shopping_cart'}</span>
                                            </div>
                                            <div className="group-hover:translate-x-1 transition-transform">
                                                <p className="font-medium text-slate-900 dark:text-white">{trx.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{trx.date} • {trx.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <div>
                                                <p className={`font-bold ${trx.type === 'in' ? 'text-green-600 dark:text-green-500' : 'text-slate-900 dark:text-white'}`}>
                                                    {trx.type === 'in' ? '+' : '-'}{formatCurrency(trx.amount)}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">{trx.projectId && trx.projectId !== 'all' ? (PROJECT_DATA.find(p => p.id === trx.projectId)?.name || trx.projectId) : 'Semua Proyek'}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteTransaction(trx.id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
                                                title="Hapus Transaksi"
                                            >
                                                <span className="material-icons-round text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        Belum ada transaksi direkam untuk proyek ini.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Render the extracted AddTransactionModal component */}
            {isAddModalOpen && (
                <AddTransactionModal
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setEditData(null);
                    }}
                    selectedProjectName={selectedProjectName}
                    categories={categories}
                    subCategories={subCategories}
                    onSaveTransaction={handleSaveTransaction}
                    editData={editData}
                />
            )}

            {/* Compact Transaction Detail Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-10" onClick={() => setSelectedTransaction(null)}></div>
                    <div className="relative z-20 w-full max-w-3xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
                        <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-card-dark shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Detail Transaksi</h2>
                                <p className="text-xs text-slate-500">{selectedTransaction.date}</p>
                            </div>
                            <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                                <span className="material-icons-round">close</span>
                            </button>
                        </header>

                        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Proyek</h3>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={PROJECT_DATA.find(p => p.id === selectedTransaction.projectId)?.name || 'Multi Proyek'}>
                                        {PROJECT_DATA.find(p => p.id === selectedTransaction.projectId)?.name || 'Multi Proyek'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Penerima / Toko</h3>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate" title={selectedTransaction.payee || '-'}>{selectedTransaction.payee || '-'}</p>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dibuat Oleh</h3>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate">
                                        <span className="material-icons-round text-[16px] text-slate-400">person</span>
                                        <span className="truncate">{selectedTransaction.createdBy || 'Sistem'}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Nilai</h3>
                                    <p className={`font-black tracking-tight text-lg truncate ${selectedTransaction.type === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                                        {selectedTransaction.type === 'in' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pr-2">
                                <div className="text-right flex flex-col items-end">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lampiran Nota</h3>
                                    {selectedTransaction.file ? (
                                        selectedTransaction.fileData ? (
                                            <button
                                                onClick={() => setPreviewAttachment(selectedTransaction)}
                                                className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-1 rounded font-medium border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                                                title={`Preview ${selectedTransaction.file}`}
                                            >
                                                <span className="material-icons-round text-[14px]">visibility</span>
                                                <span className="truncate max-w-[120px]">{selectedTransaction.file}</span>
                                            </button>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-1 rounded font-medium border border-primary/20">
                                                <span className="material-icons-round text-[14px]">attachment</span>
                                                <span className="truncate max-w-[120px]" title={selectedTransaction.file}>{selectedTransaction.file}</span>
                                            </div>
                                        )
                                    ) : (
                                        <p className="text-xs text-slate-400 italic bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Tidak ada lampiran</p>
                                    )}
                                </div>
                            </div>

                            {selectedTransaction.notes && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-3 rounded-lg">
                                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-500 mb-1">Catatan:</p>
                                    <p className="text-sm text-amber-900 dark:text-amber-200 whitespace-pre-wrap">{selectedTransaction.notes}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Rincian Item</h3>
                                {selectedTransaction._rawItems && selectedTransaction._rawItems.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedTransaction._rawItems.map((item, idx) => {
                                            const qty = parseFloat(item.qty) || 0;
                                            const price = parseInt((item.unitPrice || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
                                            const disc = parseFloat(item.discount) || 0;
                                            const subtotal = (qty * price) * (1 - (disc / 100));

                                            return (
                                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex flex-col gap-2">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{item.title}</span>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{formatCurrency(subtotal)}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                                                        <span><strong className="text-slate-600 dark:text-slate-300">Qty:</strong> {item.qty} {item.unit}</span>
                                                        <span><strong className="text-slate-600 dark:text-slate-300">Harga:</strong> {formatCurrency(price)}</span>
                                                        {disc > 0 && <span className="text-amber-600"><strong className="text-amber-700 dark:text-amber-500">Diskon:</strong> {disc}%</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {(parseFloat(selectedTransaction.globalDiscount) > 0 || parseFloat(selectedTransaction.taxRate) > 0) && (() => {
                                            const rawSubtotal = selectedTransaction._rawItems.reduce((acc, item) => {
                                                const q = parseFloat(item.qty) || 0;
                                                const p = parseInt((item.unitPrice || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
                                                const d = parseFloat(item.discount) || 0;
                                                return acc + ((q * p) * (1 - (d / 100)));
                                            }, 0);
                                            const gbDisc = parseFloat(selectedTransaction.globalDiscount) || 0;
                                            const gbDiscAmount = rawSubtotal * (gbDisc / 100);
                                            const afterDisc = rawSubtotal - gbDiscAmount;
                                            const tax = parseFloat(selectedTransaction.taxRate) || 0;
                                            const taxAmount = afterDisc * (tax / 100);

                                            return (
                                                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 items-end text-sm">
                                                    <div className="flex justify-between w-full sm:w-1/2 text-slate-500 dark:text-slate-400">
                                                        <span>Subtotal Items:</span>
                                                        <span>{formatCurrency(rawSubtotal)}</span>
                                                    </div>
                                                    {gbDisc > 0 && (
                                                        <div className="flex justify-between w-full sm:w-1/2 text-amber-600">
                                                            <span>Diskon Global ({gbDisc}%):</span>
                                                            <span>-{formatCurrency(gbDiscAmount)}</span>
                                                        </div>
                                                    )}
                                                    {tax > 0 && (
                                                        <div className="flex justify-between w-full sm:w-1/2 text-slate-600 dark:text-slate-400">
                                                            <span>Pajak ({tax}%):</span>
                                                            <span>+{formatCurrency(taxAmount)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                                        Tidak ada rincian item tersimpan
                                    </div>
                                )}
                            </div>
                        </div>

                        <footer className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-card-dark flex justify-between shrink-0">
                            <div>
                                {['admin', 'finance', 'purlog'].includes(currentUser?.role?.toLowerCase()) && (
                                    <button
                                        onClick={() => {
                                            setEditData(selectedTransaction);
                                            setSelectedTransaction(null);
                                            setIsAddModalOpen(true);
                                        }}
                                        className="px-5 py-2 text-sm font-bold text-primary bg-primary/10 border border-transparent rounded-lg hover:bg-primary hover:text-white transition flex items-center gap-2"
                                    >
                                        <span className="material-icons-round text-[16px]">edit</span>
                                        Edit Transaksi
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setSelectedTransaction(null)} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                Tutup
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Attachment Preview Modal */}
            {previewAttachment && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-10" onClick={() => setPreviewAttachment(null)}></div>
                    <div className="relative z-20 w-full max-w-4xl bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[85vh]">
                        <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-card-dark shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <span className="material-icons-round">description</span>
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate">Preview Lampiran</h2>
                                    <p className="text-xs text-slate-500 truncate">{previewAttachment.file}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewAttachment.fileData}
                                    download={previewAttachment.file}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                                >
                                    <span className="material-icons-round text-[18px]">download</span>
                                    <span className="hidden sm:inline">Download</span>
                                </a>
                                <button onClick={() => setPreviewAttachment(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50">
                            {previewAttachment.fileData.startsWith('data:application/pdf') ? (
                                <iframe
                                    src={previewAttachment.fileData}
                                    className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                                    title="PDF Preview"
                                />
                            ) : (
                                <img
                                    src={previewAttachment.fileData}
                                    alt="Attachment Preview"
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
