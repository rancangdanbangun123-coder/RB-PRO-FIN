import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import SearchableSelect from './SearchableSelect';

export default function CreatePRModal({ isOpen, onClose, projects, onSubmit }) {
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [materialDatabase, setMaterialDatabase] = useState([]);
    const [realProjects, setRealProjects] = useState([]);

    // Form State
    const [selectedProject, setSelectedProject] = useState('');
    const [items, setItems] = useState([]);
    const [separateItems, setSeparateItems] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);

            // Fetch live materials and projects from API
            (async () => {
                try {
                    const [mats, projs] = await Promise.all([
                        api.materials.list(),
                        api.projects.list(),
                    ]);
                    setMaterialDatabase((mats || []).filter(m => m.status !== 'Inactive'));

                    const activeProjects = (projs || []).filter(p => p.status !== 'Completed');
                    if (activeProjects.length > 0) {
                        const projectNames = activeProjects.map(p => p.name || 'Unnamed Project');
                        setRealProjects(projectNames);
                        setSelectedProject(projectNames[0]);
                    } else {
                        setRealProjects(['No Projects']);
                        setSelectedProject('No Projects');
                    }
                } catch (e) {
                    console.error('Failed to load data for CreatePRModal:', e);
                }
            })();
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Force clear the form fields on mount or when visibility turns on explicitly
    useEffect(() => {
        if (isVisible) {
            setItems([]);
            setSeparateItems(false);
        }
    }, [isVisible]);

    // Removed handleClickOutside since we are using native <select> now

    if (!isVisible) return null;

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', category: 'Material', unit: 'Pcs', qty: 0, price: 0, initialBudget: 0, contractQty: 0 }]);
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id, field, value) => {
        if (field === 'name') {
            const selectedMaterial = materialDatabase.find(m => m.name === value);
            if (selectedMaterial) {
                setItems(items.map(item => item.id === id ? {
                    ...item,
                    name: selectedMaterial.name,
                    category: selectedMaterial.category || 'Material',
                    unit: selectedMaterial.unit || 'Pcs',
                    price: selectedMaterial.ahsPrice || selectedMaterial.price || 0,
                    initialBudget: selectedMaterial.initialBudget || 0,
                    contractQty: selectedMaterial.contractQty || 0,
                    hasDbMatch: true
                } : item));
            } else {
                // Support clearing the selection
                setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
            }
        } else {
            setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    };

    const handleSubmit = () => {
        onSubmit({
            project: selectedProject,
            items: items,
            separateItems: separateItems
        });
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`bg-white dark:bg-surface-dark w-full max-w-6xl rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[95vh] relative z-10 transition-all duration-300 transform ${animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-darker rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary">shopping_cart</span>
                            Buat Permintaan Pembelian (PR)
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Formulir pengadaan material dan jasa proyek</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <span className="block text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">No. Dokumen</span>
                            <span className="font-mono font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-white/5 px-2 py-1 rounded text-sm">PR-NEW-DRAFT</span>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">


                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Proyek</label>
                            <SearchableSelect
                                value={selectedProject}
                                onChange={(val) => setSelectedProject(val)}
                                placeholder="Pilih Proyek..."
                                options={realProjects.map(proj => ({ value: proj, label: proj }))}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Dibutuhkan</label>
                            <input className="w-full bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-600 dark:text-slate-300" type="date" defaultValue="2023-11-15" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Divisi Pemohon</label>
                            <input className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" readOnly type="text" value="Konstruksi - Sipil" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Daftar Item</h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Menampilkan {items.length} item</span>
                        </div>
                        <div className="border border-slate-200 dark:border-white/10 rounded-lg overflow-visible">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-surface-darker border-b border-slate-200 dark:border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-12 text-center">#</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-1/3">Nama Item / Deskripsi</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-24">Satuan</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-24 text-right">Qty</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-40 text-right">Est. Harga (IDR)</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-40 text-right">Total (IDR)</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5 bg-white dark:bg-surface-dark">
                                    {items.map((item, index) => (
                                        <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors relative">
                                            <td className="px-4 py-3 text-center text-slate-400">{index + 1}</td>
                                            <td className="px-4 py-3 relative" style={{ zIndex: items.length - index + 10 }}>
                                                <div className="flex flex-col gap-1">
                                                    <SearchableSelect
                                                        value={item.name}
                                                        onChange={(val) => handleItemChange(item.id, 'name', val)}
                                                        placeholder="Pilih Material..."
                                                        options={materialDatabase.map((mat) => ({ value: mat.name, label: `${mat.name} (${mat.category})` }))}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={item.category}
                                                        onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                                                        className="text-xs text-slate-500 bg-transparent border-b border-transparent focus:border-primary outline-none"
                                                        placeholder="Kategori..."
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={item.unit}
                                                    onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                                    className="w-full text-slate-600 dark:text-slate-300 bg-transparent border-b border-transparent focus:border-primary outline-none"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input className="w-full bg-transparent border border-slate-300 dark:border-white/20 rounded px-2 py-1 text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white" type="number"
                                                    value={item.qty}
                                                    onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right relative">
                                                <input className="w-full bg-slate-100 dark:bg-white/5 border border-transparent rounded px-2 py-1 text-right text-slate-500 cursor-not-allowed font-medium" type="text"
                                                    value={`Rp ${item.price.toLocaleString('id-ID')}`}
                                                    readOnly={true}
                                                    title="Est Harga diambil otomatis dari AHS Material Database"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100">
                                                Rp {(item.qty * item.price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                    <span className="material-icons text-lg">delete_outline</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="bg-slate-50 dark:bg-surface-darker px-4 py-3 border-t border-slate-200 dark:border-white/10">
                                <button onClick={handleAddItem} className="flex items-center gap-2 text-primary hover:text-primary-hover text-sm font-medium transition-colors">
                                    <span className="material-icons text-lg">add_circle_outline</span>
                                    Tambah Item Baru
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan Tambahan</label>
                            <textarea className="w-full bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none h-32 resize-none text-slate-700 dark:text-white" placeholder="Masukkan instruksi pengiriman atau detail teknis tambahan..."></textarea>
                            <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <span className="material-icons text-slate-400 text-3xl mb-1">cloud_upload</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">Drop file lampiran (PDF/IMG) di sini</span>
                            </div>
                        </div>

                        {/* Budget Preview Section (Simplified Visual) */}
                        <div className="bg-slate-50 dark:bg-surface-darker border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons text-yellow-500 text-sm">analytics</span>
                                    Budget Preview Per Item
                                </h3>
                                <span className="text-xs bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">Oktober 2023</span>
                            </div>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {items.map((item, index) => {
                                    const total = item.qty * item.price;
                                    const budgetUsed = (item.initialBudget || 0) * 0.4; // Mock usage
                                    const qtyUsed = (item.contractQty || 0) * 0.45; // Mock usage
                                    const remainingBudget = (item.initialBudget || 0) - budgetUsed - total;
                                    const remainingQty = (item.contractQty || 0) - qtyUsed - item.qty;
                                    const isBudgetRisk = (item.initialBudget > 0) && (remainingBudget < (item.initialBudget * 0.2));

                                    // Calculate percentages for bars
                                    const budgetUsedPct = ((budgetUsed / (item.initialBudget || 1)) * 100) || 0;
                                    const budgetCurrentPct = ((total / (item.initialBudget || 1)) * 100) || 0;
                                    const qtyUsedPct = ((qtyUsed / (item.contractQty || 1)) * 100) || 0;
                                    const qtyCurrentPct = ((item.qty / (item.contractQty || 1)) * 100) || 0;

                                    return (
                                        <div key={item.id} className="mb-5 last:mb-0">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{index + 1}. {item.name || 'New Item'}</span>
                                                {item.initialBudget > 0 && (
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isBudgetRisk ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30'}`}>
                                                        {isBudgetRisk ? 'Perhatian' : 'Aman'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between text-[11px] mb-1 text-slate-500 dark:text-slate-400">
                                                <span>Anggaran: Rp {item.initialBudget?.toLocaleString('id-ID') || 0}</span>
                                                <span>Qty Total: {item.contractQty || 0} {item.unit}</span>
                                            </div>

                                            <div className="bg-white dark:bg-white/5 rounded-lg p-3 border border-slate-200 dark:border-white/10 shadow-sm mb-3">
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3 text-xs">
                                                    <div className="border-r border-slate-100 dark:border-white/5 pr-4">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-slate-500 dark:text-slate-400">Budget Awal</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-200">Rp {item.initialBudget?.toLocaleString('id-ID') || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-slate-500 dark:text-slate-400">Sisa Saat Ini</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-200">Rp {((item.initialBudget || 0) - budgetUsed).toLocaleString('id-ID')}</span>
                                                        </div>
                                                        <div className={`flex justify-between items-center font-semibold ${isBudgetRisk ? 'text-yellow-600 dark:text-yellow-500' : 'text-primary'}`}>
                                                            <span>PR Ini</span>
                                                            <span>Rp {total.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="pl-2">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-slate-500 dark:text-slate-400">Qty Kontrak</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-200">{item.contractQty || 0} Unit</span>
                                                        </div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-slate-500 dark:text-slate-400">Sisa Qty</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-200">{Math.round((item.contractQty || 0) - qtyUsed)} Unit</span>
                                                        </div>
                                                        <div className={`flex justify-between items-center font-semibold ${isBudgetRisk ? 'text-yellow-600 dark:text-yellow-500' : 'text-primary'}`}>
                                                            <span>PR Ini</span>
                                                            <span>{item.qty} Unit</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div>
                                                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                                                            <span>Penggunaan Budget (Rp)</span>
                                                            <span className={`${isBudgetRisk ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'} font-medium`}>Est. Sisa: Rp {remainingBudget.toLocaleString('id-ID')}</span>
                                                        </div>
                                                        <div className="relative h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div className="absolute top-0 left-0 h-full bg-slate-300 dark:bg-white/20" style={{ width: `${budgetUsedPct}%` }} title="Terpakai"></div>
                                                            <div className={`absolute top-0 h-full ${isBudgetRisk ? 'bg-yellow-500' : 'bg-primary'} animate-pulse`} style={{ left: `${budgetUsedPct}%`, width: `${budgetCurrentPct}%` }} title="PR Ini"></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                                                            <span>Penggunaan Kuantitas (Qty)</span>
                                                            <span className={`${isBudgetRisk ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'} font-medium`}>Est. Sisa: {Math.round(remainingQty)} Unit</span>
                                                        </div>
                                                        <div className="relative h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div className="absolute top-0 left-0 h-full bg-slate-300 dark:bg-white/20" style={{ width: `${qtyUsedPct}%` }} title="Terpakai"></div>
                                                            <div className={`absolute top-0 h-full ${isBudgetRisk ? 'bg-yellow-400' : 'bg-blue-400'} animate-pulse`} style={{ left: `${qtyUsedPct}%`, width: `${qtyCurrentPct}%` }} title="PR Ini"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {index < items.length - 1 && <div className="h-px bg-slate-200 dark:bg-white/10 my-4"></div>}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Summary */}
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Total Permintaan (PR)
                                </div>
                                <div className="text-lg font-bold text-primary">
                                    Rp {calculateTotal().toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-white/10 pt-6">
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide">Alur Persetujuan Otomatis</h4>
                        <div className="flex items-center w-full max-w-3xl relative">
                            <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 dark:bg-white/10 z-0"></div>
                            <div className="flex-1 flex flex-col items-center relative z-10">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center border-4 border-white dark:border-surface-dark shadow-sm">
                                    <span className="material-icons text-sm">person</span>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Anda</p>
                                    <p className="text-[10px] text-slate-500">Requester</p>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col items-center relative z-10">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-surface-darker text-slate-400 dark:text-slate-500 flex items-center justify-center border-4 border-white dark:border-surface-dark shadow-sm ring-2 ring-primary/30">
                                    <span className="material-icons text-sm">assignment_ind</span>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Procurement Manager</p>
                                    <p className="text-[10px] text-slate-500">Approval</p>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col items-center relative z-10">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 flex items-center justify-center border-4 border-white dark:border-surface-dark">
                                    <span className="material-icons text-sm">account_balance_wallet</span>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">Finance</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-600">Verification</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-darker rounded-b-xl flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <div className="text-xs text-slate-400">
                            <span className="font-medium text-slate-500 dark:text-slate-300">Tips:</span> Pastikan spesifikasi item sudah sesuai dengan BOQ.
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                className="rounded text-primary border-slate-300 dark:border-slate-600 focus:ring-primary focus:ring-offset-0 bg-white dark:bg-surface-dark"
                                checked={separateItems}
                                onChange={(e) => setSeparateItems(e.target.checked)}
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pisahkan item ke kartu PR terpisah</span>
                        </label>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto justify-end">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">
                            Simpan Draft
                        </button>
                        <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                            <span className="material-icons text-sm">send</span>
                            Ajukan Permintaan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
