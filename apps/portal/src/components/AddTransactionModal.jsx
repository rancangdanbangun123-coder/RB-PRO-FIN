import React, { useState, useMemo, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import { api } from '../lib/api';

export default function AddTransactionModal({ isOpen, onClose, selectedProjectName, categories, subCategories, onSaveTransaction, editData, materials = [] }) {
    const [projectData, setProjectData] = useState([]);
    const [subcontractors, setSubcontractors] = useState([]);
    const [type, setType] = useState('out');
    const [selectedProject, setSelectedProject] = useState('');
    const [notes, setNotes] = useState('');
    const [payee, setPayee] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([
        { id: Date.now(), title: '', qty: 1, unit: '', unitPrice: '', amount: 0, categoryId: '', subCategoryId: '', discount: 0 }
    ]);
    const [globalDiscount, setGlobalDiscount] = useState(0); // in percentage
    const [taxRate, setTaxRate] = useState(0); // in percentage
    const [attachedFile, setAttachedFile] = useState(null);

    // Initialize Project Dropdown logic based on parent's filter or Edit Data
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setType(editData.type || 'out');
                setSelectedProject(editData.project || '');
                setNotes(editData.notes || '');
                setPayee(editData.payee || '');
                setTransactionDate(editData.rawDate || new Date().toISOString().split('T')[0]);
                setGlobalDiscount(editData.globalDiscount || 0);
                setTaxRate(editData.taxRate || 0);
                if (editData._rawItems && editData._rawItems.length > 0) {
                    setItems(editData._rawItems);
                } else {
                    setItems([{ id: Date.now(), title: '', qty: 1, unit: '', unitPrice: '', amount: 0, categoryId: '', subCategoryId: '', discount: 0 }]);
                }
                if (editData.file && editData.fileData) {
                    setAttachedFile({ name: editData.file, data: editData.fileData });
                } else if (editData.file) {
                    setAttachedFile({ name: editData.file, data: null });
                } else {
                    setAttachedFile(null);
                }
            } else {
                if (selectedProjectName && selectedProjectName !== 'Semua Proyek' && selectedProjectName !== 'All') {
                    setSelectedProject(selectedProjectName);
                } else {
                    setSelectedProject('');
                }
                setType('out');
                setNotes('');
                setPayee('');
                setTransactionDate(new Date().toISOString().split('T')[0]);
                setGlobalDiscount(0);
                setTaxRate(0);
                setItems([{ id: Date.now(), title: '', qty: 1, unit: '', unitPrice: '', amount: 0, categoryId: '', subCategoryId: '', discount: 0 }]);
                setAttachedFile(null);
            }
        }
    }, [isOpen, selectedProjectName, editData]);

    // Load projects and subcontractors from API
    useEffect(() => {
        if (isOpen) {
            (async () => {
                try {
                    const [projs, subs] = await Promise.all([
                        api.projects.list(),
                        api.subcontractors.list(),
                    ]);
                    setProjectData(projs || []);
                    setSubcontractors(subs || []);
                } catch (e) { console.error('Failed to load data for AddTransactionModal:', e); }
            })();
        }
    }, [isOpen]);

    // Calculate subtotal, discounts, taxes, and final total
    const financialSummary = useMemo(() => {
        let subtotal = 0;

        items.forEach(item => {
            const qty = parseFloat(item.qty) || 0;
            const priceStr = item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice.toString() : '0';
            const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
            const rowTotal = qty * price;
            const itemDiscountPercent = parseFloat(item.discount) || 0;
            const itemDiscountAmount = rowTotal * (itemDiscountPercent / 100);
            const rowFinal = rowTotal - itemDiscountAmount;
            subtotal += rowFinal;
        });

        const globalDiscountPercent = parseFloat(globalDiscount) || 0;
        const globalDiscountAmount = subtotal * (globalDiscountPercent / 100);
        const subtotalAfterDiscount = subtotal - globalDiscountAmount;

        const taxPercent = parseFloat(taxRate) || 0;
        const taxAmount = subtotalAfterDiscount * (taxPercent / 100);

        const finalTotal = subtotalAfterDiscount + taxAmount;

        return {
            subtotal,
            globalDiscountAmount,
            taxAmount,
            finalTotal: Math.max(0, finalTotal) // avoid negative
        };
    }, [items, globalDiscount, taxRate]);

    // Parse currency helper
    const parseCurrency = (str) => {
        if (!str) return 0;
        const numericString = String(str).replace(/[^0-9-]/g, '');
        return Number(numericString) || 0;
    };

    // Calculate Per-Material Budget Simulation
    const budgetSimulations = useMemo(() => {
        if (!selectedProject || type !== 'out') return [];

        // 1. Find correct Project ID and Progress from name
        const matchedProject = projectData.find(p => p.name === selectedProject);
        const projectId = matchedProject ? matchedProject.id : null;
        const projectProgress = matchedProject ? (matchedProject.progress || 0) : 0;

        if (!projectId) return [];

        // 2. Fetch formal budgets for this project (loaded async)
        // For now use empty array — budget simulation requires dedicated API endpoint
        const savedBudgets = [];

        // 3. Fetch past transactions
        let pastProjectTrxs = [];
        // Transactions will be loaded from parent component or API
        const allTransactions = [];

        // 4. Map each current material item into a simulation object
        return items.map((item, index) => {
            if (!item.title) return null;

            // Find formal budget limit
            const budgetData = savedBudgets.find(b => b.name === item.title);
            const limitTotal = budgetData ? parseCurrency(budgetData.totalBudget) : 0;
            const limitEffective = limitTotal > 0 ? (limitTotal * projectProgress) / 100 : 0;

            // Extract Qty Budget
            const qtyBudget = budgetData && budgetData.qtyTotal ? parseFloat(budgetData.qtyTotal) : 0;
            const qtyUnit = budgetData && budgetData.qtyUnit ? budgetData.qtyUnit : '';

            // Calculate previously spent amount for this specific material
            let previouslyUsed = 0;
            let previouslyProcuredQty = 0;
            pastProjectTrxs.forEach(trx => {
                // Determine if this past transaction included the item (naive title match)
                if (trx.title && trx.title.includes(item.title)) {
                    previouslyUsed += Number(trx.amount) || 0;
                    previouslyProcuredQty += parseFloat(trx.qty) || 0;
                }
            });

            const remainingEffective = Math.max(0, limitEffective - previouslyUsed);

            // Calculate current impact of THIS row
            const qty = parseFloat(item.qty) || 0;
            const remainingQty = qtyBudget - previouslyProcuredQty - qty;
            const priceStr = item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice.toString() : '0';
            const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
            const rowTotal = qty * price;
            const itemDiscountPercent = parseFloat(item.discount) || 0;
            const itemDiscountAmount = rowTotal * (itemDiscountPercent / 100);
            const rowAfterItemDiscount = Math.max(0, rowTotal - itemDiscountAmount);

            // Distribute global discount and tax proportionally
            const globalDiscPercent = parseFloat(globalDiscount) || 0;
            const rowAfterGlobalDiscount = rowAfterItemDiscount * (1 - (globalDiscPercent / 100));

            const taxPct = parseFloat(taxRate) || 0;
            const rowAfterTax = rowAfterGlobalDiscount * (1 + (taxPct / 100));

            const currentImpact = rowAfterTax;

            const totalAfterTrx = previouslyUsed + currentImpact;
            // Over budget now triggers if the transaction breaches the EFFECTIVE progress limit
            const isOverBudget = limitEffective > 0 && totalAfterTrx > limitEffective;

            return {
                id: item.id || index,
                name: item.title,
                limitTotal,
                limitEffective,
                remainingEffective,
                qtyBudget,
                qtyUnit,
                previouslyProcuredQty,
                remainingQty,
                previouslyUsed,
                currentImpact,
                totalAfterTrx,
                isOverBudget,
                projectProgress
            };
        }).filter(Boolean); // Remove nulls (empty rows)

    }, [items, selectedProject, type, globalDiscount, taxRate]);

    const isPayeeRequired = financialSummary.finalTotal >= 10000000;

    // Handlers for dynamic items
    const handleAddItem = () => {
        setItems(prev => [...prev, { id: Date.now(), title: '', qty: 1, unit: '', unitPrice: '', amount: 0, categoryId: '', subCategoryId: '', discount: 0 }]);
    };

    const handleRemoveItem = (idToRemove) => {
        setItems(prev => prev.filter(item => item.id !== idToRemove));
    };

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                // Duplicate validation for material selection
                if (field === 'title' && value) {
                    const isDuplicate = prev.some(otherItem => otherItem.id !== id && otherItem.title === value);
                    if (isDuplicate) {
                        alert(`Material "${value}" sudah ada di baris lain. Silakan ubah Qty pada baris tersebut.`);
                        return { ...item, title: '' }; // Force reset the title to empty
                    }
                }

                const updated = { ...item, [field]: value };
                // If title (Nama Item) changes from dropdown, try to autofill category
                if (field === 'title' && value) {
                    const activeMaterials = materials && materials.length > 0 ? materials : [];
                    const material = activeMaterials.find(m => m.name === value);
                    if (material) {
                        updated.unit = material.unit || '';
                        // Attempt to match category name to id
                        const matchedCat = categories.find(c => c.name.toLowerCase() === material.category?.toLowerCase());
                        if (matchedCat) {
                            updated.categoryId = matchedCat.id.toString();
                            // Attempt to match subCat
                            const matchedSub = subCategories.find(s => s.categoryId === matchedCat.id && s.name.toLowerCase() === material.subCategory?.toLowerCase());
                            if (matchedSub) {
                                updated.subCategoryId = matchedSub.id.toString();
                            } else {
                                updated.subCategoryId = '';
                            }
                        }
                    }
                }

                // Allow empty/partial number inputs for qty and discount to function normally during typing
                if (field === 'qty' || field === 'discount') {
                    updated[field] = value;
                }

                if (field === 'unitPrice') {
                    updated.unitPrice = value.replace(/[^0-9]/g, '');
                }

                return updated;
            }
            return item;
        }));
    };

    // File handler
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachedFile({
                    name: file.name,
                    data: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };
    const removeFile = () => setAttachedFile(null);

    const handleSaveTransactionClick = (e) => {
        e.preventDefault();

        if (!selectedProject) {
            alert('Mohon pilih Proyek.');
            return;
        }

        if (items.some(item => !item.title || !item.unitPrice || !item.categoryId)) {
            alert('Mohon lengkapi Nama Item, Harga Satuan, dan Kategori untuk semua baris.');
            return;
        }

        if (isPayeeRequired && !payee) {
            alert(`Transaksi >= Rp 10 Juta wajib mengisi Nama Penerima / Toko.`);
            return;
        }

        // Aggregate transaction for parent
        // In a real app we would pass the full `items` array, but to maintain compat 
        // with the parent's table rendering, we create an aggregated transaction.
        const mainCategoryInfo = categories.find(c => String(c.id) === String(items[0].categoryId)) || { name: 'Multiple' };
        const combinedTitle = items.map(i => i.title).join(', ');

        const newTrx = {
            id: editData ? editData.id : Date.now().toString(),
            type: type,
            title: combinedTitle,
            date: new Date(transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            rawDate: transactionDate,
            category: items.length > 1 ? 'Multiple Categories' : mainCategoryInfo.name,
            amount: financialSummary.finalTotal,
            account: 'Kas/Bank Default',
            payee: payee,
            notes: notes,
            project: selectedProject,
            file: attachedFile ? attachedFile.name : null,
            fileData: attachedFile ? attachedFile.data : null,
            taxRate: taxRate,
            globalDiscount: globalDiscount,
            _rawItems: items // send raw items if parent ever wants to read them
        };

        if (onSaveTransaction) {
            onSaveTransaction(newTrx);
        }
        onClose();
    };

    if (!isOpen) return null;

    // Filter project options
    const projectOptions = projectData.map(p => ({ value: p.name, label: p.name }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-10" onClick={onClose}></div>

            <form onSubmit={handleSaveTransactionClick} className={`relative z-20 w-full ${attachedFile?.data ? 'lg:max-w-[95vw]' : 'max-w-5xl'} bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col max-h-[90vh] overflow-hidden`}>
                <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-card-dark rounded-t-xl shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-icons-round">{editData ? 'edit' : 'add_card'}</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{editData ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{editData ? 'Perbarui rincian transaksi yang sudah ada' : 'Catat pengeluaran atau pemasukan kas proyek'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                        <span className="material-icons-round">close</span>
                    </button>
                </header>

                <div className={`flex-1 overflow-hidden flex ${attachedFile?.data ? 'flex-col lg:flex-row' : 'flex-col'}`}>

                    {/* LEFT SIDE: PREVIEW */}
                    {attachedFile?.data && (
                        <div className="hidden lg:flex w-[45%] flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50 overflow-hidden relative">
                            <div className="absolute top-4 left-4 z-10 bg-slate-900/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                <span className="material-icons-round text-[14px]">preview</span>
                                Preview Lampiran
                            </div>
                            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                                {attachedFile.data.startsWith('data:application/pdf') ? (
                                    <iframe
                                        src={attachedFile.data}
                                        className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white"
                                        title="PDF Preview"
                                    />
                                ) : (
                                    <img
                                        src={attachedFile.data}
                                        alt="Attachment Preview"
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* RIGHT SIDE: FORM */}
                    <div className={`flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar ${attachedFile?.data ? 'lg:w-[55%]' : 'w-full'}`}>

                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Proyek<span className="text-red-500 ml-1">*</span></label>
                                <SearchableSelect
                                    value={selectedProject}
                                    onChange={(val) => setSelectedProject(val)}
                                    placeholder="Pilih Proyek..."
                                    options={projectOptions}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Tanggal Transaksi<span className="text-red-500 ml-1">*</span></label>
                                <input
                                    type="date"
                                    className="w-full text-sm px-3 py-[9px] bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:text-white dark:[color-scheme:dark]"
                                    value={transactionDate}
                                    onChange={(e) => setTransactionDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Tipe Transaksi</label>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setType('in')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'in' ? 'bg-white dark:bg-card-dark text-green-600 shadow-sm border border-slate-200/50 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                                    >
                                        Masuk (In)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('out')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'out' ? 'bg-white dark:bg-card-dark text-red-600 shadow-sm border border-slate-200/50 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                                    >
                                        Keluar (Out)
                                    </button>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Section 2: Items Array */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Rincian Item</h2>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => {
                                    const allowedSubCats = categories.find(c => String(c.id) === String(item.categoryId))
                                        ? subCategories.filter(s => String(s.categoryId) === String(item.categoryId))
                                        : [];

                                    const categoryName = categories.find(c => String(c.id) === String(item.categoryId))?.name || '';
                                    const subCategoryName = subCategories.find(s => String(s.id) === String(item.subCategoryId))?.name || '';

                                    return (
                                        <div key={item.id} className="relative bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="absolute -top-3 -right-3 w-6 h-6 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center transition-colors border border-red-200 shadow-sm"
                                                >
                                                    <span className="material-icons-round text-[14px]">close</span>
                                                </button>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                {/* Item Name */}
                                                <div className="md:col-span-4 space-y-1.5">
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Item<span className="text-red-500 ml-1">*</span></label>
                                                    <SearchableSelect
                                                        value={item.title}
                                                        onChange={(val) => handleItemChange(item.id, 'title', val)}
                                                        placeholder="Pilih Material / Ketik Manual..."
                                                        options={(materials && materials.length > 0 ? materials : []).map(m => ({ value: m.name, label: m.name }))}
                                                    />
                                                </div>
                                                {/* Categories (Auto) */}
                                                <div className="md:col-span-5 grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Kategori</label>
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm px-3 py-2 bg-slate-100/50 dark:bg-background-dark border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-500 cursor-not-allowed"
                                                            value={categoryName}
                                                            placeholder="Auto-fill"
                                                            readOnly
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Sub-kategori</label>
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm px-3 py-2 bg-slate-100/50 dark:bg-background-dark border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-500 cursor-not-allowed"
                                                            value={subCategoryName}
                                                            placeholder="Auto-fill"
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                                {/* Qty & Unit */}
                                                <div className="md:col-span-3 grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Qty<span className="text-red-500 ml-1">*</span></label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="w-full text-sm px-3 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-center dark:text-white"
                                                            placeholder="1"
                                                            value={item.qty}
                                                            onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Satuan</label>
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm px-3 py-2 bg-slate-100/50 dark:bg-background-dark border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-500 cursor-not-allowed text-center"
                                                            value={item.unit}
                                                            placeholder="Auto"
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>

                                                {/* Price, Discount, Total aligned below */}
                                                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-1">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Harga Satuan (Rp)<span className="text-red-500 ml-1">*</span></label>
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm px-3 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-mono text-right dark:text-white"
                                                            placeholder="0"
                                                            value={item.unitPrice ? new Intl.NumberFormat('id-ID').format(item.unitPrice) : ''}
                                                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Diskon per Item (%)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max="100"
                                                            className="w-full text-sm px-3 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-center text-amber-600 dark:text-amber-400"
                                                            placeholder="0"
                                                            value={item.discount}
                                                            onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Subtotal Baris (Rp)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 flex items-center justify-end font-bold font-mono text-slate-700 dark:text-slate-200 text-right cursor-not-allowed"
                                                            value={new Intl.NumberFormat('id-ID').format(
                                                                (parseFloat(item.qty || 0) * parseInt((item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice.toString() : '0').replace(/[^0-9]/g, '') || 0, 10)) * (1 - (parseFloat(item.discount || 0) / 100))
                                                            )}
                                                            readOnly
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="mt-3 flex items-center justify-center w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-500 hover:text-primary hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <span className="material-icons-round text-[18px] mr-1">add</span>
                                Tambah Baris Item
                            </button>
                        </section>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Section 3: Summary, Budget & Rules */}
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Rules / Payee */}
                            <div className="lg:col-span-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Penerima & Catatan</h3>

                                <div className={`p-4 rounded-xl border ${isPayeeRequired ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark'} transition-colors duration-300`}>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            Penerima / Toko
                                            {isPayeeRequired && <span className="text-red-500">*</span>}
                                            {isPayeeRequired && (
                                                <span className="text-[10px] font-normal normal-case text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded ml-2">Transaksi {'>'}= 10 Juta</span>
                                            )}
                                        </label>
                                        <div className={`rounded-xl transition-all ${isPayeeRequired && !payee ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-card-dark' : ''}`}>
                                            <SearchableSelect
                                                value={payee}
                                                onChange={(val) => setPayee(val)}
                                                placeholder="Pilih atau Ketik Nama Penerima/Toko..."
                                                options={subcontractors.map(s => ({ value: s.name, label: s.name }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">Catatan Tambahan</label>
                                    <textarea
                                        className="w-full text-sm px-3 py-2 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none custom-scrollbar dark:text-white"
                                        rows={3}
                                        placeholder="Opsional: Tuliskan deskripsi atau keterangan lain..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Budget Impact Preview */}
                            <div className="lg:col-span-6">
                                <div className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5 h-full flex flex-col justify-between shadow-inner">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                                            <span className="material-icons-round text-slate-400">donut_large</span>
                                            Simulasi Anggaran Material
                                        </h3>

                                        <div className="space-y-4 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
                                            {budgetSimulations.length > 0 ? (
                                                budgetSimulations.map(sim => {
                                                    const formatRp = (val) => new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(val);

                                                    // Effective percentage base
                                                    const limitDisplay = sim.limitEffective > 0 ? sim.limitEffective : (sim.limitTotal > 0 ? sim.limitTotal : 1);
                                                    const prevPct = Math.min((sim.previouslyUsed / limitDisplay) * 100, 100);
                                                    const currentPct = Math.min((sim.currentImpact / limitDisplay) * 100, 100 - prevPct);

                                                    // Sisa styling
                                                    const currentSisa = sim.limitEffective > 0 ? Math.max(0, sim.limitEffective - sim.totalAfterTrx) : 0;
                                                    const sisaColor = currentSisa <= 0 && sim.limitEffective > 0 ? 'text-red-500 font-bold' : 'text-slate-500 font-medium dark:text-slate-400';

                                                    return (
                                                        <div key={sim.id} className="relative pt-1 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                            <div className="flex justify-between items-start text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                                                <div className="flex flex-col truncate max-w-[55%]">
                                                                    <span className="truncate text-sm" title={sim.name}>{sim.name}</span>
                                                                    {sim.qtyBudget > 0 && (
                                                                        <span className={`text-[10px] font-normal mt-0.5 ${sim.remainingQty < 0 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                                                                            Sisa Qty: {sim.remainingQty} {sim.qtyUnit}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-right flex flex-col items-end gap-0.5">
                                                                    <span className="text-[10px] text-slate-400 font-normal">Total Budget: <span className="font-semibold">{sim.limitTotal > 0 ? `Rp ${formatRp(sim.limitTotal)}` : 'N/A'}</span></span>
                                                                    <span className={`text-[11px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded ${sim.isOverBudget ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : ''}`}>
                                                                        Limit Efektif <span className="font-bold opacity-70">({sim.projectProgress}%)</span>: {sim.limitEffective > 0 ? `Rp ${formatRp(sim.limitEffective)}` : 'Rp 0'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                                <div className="flex flex-col bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800">
                                                                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Terpakai Historis</span>
                                                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Rp {formatRp(sim.previouslyUsed)}</span>
                                                                </div>
                                                                <div className="flex flex-col flex-1 bg-blue-50/50 dark:bg-blue-900/10 p-1.5 rounded-md border border-blue-100 dark:border-blue-900/30">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-[9px] uppercase tracking-wider text-primary font-bold">Dampak Trx</span>
                                                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Sisa Efektif</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-baseline">
                                                                        <span className="text-xs font-bold text-primary">+ Rp {formatRp(sim.currentImpact)}</span>
                                                                        <span className={`text-xs ${sisaColor}`}>Rp {formatRp(currentSisa)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex relative shadow-inner">
                                                                {/* Progress previously used */}
                                                                <div
                                                                    className={`h-full z-10 ${sim.previouslyUsed > sim.limitEffective && sim.limitEffective > 0 ? 'bg-red-400 dark:bg-red-500/50' : 'bg-slate-400 dark:bg-slate-500'}`}
                                                                    style={{ width: `${sim.limitEffective > 0 ? prevPct : (sim.previouslyUsed > 0 ? 100 : 0)}%` }}
                                                                    title={`Historis: Rp ${formatRp(sim.previouslyUsed)}`}
                                                                ></div>

                                                                {/* Progress current impact */}
                                                                {sim.currentImpact > 0 && (
                                                                    <div
                                                                        className={`h-full z-10 transition-all duration-500 shadow-[inset_1px_0_0_rgba(255,255,255,0.2)] ${sim.isOverBudget ? 'bg-red-500 dark:bg-red-600' : 'bg-primary'}`}
                                                                        style={{
                                                                            width: `${sim.limitEffective > 0 ? currentPct : 100}%`,
                                                                            opacity: sim.limitEffective === 0 ? 0.7 : 1 // Styling diff for unbudgeted
                                                                        }}
                                                                        title={`Dampak Trx: Rp ${formatRp(sim.currentImpact)}`}
                                                                    ></div>
                                                                )}
                                                            </div>
                                                            {sim.isOverBudget && (
                                                                <div className="flex justify-between items-center mt-1.5">
                                                                    <p className="text-[10px] text-red-500 flex items-center gap-1 font-bold bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-md">
                                                                        <span className="material-icons-round text-[12px]">warning</span>
                                                                        Melebihi Limit Efektif!
                                                                    </p>
                                                                    {sim.totalAfterTrx <= sim.limitTotal && (
                                                                        <span className="text-[9px] text-amber-600 dark:text-amber-500 italic">Meskipun di bawah Total Anggaran</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center">
                                                    <span className="material-icons-round text-3xl mb-2 opacity-50">data_usage</span>
                                                    {type !== 'out'
                                                        ? 'Simulasi anggaran hanya untuk transaksi Keluar (Out).'
                                                        : 'Pilih Proyek dan Nama Item untuk melihat simulasi.'
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Diskon Global (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full text-sm px-2 py-1.5 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-mono text-center text-amber-600 dark:text-amber-400"
                                                    placeholder="0"
                                                    value={globalDiscount}
                                                    onChange={(e) => setGlobalDiscount(e.target.value)}
                                                />
                                                {financialSummary.globalDiscountAmount > 0 && (
                                                    <div className="text-[10px] text-amber-600 font-medium text-right">- Rp {new Intl.NumberFormat('id-ID').format(financialSummary.globalDiscountAmount)}</div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Pajak / PPN (%)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full text-sm px-2 py-1.5 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-primary focus:border-primary font-mono text-center text-primary"
                                                    placeholder="11"
                                                    value={taxRate}
                                                    onChange={(e) => setTaxRate(e.target.value)}
                                                />
                                                {financialSummary.taxAmount > 0 && (
                                                    <div className="text-[10px] text-primary font-medium text-right">+ Rp {new Intl.NumberFormat('id-ID').format(financialSummary.taxAmount)}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Grand Total</span>
                                            <span className="text-2xl font-black font-mono text-primary break-all">
                                                Rp {new Intl.NumberFormat('id-ID').format(financialSummary.finalTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mt-1">
                                            <span>Proyek: {selectedProject || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-slate-100 dark:border-slate-800" />

                        {/* Section 4: File Upload */}
                        <section>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">Lampiran Bukti / Nota</label>
                            {!attachedFile ? (
                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group bg-slate-50/30 dark:bg-slate-800/20">
                                    <div className="space-y-1 text-center">
                                        <span className="material-icons-round text-4xl text-slate-400 group-hover:text-primary transition-colors">cloud_upload</span>
                                        <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                                            <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none">
                                                <span>Upload file dokumen</span>
                                                <input className="sr-only" type="file" onChange={handleFileChange} accept="image/*,.pdf" />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 5MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <span className="material-icons-round text-2xl">description</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate" title={attachedFile.name}>{attachedFile.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Tersimpan</p>
                                    </div>
                                    <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0 tooltip">
                                        <span className="material-icons-round text-lg">delete</span>
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Footer Buttons */}
                <footer className="px-6 py-4 bg-slate-50 dark:bg-card-dark border-t border-slate-200 dark:border-slate-700 rounded-b-xl flex items-center justify-between shrink-0">
                    <p className="text-xs text-slate-400 italic hidden sm:block">Periksa kembali rincian item sebelum menyimpan.</p>
                    <div className="flex gap-3 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                        >
                            <span className="material-icons-round text-[18px]">save</span>
                            {editData ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </footer>
            </form>
        </div>
    );
}
