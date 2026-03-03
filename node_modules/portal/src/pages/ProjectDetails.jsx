/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProgressAdjuster from '../components/ProgressAdjuster';
import { projects } from '../data/projectData';
import AddBudgetModal from '../components/AddBudgetModal';
import AddTransactionModal from '../components/AddTransactionModal';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [project, setProject] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBudgetExpanded, setIsBudgetExpanded] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudgetItem, setEditingBudgetItem] = useState(null);
    const [budgetItems, setBudgetItems] = useState([]);

    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    const [projectTransactions, setProjectTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const handleAddBudget = () => {
        setEditingBudgetItem(null);
        setIsBudgetModalOpen(true);
    };

    const handleEditBudget = (item) => {
        setEditingBudgetItem(item);
        setIsBudgetModalOpen(true);
    };

    const handleDeleteBudget = (deleteId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus item anggaran ini?')) {
            setBudgetItems(prev => {
                const newList = prev.filter(item => item.id !== deleteId);
                localStorage.setItem(`budgetItems_${id}`, JSON.stringify(newList));
                return newList;
            });
        }
    };

    const handleSaveBudget = (item) => {
        // 1. Siapkan variabel untuk daftar baru
        let updatedList;

        if (editingBudgetItem) {
            // KONDISI EDIT: Update data yang sudah ada
            updatedList = budgetItems.map(i => i.id === editingBudgetItem.id ? { ...i, ...item } : i);
        } else {
            // KONDISI BARU: Bikin item baru
            const newItem = {
                id: Date.now(),
                ...item,
                qtyUsed: 0,
                qtyPercentage: 0,
                effectiveBudget: 'Rp 0',
                effectiveUsage: 0,
                effectiveUsageFormatted: 'Rp 0',
                effectivePercentage: 0,
                totalUsed: 'Rp 0',
                status: 'Safe',
                statusColor: 'green'
            };
            // Masukkan ke daftar
            updatedList = [...budgetItems, newItem];
        }

        // --- BAGIAN AJAIB (SORTING) ---
        // Ini yang bikin otomatis berkelompok.
        // Kita suruh komputer urutkan berdasarkan abjad Kategori (A-Z)
        updatedList.sort((a, b) => {
            // Bandingkan teks kategorinya (misal: "MATERIAL" vs "UPAH")
            if (a.category < b.category) return -1;
            if (a.category > b.category) return 1;
            return 0;
        });

        setBudgetItems(updatedList);
        localStorage.setItem(`budgetItems_${id}`, JSON.stringify(updatedList));
    };

    const handleSaveTransaction = (newTrx) => {
        const trxToSave = { ...newTrx, projectId: id };

        // Save to global transactions
        const allSavedTrxs = JSON.parse(localStorage.getItem('transactions')) || [];
        const updatedAllTrxs = [trxToSave, ...allSavedTrxs];
        localStorage.setItem('transactions', JSON.stringify(updatedAllTrxs));

        // Update local state
        setProjectTransactions(prev => [trxToSave, ...prev]);
    };

    const handleDeleteTransaction = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const allSavedTrxs = JSON.parse(localStorage.getItem('transactions')) || [];
            const updatedAllTrxs = allSavedTrxs.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(updatedAllTrxs));

            setProjectTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    // Initial load
    useEffect(() => {
        const savedProjects = JSON.parse(localStorage.getItem('projects')) || projects;
        if (savedProjects && savedProjects.length > 0) {
            const foundProject = savedProjects.find(p => String(p.id) === String(id));
            if (foundProject) {
                setProject(foundProject);

                // Load saved progress from localStorage if it exists, otherwise fallback to project data
                const savedProgress = localStorage.getItem(`project_progress_${id}`);
                if (savedProgress !== null) {
                    setProgress(Number(savedProgress));
                } else {
                    setProgress(foundProject.progress || 0);
                }
            }
        }

        // Load budget items for this project
        const savedBudgets = localStorage.getItem(`budgetItems_${id}`);
        if (savedBudgets) {
            setBudgetItems(JSON.parse(savedBudgets));
        } else {
            setBudgetItems([]);
        }

        // Load Categories for Transaction modal
        setCategories(JSON.parse(localStorage.getItem('categories')) || []);
        setSubCategories(JSON.parse(localStorage.getItem('subCategories')) || []);

        // Load project transactions
        const allTransactions = JSON.parse(localStorage.getItem('transactions')) || [];
        const filteredTrxs = allTransactions.filter(t => String(t.projectId) === String(id));
        setProjectTransactions(filteredTrxs);

        setIsLoading(false);
    }, [id]);

    // Helper: Parse currency formatted string back to number
    const parseCurrency = (str) => {
        if (!str) return 0;
        // Keep only numbers and minus sign to successfully cast IDR strings to Number
        const numericString = String(str).replace(/[^0-9-]/g, '');
        return Number(numericString) || 0;
    };

    // Replace the old project?.value logic with dynamically calculated metrics
    const { totalRAB, danaTerpakai, tagihanBelumLunas, cashOnHand, danaMasuk } = React.useMemo(() => {
        let rabSum = 0;
        budgetItems.forEach(item => {
            rabSum += parseCurrency(item.totalBudget);
        });

        let terpakaiSum = 0;
        let masukSum = 0;
        projectTransactions.forEach(trx => {
            if (trx.type === 'out') {
                terpakaiSum += Number(trx.amount) || 0;
            } else if (trx.type === 'in') {
                masukSum += Number(trx.amount) || 0;
            }
        });

        return {
            totalRAB: rabSum,
            danaTerpakai: terpakaiSum,
            tagihanBelumLunas: 0, // Not explicitly tracked yet, per discussion fallback to 0
            cashOnHand: masukSum - terpakaiSum,
            danaMasuk: masukSum
        };
    }, [budgetItems, projectTransactions]);

    const effectiveBudget = (totalRAB * progress) / 100;
    const usagePercentage = effectiveBudget > 0 ? ((danaTerpakai / effectiveBudget) * 100).toFixed(0) : 0;
    const remainingEffective = effectiveBudget - danaTerpakai;
    const remainingTotal = totalRAB - danaTerpakai;

    // Format currency helper
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const handleBudgetUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const lines = content.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const newItems = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const values = line.split(',');
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index]?.trim();
                });

                if (item.name && item.totalBudget) {
                    newItems.push({
                        id: Date.now() + i,
                        category: item.category || 'LAIN-LAIN',
                        name: item.name,
                        spec: item.spec || '-',
                        qtyUsed: 0,
                        qtyTotal: Number(item.qtyTotal) || 0,
                        qtyUnit: item.qtyUnit || 'unit',
                        qtyPercentage: 0,
                        totalBudget: item.totalBudget,
                        effectiveBudget: 'Rp 0',
                        effectiveUsage: 0,
                        effectiveUsageFormatted: 'Rp 0',
                        effectivePercentage: 0,
                        totalUsed: 'Rp 0',
                        status: 'Safe',
                        statusColor: 'green'
                    });
                }
            }

            if (newItems.length > 0) {
                setBudgetItems(prev => {
                    const newList = [...prev, ...newItems];
                    localStorage.setItem(`budgetItems_${id}`, JSON.stringify(newList));
                    return newList;
                });
                alert(`Berhasil mengimport ${newItems.length} item anggaran!`);
            } else {
                alert('Gagal mengimport data project. Pastikan format CSV benar (category,name,spec,qtyTotal,qtyUnit,totalBudget).');
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteProject = () => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus proyek "${project.name}" beserta semua data terkait?`)) {
            return;
        }

        // [FIX] Fetch from localStorage first to preserve other changes (like previous deletions)
        const savedProjects = localStorage.getItem('projects');
        const currentProjects = savedProjects ? JSON.parse(savedProjects) : projects;

        // Delete from projects list
        const updatedProjects = currentProjects.filter(p => String(p.id) !== String(id));
        localStorage.setItem('projects', JSON.stringify(updatedProjects));

        // Attempt to clean up related data (optional but good practice)
        localStorage.removeItem(`project_progress_${id}`);
        localStorage.removeItem(`budgetItems_${id}`);
        // Transactions cleanup
        const allSavedTrxs = JSON.parse(localStorage.getItem('transactions')) || [];
        const updatedTrxs = allSavedTrxs.filter(t => String(t.projectId) !== String(id));
        localStorage.setItem('transactions', JSON.stringify(updatedTrxs));

        alert('Proyek berhasil dihapus.');
        navigate('/proyek');
    };

    const handleStartMaintenance = () => {
        if (!window.confirm('Apakah Anda yakin ingin memulainya masa maintenance untuk proyek ini?')) {
            return;
        }

        const savedProjects = JSON.parse(localStorage.getItem('projects')) || projects;
        const updatedProjects = savedProjects.map(p => {
            if (String(p.id) === String(id)) {
                return { ...p, status: 'Maintenance' };
            }
            return p;
        });

        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        setProject(prev => ({ ...prev, status: 'Maintenance' }));
        window.dispatchEvent(new Event('projectsUpdated'));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-background-dark">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-text-secondary">Memuat data proyek...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white">
                <div className="text-center max-w-md p-8 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-slate-200 dark:border-border-dark">
                    <div className="h-16 w-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-icons-round text-3xl">error_outline</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Proyek Tidak Ditemukan</h2>
                    <p className="text-slate-500 dark:text-text-secondary mb-6">
                        Proyek dengan ID <strong>{id}</strong> tidak ditemukan.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white h-screen overflow-hidden flex">
            <Sidebar activePage="proyek" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />{/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-gray-200 dark:border-border-dark bg-white dark:bg-background-dark z-10 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-1 text-slate-500 dark:text-text-secondary">
                            <span className="material-icons-outlined">menu</span>
                        </button>
                        <nav className="flex text-lg font-bold text-slate-900 dark:text-white">
                            {project.name}
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-text-secondary bg-slate-100 dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg hover:bg-slate-200 dark:hover:bg-border-dark transition-colors">
                            <span className="material-icons-outlined text-[18px]">calendar_today</span>
                            <span>Sep 2026 - Okt 2026</span>
                        </button>
                        <button className="p-2 text-slate-500 dark:text-text-secondary hover:text-primary transition-colors relative">
                            <span className="material-icons-outlined">notifications</span>
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-background-dark"></span>
                        </button>
                        {project.status === 'Completed' && (
                            <button
                                onClick={handleStartMaintenance}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors ml-2"
                                title="Mulai Maintenance"
                            >
                                <span className="material-icons-outlined text-[18px]">engineering</span>
                                <span className="hidden sm:inline">Mulai Maintenance</span>
                            </button>
                        )}
                        {currentUser?.role === 'Admin' && (
                            <button
                                onClick={handleDeleteProject}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors ml-2"
                                title="Hapus Proyek"
                            >
                                <span className="material-icons-outlined text-[18px]">delete</span>
                                <span className="hidden sm:inline">Hapus Proyek</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scroll-smooth">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Akuntansi Proyek</h1>
                            <p className="text-sm text-slate-500 dark:text-text-secondary mt-1">Pantau kesehatan finansial proyek {project.name} secara real-time.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-border-dark transition-all flex items-center gap-2">
                                <span className="material-icons-outlined text-[18px]">download</span>
                                Export Laporan
                            </button>
                            <button
                                onClick={() => setIsAddTransactionModalOpen(true)}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
                            >
                                <span className="material-icons-outlined text-[18px]">add</span>
                                Tambah Transaksi
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm relative overflow-visible group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-slate-500 dark:text-text-secondary">Total Anggaran (RAB)</p>
                                        <div className="group/info relative cursor-help">
                                            <span className="material-icons-outlined text-slate-400 text-[16px]">info</span>
                                            <div className="absolute right-0 bottom-6 w-56 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-20">
                                                Geser slider untuk menyesuaikan Dana Efektif berdasarkan progres.
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{formatCurrency(totalRAB)}</h3>
                                </div>

                                <ProgressAdjuster
                                    initialProgress={progress}
                                    onProgressChange={(newProgress) => {
                                        setProgress(newProgress);
                                        localStorage.setItem(`project_progress_${id}`, newProgress);

                                        // Automatic Status Logic
                                        let newStatus = project.status;
                                        if (newProgress === 100) {
                                            newStatus = 'Completed';
                                        } else if (newProgress >= 95) {
                                            newStatus = 'BAST-1';
                                        } else if (project.status === 'BAST-1' || project.status === 'Completed') {
                                            // Optional: revert to Ongoing if progress drops below 95%
                                            newStatus = 'Ongoing';
                                        }

                                        if (newStatus !== project.status) {
                                            const savedProjects = JSON.parse(localStorage.getItem('projects')) || projects;
                                            const updatedProjects = savedProjects.map(p => {
                                                if (String(p.id) === String(id)) {
                                                    return { ...p, progress: newProgress, status: newStatus };
                                                }
                                                return p;
                                            });
                                            localStorage.setItem('projects', JSON.stringify(updatedProjects));
                                            setProject(prev => ({ ...prev, status: newStatus, progress: newProgress }));
                                            window.dispatchEvent(new Event('projectsUpdated'));
                                        } else {
                                            // Just update progress in the global list
                                            const savedProjects = JSON.parse(localStorage.getItem('projects')) || projects;
                                            const updatedProjects = savedProjects.map(p => {
                                                if (String(p.id) === String(id)) {
                                                    return { ...p, progress: newProgress };
                                                }
                                                return p;
                                            });
                                            localStorage.setItem('projects', JSON.stringify(updatedProjects));
                                            window.dispatchEvent(new Event('projectsUpdated'));
                                        }
                                    }}
                                />
                                {/* <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 text-center">
                                    <p className="text-sm">Progress Adjuster Disabled for Debugging</p>
                                    <input
                                        type="range"
                                        value={progress}
                                        onChange={(e) => setProgress(Number(e.target.value))}
                                        className="w-full mt-2"
                                    />
                                    <p>{progress}%</p>
                                </div> */}

                                <div className="flex justify-between items-center px-3 mb-4">
                                    <span className="text-[10px] text-slate-500 dark:text-text-secondary">Dana Efektif ({progress}%)</span>
                                    <span className="text-xs font-semibold text-primary">{formatCurrency(effectiveBudget)}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 text-center">
                                    Mengupdate progres akan mengkalkulasi ulang limit anggaran.
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-text-secondary mb-1">Dana Terpakai</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(danaTerpakai)}</h3>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${danaTerpakai <= effectiveBudget ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {danaTerpakai <= effectiveBudget ? 'On Track' : 'Over Budget'}
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 dark:text-text-secondary">Dari Dana Efektif ({formatCurrency(effectiveBudget)})</span>
                                        <span className="text-slate-900 dark:text-white font-bold">{usagePercentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-background-dark rounded-full h-2 overflow-hidden">
                                        <div className={`h-2 rounded-full transition-all duration-500 ${danaTerpakai <= effectiveBudget ? 'bg-gradient-to-r from-primary to-blue-400' : 'bg-red-500'}`} style={{ width: `${Math.min(usagePercentage, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-100 dark:border-border-dark/50">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 dark:text-text-secondary">Sisa Budget (Efektif)</span>
                                        <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(Math.max(0, remainingEffective))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-1">
                                        <span className="text-slate-500 dark:text-text-secondary">Sisa Total RAB</span>
                                        <span className="text-slate-400 font-normal">{formatCurrency(Math.max(0, remainingTotal))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-gray-200 dark:border-border-dark shadow-sm flex flex-col justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-text-secondary mb-1">Tagihan Belum Lunas</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{formatCurrency(tagihanBelumLunas)}</h3>
                                {tagihanBelumLunas > 0 ? (
                                    <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                                        <span className="material-icons-outlined text-[14px]">warning</span>
                                        Ada tagihan yang harus dibayar
                                    </p>
                                ) : (
                                    <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                        <span className="material-icons-outlined text-[14px]">check_circle</span>
                                        Tidak ada tagihan tertunda
                                    </p>
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border-dark flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-text-secondary">Cash on Hand</span>
                                <span className={`text-sm font-bold ${cashOnHand < 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                    {formatCurrency(cashOnHand)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-200 dark:border-border-dark flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rincian Anggaran</h2>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleBudgetUpload}
                                            className="hidden"
                                            accept=".csv"
                                        />
                                        <button
                                            onClick={handleAddBudget}
                                            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-icons-round text-[16px]">add</span>
                                            Tambah Item
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-sm bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-icons-round text-[16px]">upload_file</span>
                                            Import CSV
                                        </button>
                                        <button
                                            onClick={() => setIsBudgetExpanded(!isBudgetExpanded)}
                                            className="text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                                        >
                                            {isBudgetExpanded ? 'Tutup Detail' : 'Lihat Detail Lengkap'}
                                            <span className="material-icons-round text-[16px]">
                                                {isBudgetExpanded ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className={`overflow-x-auto overflow-y-scroll custom-scrollbar transition-all duration-600 ease-linear ${isBudgetExpanded ? 'max-h-[2000px]' : 'max-h-[500px]'}`}>
                                    <table className="w-full text-sm text-left table-fixed">
                                        <thead className="text-xs text-slate-500 dark:text-text-secondary bg-slate-50 dark:bg-background-dark uppercase">
                                            <tr>
                                                <th className="px-6 py-4 font-medium w-1/3" scope="col">Sub-kategori</th>
                                                <th className="px-6 py-4 font-medium text-right w-1/6" scope="col">Total Budget</th>
                                                <th className="px-6 py-4 font-medium w-1/4" scope="col">Budget Efektif</th>
                                                <th className="px-6 py-4 font-medium text-right w-1/4" scope="col">Total Terpakai</th>
                                                <th className="px-6 py-4 font-medium w-10" scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-border-dark">
                                            {budgetItems.map((item, index) => {
                                                const showHeader = index === 0 || item.category !== budgetItems[index - 1].category;
                                                // Only show first 3 items if not expanded
                                                if (!isBudgetExpanded && index >= 3) return null;

                                                return (
                                                    <React.Fragment key={item.id}>
                                                        {showHeader && (
                                                            <tr className="bg-slate-100 dark:bg-card-dark/70 border-b border-gray-200 dark:border-border-dark">
                                                                <td className="px-6 py-3 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-xs" colSpan="5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`w-1 h-4 ${item.category === 'MATERIAL' ? 'bg-blue-500' : 'bg-orange-500'} rounded-sm`}></span>
                                                                        {item.category}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr className="group bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors">
                                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white align-top pl-10">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="min-w-0">
                                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{item.subCategory}</div>
                                                                        <div className="font-semibold text-base truncate">{item.name}</div>
                                                                        <div className="text-xs text-slate-500 font-normal truncate">{item.spec}</div>
                                                                        <div className="mt-4 flex flex-col gap-1">
                                                                            <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">Qty Budget</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-24 bg-slate-200 dark:bg-background-dark rounded-full h-1.5 flex-shrink-0">
                                                                                    <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${item.qtyPercentage}%` }}></div>
                                                                                </div>
                                                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.qtyUsed}/{item.qtyTotal} {item.qtyUnit}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right align-top">
                                                                <div className="font-semibold text-slate-600 dark:text-slate-300">{item.totalBudget}</div>
                                                            </td>
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-slate-900 dark:text-white font-medium">{item.effectiveBudget}</span>
                                                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">Eff. 45%</span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-200 dark:bg-background-dark rounded-full h-2">
                                                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${item.effectivePercentage}%` }}></div>
                                                                    </div>
                                                                    <span className="text-[10px] text-slate-500">{item.totalUsed} (Terpakai)</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right align-top">
                                                                <div className="text-slate-900 dark:text-white font-bold text-base">{item.totalUsed}</div>
                                                                <div className="mt-1">
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${item.status === 'Safe' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'}`}>
                                                                        <span className="material-icons-outlined text-[10px]">{item.status === 'Safe' ? 'check_circle' : 'warning'}</span> {item.status}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right align-top">
                                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleEditBudget(item)}
                                                                        className="p-1 text-slate-400 hover:text-blue-500 transition-colors rounded"
                                                                        title="Edit"
                                                                    >
                                                                        <span className="material-icons-round text-[18px]">edit</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteBudget(item.id)}
                                                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded"
                                                                        title="Delete"
                                                                    >
                                                                        <span className="material-icons-round text-[18px]">delete</span>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>        <div className="space-y-6">
                            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm p-6 relative overflow-hidden">
                                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Arus Kas Bulanan</h2>
                                    <div className="flex gap-2">
                                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-text-secondary">
                                            <span className="w-2 h-2 rounded-full bg-primary"></span> Masuk
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-text-secondary">
                                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Keluar
                                        </span>
                                    </div>
                                </div>
                                {/* Simplified Chart for React */}
                                <div className="flex items-end justify-between h-48 gap-4 px-2">
                                    {['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'].map((month, index) => (
                                        <div key={month} className={`w-full flex flex-col items-center gap-2 group cursor-pointer ${index === 5 ? 'opacity-50' : ''}`}>
                                            <div className="w-full h-full flex items-end justify-center gap-1 relative">
                                                {index === 4 && <div className="absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Rp 450jt</div>}
                                                <div className={`w-3 bg-primary${index < 4 ? `/${30 + index * 20}` : ''} h-[${[40, 55, 70, 85, 60, 0][index]}%] rounded-t-sm ${index === 5 ? 'bg-primary/20 border-t border-dashed border-primary' : ''}`}></div>
                                                <div className={`w-3 bg-slate-300 dark:bg-slate-700 h-[${[30, 45, 50, 60, 35, 0][index]}%] rounded-t-sm ${index === 4 ? 'bg-slate-400 dark:bg-slate-600' : ''} ${index === 5 ? 'bg-slate-200 dark:bg-slate-800 border-t border-dashed border-slate-500' : ''}`}></div>
                                            </div>
                                            <span className={`text-xs ${index === 4 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 group-hover:text-primary'} transition-colors`}>{month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm flex flex-col h-full max-h-[800px]">
                                <div className="p-5 border-b border-gray-200 dark:border-border-dark flex items-center justify-between shrink-0">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Transaksi</h2>
                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-icons-outlined">filter_list</span>
                                    </button>
                                </div>
                                <div className="overflow-y-auto p-0 flex-1">
                                    <ul className="divide-y divide-gray-100 dark:divide-border-dark">
                                        {projectTransactions.length > 0 ? projectTransactions.map((trx) => (
                                            <li key={trx.id} className="p-4 hover:bg-slate-50 dark:hover:bg-background-dark/50 transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                            {trx.date.split(' ')[0]} {trx.date.split(' ')[1]}
                                                        </span>
                                                        <span className={`text-xs font-semibold ${trx.type === 'in' ? 'text-green-500' : 'text-primary'}`}>{trx.category}</span>
                                                    </div>
                                                    <span className={`text-sm font-bold ${trx.type === 'in' ? 'text-green-600 dark:text-green-500' : 'text-slate-900 dark:text-white'}`}>
                                                        {trx.type === 'in' ? '+' : '-'} {formatCurrency(trx.amount)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{trx.title}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400">Oleh: Pengguna Aktif</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(trx.id); }}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-500/10"
                                                        title="Hapus Transaksi"
                                                    >
                                                        <span className="material-icons-round text-[16px]">delete</span>
                                                    </button>
                                                </div>
                                            </li>
                                        )) : (
                                            <li className="p-8 text-center text-slate-500 dark:text-slate-400">
                                                Belum ada transaksi direkam.
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div className="p-4 border-t border-gray-200 dark:border-border-dark shrink-0">
                                    <button className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium">
                                        Lihat Semua Transaksi
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div >
                </div >
            </main >
            <AddBudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSave={handleSaveBudget}
                initialData={editingBudgetItem}
            />
            {
                isAddTransactionModalOpen && (
                    <AddTransactionModal
                        isOpen={isAddTransactionModalOpen}
                        onClose={() => setIsAddTransactionModalOpen(false)}
                        selectedProjectName={project?.name || 'Proyek'}
                        categories={categories}
                        subCategories={subCategories}
                        onSaveTransaction={handleSaveTransaction}
                    />
                )
            }
        </div >
    )
}
