import React, { useState, useEffect } from 'react';
import { MATERIAL_DATABASE } from '../data/materialData';
import { SUBCON_DATABASE } from '../data/subcontractorData';
import SearchableSelect from './SearchableSelect';

// ─── Phase Config ─────────────────────────────────────────────────────────────
const PHASE_CONFIG = {
    pr: { label: 'PR (Permintaan)', icon: 'assignment' },
    rfq: { label: 'RFQ / RFP', icon: 'request_quote' },
    selection: { label: 'Seleksi Vendor', icon: 'how_to_vote' },
    po: { label: 'PO (Pesanan)', icon: 'shopping_bag' },
    invoice: { label: 'Invoice', icon: 'receipt_long' },
    do: { label: 'DO (Diterima)', icon: 'local_shipping' },
    evaluation: { label: 'Evaluasi', icon: 'star_rate' },
    done: { label: 'Selesai', icon: 'task_alt' },
};

// ─── Phase Specific Edit Fields ───────────────────────────────────────────────
function getPhaseFields(stage) {
    switch (stage) {
        case 'pr':
            return [
                { name: 'title', label: 'Nama Kartu / Judul PR', type: 'text', required: true, placeholder: 'Cth: Semen Portland 50kg' },
            ];
        case 'rfq':
            const savedSubconsStr = localStorage.getItem('subcontractors');
            const activeSubcons = savedSubconsStr ? JSON.parse(savedSubconsStr) : SUBCON_DATABASE;
            const vendorOptions = activeSubcons.map(v => v.name);
            return [
                { name: 'due', label: 'Batas Waktu', type: 'text', required: true, placeholder: 'Cth: Besok / 24 Okt' },
                { name: 'targetVendors', label: 'Target Vendors', type: 'multiselect', required: true, options: vendorOptions }
            ];
        case 'selection':
            return [
                { name: 'est', label: 'Penawaran Terbaik', type: 'currency', required: true, placeholder: 'Cth: Rp 15.000.000' }
            ];
        case 'po':
            return [
                { name: 'total', label: 'Total Nilai PO', type: 'currency', required: true },
                { name: 'store', label: 'Supplier / Vendor', type: 'vendor_select', required: true, amountField: 'total' },
                { name: 'eta', label: 'Max ETA', type: 'date', required: true },
            ];
        case 'invoice':
            return [
                { name: 'bills', label: 'Daftar Tagihan (Termin)', type: 'multi_bill', required: true }
            ];
        case 'do':
            return [
                { name: 'recv', label: 'Diterima Oleh (Receiver)', type: 'text', required: true, placeholder: 'Nama penerima...' },
                { name: 'qty', label: 'Jumlah Datang', type: 'text', required: false, placeholder: 'Cth: 50 M3' }
            ];
        case 'evaluation':
            return [
                { name: 'statusLabel', label: 'Label Rating', type: 'text', required: false, placeholder: 'Cth: Rating: 4 Bintang' }
            ];
        case 'done':
            return [
                { name: 'total', label: 'Total Nilai Akhir', type: 'currency', required: true }
            ];
        default:
            return [];
    }
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const formatRupiah = (val) => {
    if (!val) return '';
    const numericStr = val.toString().replace(/[^0-9]/g, '');
    if (!numericStr) return '';
    return 'Rp ' + parseInt(numericStr, 10).toLocaleString('id-ID');
};

const parseRupiah = (valStr) => {
    if (!valStr || typeof valStr !== 'string') return 0;
    const numericStr = valStr.replace(/[^0-9-]/g, '');
    return parseInt(numericStr, 10) || 0;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditItemModal({ isOpen, onClose, item, onSubmit }) {
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Core state
    const [title, setTitle] = useState('');
    const [items, setItems] = useState([]);
    const [materialDatabase, setMaterialDatabase] = useState([]);

    // Phase state
    const [phaseData, setPhaseData] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);

            // Init material db
            const savedMats = localStorage.getItem('materials');
            setMaterialDatabase(savedMats ? JSON.parse(savedMats) : MATERIAL_DATABASE);

            // Check if it has rawItems (from PR combine or single form creation)
            if (item.rawItems && item.rawItems.length > 0) {
                setItems([...item.rawItems]);
            } else {
                // Mock raw items if missing
                const qtyNumeric = parseInt((item.vol || item.qty || '0').toString().replace(/[^0-9]/g, '')) || 1;
                const unitStr = (item.vol || item.qty || '').toString().replace(/[0-9\s]/g, '') || 'Unit';
                const estValue = parseRupiah(item.est || '0');

                setItems([{
                    id: Date.now(),
                    name: item.title,
                    category: item.type || 'Material',
                    unit: unitStr,
                    qty: qtyNumeric,
                    price: estValue / qtyNumeric || 0,
                    initialBudget: 0,
                    contractQty: 0
                }]);
            }

            // Init phase specific data
            setTitle(item.title || '');

            // Format bills array if editing an invoice
            let initialBills = [];
            if (item.stage === 'invoice') {
                if (item.bills && Array.isArray(item.bills) && item.bills.length > 0) {
                    initialBills = [...item.bills];
                } else {
                    // Fallback for old single-invoice data
                    initialBills = [{
                        id: Date.now(),
                        label: 'Tagihan 1',
                        amount: item.total || 'Rp 0',
                        due: item.due || '',
                        status: item.status || 'Unpaid'
                    }];
                }
            }

            // Init phase specific data
            setPhaseData({
                ...item,
                ...(item.stage === 'invoice' ? { bills: initialBills } : {})
            });
            setError('');
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, item]);

    if (!isVisible || !item) return null;

    const isPRPhase = item.stage === 'pr';
    const phaseFields = getPhaseFields(item.stage);
    const config = PHASE_CONFIG[item.stage] || PHASE_CONFIG.pr;

    // Table Handlers
    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), name: '', category: 'Material', unit: 'Pcs', qty: 0, price: 0, initialBudget: 0, contractQty: 0 }]);
    };

    const handleRemoveItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleItemChange = (id, field, value) => {
        if (!isPRPhase) return; // Prevent logic updates if locked
        if (field === 'name') {
            const selectedMaterial = materialDatabase.find(m => m.name === value);
            if (selectedMaterial) {
                setItems(items.map(i => i.id === id ? {
                    ...i, name: selectedMaterial.name, category: selectedMaterial.category || 'Material',
                    unit: selectedMaterial.unit || 'Pcs', price: selectedMaterial.ahsPrice || selectedMaterial.price || 0,
                    initialBudget: selectedMaterial.initialBudget || 0, contractQty: selectedMaterial.contractQty || 0
                } : i));
            } else {
                setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
            }
        } else {
            setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
        }
    };

    const calculateTotal = () => items.reduce((sum, i) => sum + (i.qty * i.price), 0);

    // Phase Fields Handler
    const handlePhaseDataChange = (name, value) => setPhaseData(prev => ({ ...prev, [name]: value }));

    const handleSubmit = () => {
        // Validate items table if PR
        if (isPRPhase) {
            if (items.length === 0) {
                setError('Requisition daftar item tidak boleh kosong.');
                return;
            }
            if (items.some(i => !i.name || i.name.trim() === '')) {
                setError('Terdapat item tanpa nama di daftar rincian.');
                return;
            }
        }

        // Validate required phase form fields
        for (const field of phaseFields) {
            let isFieldRequired = field.required;
            if (field.type === 'vendor_select') {
                const amountStr = phaseData[field.amountField] || '';
                const amountNum = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
                if (amountNum < 10000000) {
                    isFieldRequired = false;
                }
            }

            if (field.type === 'multi_bill') {
                const bills = phaseData.bills || [];
                if (bills.length === 0) {
                    setError('Minimal harus ada 1 tagihan.');
                    return;
                }
                for (const bill of bills) {
                    const amt = parseRupiah(bill.amount);
                    if (amt <= 0) {
                        setError(`Jumlah untuk ${bill.label} tidak valid.`);
                        return;
                    }
                }
            } else if (isFieldRequired && field.name !== 'title') {
                const val = phaseData[field.name];
                if (!val || (typeof val === 'string' && val.trim() === '') || val === false || val === 0) {
                    setError(`Field "${field.label}" wajib diisi.`);
                    return;
                }
            }
        }

        // Assemble returned object explicitly mapping raw items + fields
        const totalEst = calculateTotal();
        const updatedTitle = phaseData.title || title;

        let finalPhaseData = { ...phaseData };

        // If editing invoice, calculate aggregates
        if (item.stage === 'invoice' && finalPhaseData.bills) {
            const sum = finalPhaseData.bills.reduce((acc, b) => acc + parseRupiah(b.amount), 0);
            finalPhaseData.total = `Rp ${sum.toLocaleString('id-ID')}`;

            const allPaid = finalPhaseData.bills.every(b => b.status === 'Lunas');
            const allUnpaid = finalPhaseData.bills.every(b => b.status === 'Unpaid');
            finalPhaseData.status = allPaid ? 'Lunas' : allUnpaid ? 'Unpaid' : 'Dibayar Sebagian';
        }

        const returnedData = {
            ...finalPhaseData, // applies phase specific edits safely over the original structure mappings
            rawItems: items, // overrides with the (potentially updated) table
        };

        // If it's PR, sync the top-level estimate and title if they changed it
        if (isPRPhase) {
            returnedData.title = updatedTitle;
            returnedData.est = `Rp ${totalEst.toLocaleString('id-ID')}`;
            if (items.length > 1) {
                returnedData.vol = `${items.length} Item`;
            } else if (items.length === 1) {
                returnedData.vol = `${items[0].qty} ${items[0].unit}`;
                // Auto-sync type if it's 1 item
                returnedData.type = items[0].category;
            }
        }

        onSubmit(returnedData);
    };

    const inputClass = "w-full rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-darker text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`bg-white dark:bg-surface-dark w-full max-w-6xl rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[95vh] relative z-10 transition-all duration-300 transform ${animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-darker rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary">edit_document</span>
                            Edit Data Item Pengadaan
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-500">{item.code} • {item.project}</span>
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                <span className={`material-icons text-[12px]`}>{config.icon}</span>
                                {config.label}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">

                    {/* Locked Banner Warning */}
                    {!isPRPhase && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-lg flex items-start gap-3">
                            <span className="material-icons text-yellow-600 dark:text-yellow-500 mt-0.5">lock</span>
                            <div>
                                <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Daftar Item Terkunci</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-500/80 mt-1">
                                    Kartu ini telah melewati fase Request (PR) dan daftar item tidak dapat diubah lagi. Anda hanya dapat memperbarui data metadata spesifik fase di bagian bawah.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                                Daftar Rincian Barang / Jasa
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Menampilkan {items.length} item</span>
                        </div>

                        {/* Table */}
                        <div className={`border border-slate-200 dark:border-white/10 rounded-lg overflow-x-auto ${!isPRPhase ? 'opacity-90 grayscale-[20%]' : 'overflow-visible'}`}>
                            <table className="w-full text-left text-sm min-w-[800px]">
                                <thead className="bg-slate-50 dark:bg-surface-darker border-b border-slate-200 dark:border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-12 text-center">#</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 min-w-[300px]">Nama Item / Deskripsi</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-24">Satuan</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-24 text-right">Qty</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-32 text-right">Est. Harga (IDR)</th>
                                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-32 text-right">Total (IDR)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5 bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200">
                                    {items.map((it, index) => (
                                        <tr key={it.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-center text-slate-400">{index + 1}</td>
                                            <td className="px-4 py-2 relative z-[60]">
                                                {isPRPhase ? (
                                                    <div className="flex flex-col gap-1">
                                                        <SearchableSelect
                                                            value={it.name}
                                                            onChange={(val) => handleItemChange(it.id, 'name', val)}
                                                            placeholder="Pilih Material..."
                                                            options={materialDatabase.map((m) => ({ value: m.name, label: `${m.name} (${m.category})` }))}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={it.category}
                                                            onChange={(e) => handleItemChange(it.id, 'category', e.target.value)}
                                                            className="text-xs text-slate-500 bg-transparent border-b border-transparent focus:border-primary outline-none"
                                                            placeholder="Kategori..."
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="font-medium text-slate-800 dark:text-white">
                                                        {it.name} <span className="block text-xs text-slate-500 font-normal mt-0.5">{it.category}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isPRPhase ? (
                                                    <input
                                                        type="text"
                                                        value={it.unit}
                                                        onChange={(e) => handleItemChange(it.id, 'unit', e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none"
                                                    />
                                                ) : it.unit}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isPRPhase ? (
                                                    <input
                                                        className="w-full bg-transparent border border-slate-300 dark:border-white/20 rounded px-2 py-1 text-right focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                        type="number"
                                                        value={it.qty}
                                                        onChange={(e) => handleItemChange(it.id, 'qty', parseInt(e.target.value) || 0)}
                                                    />
                                                ) : <span className="font-semibold text-primary">{it.qty}</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-500 text-sm">
                                                Rp {it.price.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-100">
                                                Rp {(it.qty * it.price).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Top Level Summary Sync */}
                        <div className="mt-4 flex justify-between items-center px-2 mb-8">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Akumulasi Rincian:</span>
                            <span className="text-xl font-bold text-primary">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                        </div>

                        {/* Budget Preview Section */}
                        <div className="bg-slate-50 dark:bg-surface-darker border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons text-yellow-500 text-sm">analytics</span>
                                    Budget Preview Per Item
                                </h3>
                                <span className="text-xs bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">Update Real-Time</span>
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
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />

                    {/* Phase Specific Form Data */}
                    <div className="bg-slate-50 dark:bg-surface-darker border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-inner relative">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-icons text-primary text-xl">tune</span>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Metadata {config.label}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Edit informasi yang tertera pada kartu dan detail kanban saat ini.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {phaseFields.length === 0 ? (
                                <div className="col-span-full text-center py-4 text-slate-500 italic text-sm">Tidak ada metadata khusus untuk diedit di fase ini.</div>
                            ) : null}

                            {phaseFields.map(field => {
                                let isFieldRequired = field.required;
                                if (field.type === 'vendor_select') {
                                    const amountStr = phaseData[field.amountField] || '';
                                    const amountNum = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
                                    if (amountNum < 10000000) {
                                        isFieldRequired = false;
                                    }
                                }

                                return (
                                    <div key={field.name} className={`${field.type === 'textarea' || field.type === 'multiselect' || field.type === 'multi_bill' ? 'col-span-full' : ''}`}>
                                        <label className={labelClass}>{field.label}{isFieldRequired && <span className="text-red-500 ml-1">*</span>}</label>

                                        {field.type === 'text' && (
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder={field.placeholder}
                                                value={phaseData[field.name] || ''}
                                                onChange={e => handlePhaseDataChange(field.name, e.target.value)}
                                            />
                                        )}
                                        {field.type === 'currency' && (
                                            <input
                                                type="text"
                                                className={inputClass}
                                                placeholder={field.placeholder}
                                                value={phaseData[field.name] || ''}
                                                onChange={e => handlePhaseDataChange(field.name, formatRupiah(e.target.value))}
                                            />
                                        )}
                                        {field.type === 'vendor_select' && (() => {
                                            const amountStr = phaseData[field.amountField] || '';
                                            const amountNum = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
                                            const hasAmount = amountNum > 0;
                                            const isBelow10M = amountNum < 10000000;
                                            const isManual = phaseData[`_manual_${field.name}`];

                                            return (
                                                <div className="space-y-2">
                                                    {!hasAmount ? (
                                                        <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                                            <span className="material-icons-round text-[16px] inline-block align-text-bottom mr-1">info</span>
                                                            Silakan isi <strong>Total Nilai PO</strong> terlebih dahulu untuk memilih vendor.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {isBelow10M && (
                                                                <label className="flex items-start gap-3 cursor-pointer group select-none -mt-1 mb-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!isManual}
                                                                        onChange={e => handlePhaseDataChange(`_manual_${field.name}`, e.target.checked)}
                                                                        className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                                                                    />
                                                                    <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Input Manual Vendor (PO &lt; 10 Juta)</span>
                                                                </label>
                                                            )}

                                                            {isManual && isBelow10M ? (
                                                                <input
                                                                    type="text"
                                                                    className={inputClass}
                                                                    placeholder="Ketik Nama Vendor..."
                                                                    value={phaseData[field.name] || ''}
                                                                    onChange={e => handlePhaseDataChange(field.name, e.target.value)}
                                                                />
                                                            ) : (
                                                                <select
                                                                    className={inputClass}
                                                                    value={phaseData[field.name] || ''}
                                                                    onChange={e => handlePhaseDataChange(field.name, e.target.value)}
                                                                >
                                                                    <option value="" disabled>Pilih Vendor dari Database...</option>
                                                                    {SUBCON_DATABASE.map(sub => (
                                                                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        {field.type === 'select' && (() => {
                                            let isDisabled = false;
                                            let warningMsg = null;

                                            if (field.name === 'status' || field.name === 'paymentStatus') {
                                                const invTotalStr = phaseData['total'] || phaseData['invoiceValue'] || '';
                                                const invTotalNum = parseInt(invTotalStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
                                                if (invTotalNum >= 10000000) {
                                                    isDisabled = true;
                                                    warningMsg = "Status Pembayaran untuk invoice >= 10 Juta hanya dapat diubah oleh tim Finance.";
                                                }
                                            }

                                            return (
                                                <div className="space-y-2">
                                                    <select
                                                        className={inputClass}
                                                        value={phaseData[field.name] || ''}
                                                        onChange={e => handlePhaseDataChange(field.name, e.target.value)}
                                                        disabled={isDisabled}
                                                    >
                                                        <option value="" disabled>Pilih...</option>
                                                        {field.options.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    {warningMsg && (
                                                        <div className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                            <span className="material-icons-round text-[14px]">info</span>
                                                            <span>{warningMsg}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        {field.type === 'multiselect' && (
                                            <div className="relative">
                                                <div
                                                    className={`${inputClass} min-h-[42px] py-1.5 flex flex-wrap gap-1.5 cursor-text`}
                                                    onClick={() => handlePhaseDataChange(`_open_${field.name}`, !phaseData[`_open_${field.name}`])}
                                                >
                                                    {(phaseData[field.name] || []).length === 0 && (
                                                        <span className="text-slate-400 mt-0.5">{field.placeholder || 'Pilih...'}</span>
                                                    )}
                                                    {(phaseData[field.name] || []).map(opt => (
                                                        <span key={opt} className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                                            {opt}
                                                            <span
                                                                className="material-icons-round text-[14px] cursor-pointer hover:text-primary-hover"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePhaseDataChange(field.name, phaseData[field.name].filter(item => item !== opt));
                                                                }}
                                                            >
                                                                close
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                                {phaseData[`_open_${field.name}`] && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => handlePhaseDataChange(`_open_${field.name}`, false)}></div>
                                                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                                            {field.options.map(opt => {
                                                                const isSelected = (phaseData[field.name] || []).includes(opt);
                                                                return (
                                                                    <div
                                                                        key={opt}
                                                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${isSelected ? 'text-primary font-medium bg-primary/5 dark:bg-primary/10' : 'text-slate-700 dark:text-slate-300'}`}
                                                                        onClick={() => {
                                                                            const current = phaseData[field.name] || [];
                                                                            if (isSelected) {
                                                                                handlePhaseDataChange(field.name, current.filter(item => item !== opt));
                                                                            } else {
                                                                                handlePhaseDataChange(field.name, [...current, opt]);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {opt}
                                                                        {isSelected && <span className="material-icons-round text-[16px]">check</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Multi Bill Builder */}
                                        {field.type === 'multi_bill' && (
                                            <div className="space-y-3 bg-white dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                                                {(phaseData.bills || []).map((bill, index) => (
                                                    <div key={bill.id || index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start relative group p-3 border border-slate-200 dark:border-white/10 rounded-lg hover:border-primary/50 transition-colors">
                                                        <div className="md:col-span-3">
                                                            <label className="block text-xs text-slate-500 mb-1">Nama Tagihan</label>
                                                            <input
                                                                type="text"
                                                                className={inputClass}
                                                                value={bill.label}
                                                                onChange={(e) => {
                                                                    const newBills = [...phaseData.bills];
                                                                    newBills[index].label = e.target.value;
                                                                    handlePhaseDataChange('bills', newBills);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <label className="block text-xs text-slate-500 mb-1">Nominal (Rp)</label>
                                                            <input
                                                                type="text"
                                                                className={inputClass}
                                                                value={bill.amount}
                                                                onChange={(e) => {
                                                                    const newBills = [...phaseData.bills];
                                                                    newBills[index].amount = formatRupiah(e.target.value);
                                                                    handlePhaseDataChange('bills', newBills);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <label className="block text-xs text-slate-500 mb-1">Jatuh Tempo</label>
                                                            <input
                                                                type="date"
                                                                className={inputClass}
                                                                value={bill.due}
                                                                onChange={(e) => {
                                                                    const newBills = [...phaseData.bills];
                                                                    newBills[index].due = e.target.value;
                                                                    handlePhaseDataChange('bills', newBills);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-xs text-slate-500 mb-1">Status</label>
                                                            <select
                                                                className={inputClass}
                                                                value={bill.status || 'Unpaid'}
                                                                onChange={(e) => {
                                                                    const newBills = [...phaseData.bills];
                                                                    newBills[index].status = e.target.value;
                                                                    handlePhaseDataChange('bills', newBills);
                                                                }}
                                                            >
                                                                <option value="Unpaid">Unpaid</option>
                                                                <option value="Dibayar Sebagian">Dibayar Sebagian</option>
                                                                <option value="Lunas">Lunas</option>
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-1 flex justify-end mt-6">
                                                            {phaseData.bills.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newBills = phaseData.bills.filter((_, i) => i !== index);
                                                                        // Re-label
                                                                        newBills.forEach((b, i) => b.label = `Tagihan ${i + 1}`);
                                                                        handlePhaseDataChange('bills', newBills);
                                                                    }}
                                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                    title="Hapus Tagihan"
                                                                >
                                                                    <span className="material-icons-round text-[20px]">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="flex justify-between items-center mt-4">
                                                    <button
                                                        type="button"
                                                        className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                                                        onClick={() => {
                                                            const newBills = [...(phaseData.bills || [])];
                                                            newBills.push({
                                                                id: Date.now(),
                                                                label: `Tagihan ${newBills.length + 1}`,
                                                                amount: 'Rp 0',
                                                                due: '',
                                                                status: 'Unpaid'
                                                            });
                                                            handlePhaseDataChange('bills', newBills);
                                                        }}
                                                    >
                                                        <span className="material-icons text-[18px]">add_circle</span>
                                                        Tambah Tagihan
                                                    </button>

                                                    <div className="text-sm">
                                                        <span className="text-slate-500">Total Tagihan: </span>
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            Rp {(phaseData.bills || []).reduce((sum, b) => sum + parseRupiah(b.amount), 0).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {error && (
                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                                <span className="material-icons text-[18px]">error_outline</span>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-darker flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors">
                        Batal
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                        <span className="material-icons text-sm">save</span>
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}
