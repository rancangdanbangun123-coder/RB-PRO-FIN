import React, { useState, useEffect } from 'react';
import { SUBCON_DATABASE } from '../data/subcontractorData';

// ─── Phase Config ─────────────────────────────────────────────────────────────
const PHASE_CONFIG = {
    pr: { label: 'PR (Permintaan)', color: 'bg-slate-400', icon: 'assignment' },
    po: { label: 'PO (Pesanan)', color: 'bg-primary', icon: 'shopping_bag' },
    invoice: { label: 'Invoice', color: 'bg-orange-500', icon: 'receipt_long' },
    do: { label: 'DO (Diterima)', color: 'bg-teal-400', icon: 'local_shipping' },
    evaluation: { label: 'Evaluasi', color: 'bg-yellow-400', icon: 'star_rate' },
    done: { label: 'Selesai', color: 'bg-green-500', icon: 'task_alt' },
};

const COLUMN_ORDER = ['pr', 'po', 'invoice', 'do', 'evaluation', 'done'];

// ─── Helper ───────────────────────────────────────────────────────────────────
const isForward = (from, to) =>
    COLUMN_ORDER.indexOf(to) > COLUMN_ORDER.indexOf(from);

// ─── Field Definitions per transition ────────────────────────────────────────
function getFields(from, to, isEdit = false) {
    if (!isForward(from, to) && !isEdit) {
        return [
            { name: 'reason', label: 'Alasan Pengembalian', type: 'textarea', required: true, placeholder: 'Jelaskan mengapa item dikembalikan ke fase sebelumnya...' },
        ];
    }
    // Explicitly handle "Edit" mode mappings directly to current stage schema
    if (isEdit) {
        switch (from) {
            case 'pr':
                return [
                    { name: 'title', label: 'Nama Item / Deskripsi', type: 'text', required: true, placeholder: 'Cth: Semen Portland 50kg' },
                    { name: 'vol', label: 'Volume Detail', type: 'text', required: false, placeholder: 'Cth: 200 Sak' },
                    { name: 'qty', label: 'Quantity Numerik', type: 'text', required: false, placeholder: 'Cth: 200' },
                    { name: 'est', label: 'Estimasi Anggaran', type: 'text', required: false, placeholder: 'Cth: Rp 14.000.000' }
                ];
            case 'po':
                return [
                    { name: 'total', label: 'Total Nilai PO', type: 'currency', required: true },
                    { name: 'store', label: 'Supplier / Vendor', type: 'vendor_select', required: true, amountField: 'total' },
                    { name: 'eta', label: 'Max ETA', type: 'date', required: true },
                    { name: 'qty', label: 'Jumlah / Qty', type: 'text', required: false, placeholder: 'Cth: 50 M3' }
                ];
            case 'invoice':
                return [
                    { name: '_multiBill', label: 'Rincian Tagihan', type: 'multi_bill', required: true },
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
                return [{ name: 'title', label: 'Title', type: 'text', required: true }];
        }
    }

    switch (to) {
        case 'po':
            return [
                { name: 'poNumber', label: 'No. Purchase Order', type: 'text', required: false, placeholder: 'cth: PO-2024-001' },
                { name: 'poValue', label: 'Nilai PO (Rp)', type: 'currency', required: true, placeholder: 'cth: Rp 14.500.000' },
                { name: 'supplierName', label: 'Nama Supplier', type: 'vendor_select', required: true, amountField: 'poValue' },
                { name: 'poDate', label: 'Tanggal PO', type: 'date', required: true },
                { name: 'eta', label: 'Estimasi Tiba (ETA)', type: 'date', required: true },
            ];
        case 'invoice':
            return [
                { name: '_multiBill', label: 'Rincian Tagihan', type: 'multi_bill', required: true },
            ];
        case 'do':
            return [
                { name: 'doNumber', label: 'No. DO / Surat Jalan', type: 'text', required: true, placeholder: 'cth: SJ-2024-321' },
                { name: 'receivedBy', label: 'Diterima Oleh', type: 'text', required: true, placeholder: 'Nama penerima di lokasi' },
                { name: 'receivedDate', label: 'Tanggal Terima', type: 'date', required: true },
                { name: 'notes', label: 'Catatan Penerimaan', type: 'textarea', required: false, placeholder: 'Kondisi barang, kekurangan, dll.' },
            ];
        case 'evaluation':
            return [
                {
                    name: 'rating', label: 'Rating Supplier', type: 'rating', required: true,
                },
                { name: 'evalNotes', label: 'Catatan Evaluasi', type: 'textarea', required: false, placeholder: 'Ketepatan waktu, kualitas barang, dll.' },
            ];
        case 'done':
            return [
                { name: 'confirmComplete', label: 'Saya konfirmasi bahwa item ini telah selesai diproses', type: 'checkbox', required: true },
                { name: 'closingNotes', label: 'Catatan Penutup (Opsional)', type: 'textarea', required: false, placeholder: 'Ringkasan final, arsip referensi...' },
            ];
        default:
            return [
                { name: 'notes', label: 'Catatan', type: 'textarea', required: false, placeholder: 'Tambahkan catatan...' },
            ];
    }
}

// ─── Star Rating Sub-component ────────────────────────────────────────────────
function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                    <span className={`material-icons-round ${(hovered || value) >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}>
                        star
                    </span>
                </button>
            ))}
            {value > 0 && (
                <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400 self-center">
                    {['', 'Buruk', 'Kurang', 'Cukup', 'Baik', 'Sangat Baik'][value]}
                </span>
            )}
        </div>
    );
}

// ─── Utility: Currency Formatter ──────────────────────────────────────────────
const formatRupiah = (val) => {
    if (!val) return '';
    const numericStr = val.toString().replace(/[^0-9]/g, '');
    if (!numericStr) return '';
    return 'Rp ' + parseInt(numericStr, 10).toLocaleString('id-ID');
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PhaseTransitionModal({ isOpen, onClose, onConfirm, fromStage, toStage, item, isEdit }) {
    const [formData, setFormData] = useState({});
    const [animateIn, setAnimateIn] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState('');

    // Cache props to prevent layout flash during exit animation
    const [cachedFrom, setCachedFrom] = useState(fromStage);
    const [cachedTo, setCachedTo] = useState(toStage);
    const [cachedItem, setCachedItem] = useState(item);

    const fields = getFields(cachedFrom, cachedTo, isEdit);
    const forward = isForward(cachedFrom, cachedTo);
    const fromConfig = PHASE_CONFIG[cachedFrom] || {};
    const toConfig = PHASE_CONFIG[cachedTo] || {};

    useEffect(() => {
        if (isOpen) {
            setCachedFrom(fromStage);
            setCachedTo(toStage);
            setCachedItem(item);

            // Pre-fill fields if editing existing data, or handle autofill for transitions
            let initialData = isEdit && item ? { ...item } : {};

            if (!isEdit && isForward(fromStage, toStage) && toStage === 'invoice' && item) {
                // Auto-fill first bill from PO total
                const autoAmount = item.total || item.poValue || item.est || '';
                initialData.bills = [{ id: 1, label: 'Tagihan 1', amount: autoAmount, due: '', status: 'Unpaid' }];
            }
            if (isEdit && item?.bills) {
                initialData.bills = JSON.parse(JSON.stringify(item.bills));
            }

            setFormData(initialData);
            setError('');
            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);
        } else {
            setAnimateIn(false);
            const t = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(t);
        }
    }, [isOpen, fromStage, toStage]);

    if (!isVisible) return null;

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate required fields
        for (const field of fields) {
            let isFieldRequired = field.required;
            if (field.type === 'vendor_select') {
                const amountStr = formData[field.amountField] || '';
                const amountNum = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
                if (amountNum < 10000000) {
                    isFieldRequired = false;
                }
            }

            if (isFieldRequired) {
                if (field.type === 'multi_bill') {
                    const bills = formData.bills || [];
                    if (bills.length === 0) {
                        setError('Harus ada minimal 1 tagihan.');
                        return;
                    }
                    for (let i = 0; i < bills.length; i++) {
                        if (!bills[i].amount || bills[i].amount.trim() === '' || bills[i].amount === 'Rp 0') {
                            setError(`Tagihan ${i + 1}: Nilai tagihan wajib diisi.`);
                            return;
                        }
                    }
                    continue;
                }
                const val = formData[field.name];
                if (!val || (typeof val === 'string' && val.trim() === '') || val === false || val === 0) {
                    setError(`Field "${field.label}" wajib diisi.`);
                    return;
                }
            }
        }
        // Before submitting, derive aggregate fields from bills for the invoice phase
        let submitData = { ...formData };
        if (submitData.bills && Array.isArray(submitData.bills)) {
            const paidCount = submitData.bills.filter(b => b.status === 'Lunas').length;
            submitData.status = paidCount === submitData.bills.length ? 'Lunas' : paidCount > 0 ? 'Dibayar Sebagian' : 'Unpaid';
            // Sum amounts for total
            const totalNum = submitData.bills.reduce((sum, b) => {
                const num = parseInt((b.amount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
                return sum + num;
            }, 0);
            submitData.total = 'Rp ' + totalNum.toLocaleString('id-ID');
            submitData.invoiceValue = submitData.total;
            submitData.due = submitData.bills[0]?.due || 'TBD';
        }
        onConfirm(submitData);
    };

    const inputClass = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors";
    const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${animateIn ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'}`}>
            <div
                className={`bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] transition-all duration-300 ${animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-200 dark:border-border-dark flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                            {isEdit ? 'Edit Data Item' : (forward ? 'Konfirmasi Perubahan Fase' : '⚠️ Kembalikan ke Fase Sebelumnya')}
                        </h2>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                            <span className="material-icons-round text-xl">close</span>
                        </button>
                    </div>

                    {/* Phase flow indicator */}
                    {!isEdit && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg">
                                    <span className="material-icons-round text-sm text-slate-500">{fromConfig.icon}</span>
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{fromConfig.label}</span>
                                </div>
                                <span className={`material-icons-round ${forward ? 'text-primary' : 'text-orange-500'}`}>
                                    {forward ? 'arrow_forward' : 'arrow_back'}
                                </span>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${forward ? 'bg-primary/10' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                                    <span className={`material-icons-round text-sm ${forward ? 'text-primary' : 'text-orange-500'}`}>{toConfig.icon}</span>
                                    <span className={`text-xs font-semibold ${forward ? 'text-primary' : 'text-orange-600'}`}>{toConfig.label}</span>
                                </div>
                            </div>
                            {forward && cachedFrom === 'pr' && cachedTo === 'po' && (
                                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full flex items-center gap-1 border border-orange-200 dark:border-orange-800">
                                    <span className="material-icons-round text-[12px]">bolt</span> Langsung
                                </span>
                            )}
                        </div>
                    )}

                    {/* Item context */}
                    {cachedItem && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{cachedItem.code} • {cachedItem.project}</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5 truncate">{cachedItem.title}</p>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <div className="space-y-4">
                        {fields.map(field => {
                            let isFieldRequired = field.required;
                            if (field.type === 'vendor_select') {
                                const amountStr = formData[field.amountField] || '';
                                const amountNum = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
                                if (amountNum < 10000000) {
                                    isFieldRequired = false;
                                }
                            }

                            return (
                                <div key={field.name}>
                                    {field.type !== 'checkbox' && (
                                        <label className={labelClass}>{field.label}{isFieldRequired && <span className="text-red-500 ml-1">*</span>}</label>
                                    )}
                                    {field.type === 'text' && (
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                        />
                                    )}
                                    {field.type === 'number' && (
                                        <input
                                            type="number"
                                            min="1"
                                            className={inputClass}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                        />
                                    )}
                                    {field.type === 'currency' && (
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={e => handleChange(field.name, formatRupiah(e.target.value))}
                                        />
                                    )}
                                    {field.type === 'date' && (
                                        <input
                                            type="date"
                                            className={inputClass}
                                            value={formData[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                        />
                                    )}
                                    {field.type === 'vendor_select' && (() => {
                                        const amountStr = formData[field.amountField] || '';
                                        const amountNum = parseInt(amountStr.toString().replace(/[^0-9]/g, ''), 10) || 0;
                                        const hasAmount = amountNum > 0;
                                        const isBelow10M = amountNum < 10000000;
                                        const isManual = formData[`_manual_${field.name}`];

                                        return (
                                            <div className="space-y-2">
                                                {!hasAmount ? (
                                                    <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                                        <span className="material-icons-round text-[16px] inline-block align-text-bottom mr-1">info</span>
                                                        Silakan isi <strong>{field.amountField === 'total' ? 'Total Nilai PO' : 'Nilai PO (Rp)'}</strong> terlebih dahulu untuk memilih vendor.
                                                    </div>
                                                ) : (
                                                    <>
                                                        {isBelow10M && (
                                                            <label className="flex items-start gap-3 cursor-pointer group select-none -mt-1 mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!isManual}
                                                                    onChange={e => handleChange(`_manual_${field.name}`, e.target.checked)}
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
                                                                value={formData[field.name] || ''}
                                                                onChange={e => handleChange(field.name, e.target.value)}
                                                            />
                                                        ) : (
                                                            <select
                                                                className={inputClass}
                                                                value={formData[field.name] || ''}
                                                                onChange={e => handleChange(field.name, e.target.value)}
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
                                    {field.type === 'multiselect' && (
                                        <div className="relative">
                                            <div
                                                className={`${inputClass} min-h-[42px] py-1.5 flex flex-wrap gap-1.5 cursor-text`}
                                                onClick={() => {
                                                    const currentOpen = formData[`_open_${field.name}`];
                                                    handleChange(`_open_${field.name}`, !currentOpen);
                                                }}
                                            >
                                                {(formData[field.name] || []).length === 0 && (
                                                    <span className="text-slate-400 mt-0.5">{field.placeholder || 'Pilih vendor...'}</span>
                                                )}
                                                {(formData[field.name] || []).map(opt => (
                                                    <span key={opt} className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                                                        {opt}
                                                        <span
                                                            className="material-icons-round text-[14px] cursor-pointer hover:text-primary-hover"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleChange(field.name, formData[field.name].filter(item => item !== opt));
                                                            }}
                                                        >
                                                            close
                                                        </span>
                                                    </span>
                                                ))}
                                            </div>
                                            {formData[`_open_${field.name}`] && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => handleChange(`_open_${field.name}`, false)}></div>
                                                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                                                        {field.options.map(opt => {
                                                            const isSelected = (formData[field.name] || []).includes(opt);
                                                            return (
                                                                <div
                                                                    key={opt}
                                                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between ${isSelected ? 'text-primary font-medium bg-primary/5 dark:bg-primary/10' : 'text-slate-700 dark:text-slate-300'}`}
                                                                    onClick={() => {
                                                                        const current = formData[field.name] || [];
                                                                        if (isSelected) {
                                                                            handleChange(field.name, current.filter(item => item !== opt));
                                                                        } else {
                                                                            handleChange(field.name, [...current, opt]);
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
                                    {field.type === 'textarea' && (
                                        <textarea
                                            rows={3}
                                            className={inputClass}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                        />
                                    )}
                                    {field.type === 'select' && (
                                        <select
                                            className={inputClass}
                                            value={formData[field.name] || ''}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            disabled={field.disabled}
                                        >
                                            <option value="" disabled>Pilih...</option>
                                            {field.options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    )}
                                    {field.type === 'rating' && (
                                        <StarRating
                                            value={formData[field.name] || 0}
                                            onChange={val => handleChange(field.name, val)}
                                        />
                                    )}
                                    {field.type === 'checkbox' && (
                                        <label className="flex items-start gap-3 cursor-pointer group select-none">
                                            <input
                                                type="checkbox"
                                                checked={!!formData[field.name]}
                                                onChange={e => handleChange(field.name, e.target.checked)}
                                                className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{field.label}</span>
                                        </label>
                                    )}
                                    {field.type === 'multi_bill' && (() => {
                                        const bills = formData.bills || [];
                                        const updateBill = (idx, key, val) => {
                                            const newBills = bills.map((b, i) => i === idx ? { ...b, [key]: val } : b);
                                            handleChange('bills', newBills);
                                        };
                                        const addBill = () => {
                                            const newId = (Math.max(0, ...bills.map(b => b.id)) + 1);
                                            handleChange('bills', [...bills, { id: newId, label: `Tagihan ${bills.length + 1}`, amount: '', due: '', status: 'Unpaid' }]);
                                        };
                                        const removeBill = (idx) => {
                                            if (bills.length <= 1) return;
                                            const newBills = bills.filter((_, i) => i !== idx).map((b, i) => ({ ...b, label: `Tagihan ${i + 1}` }));
                                            handleChange('bills', newBills);
                                        };
                                        const totalNum = bills.reduce((sum, b) => {
                                            const num = parseInt((b.amount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
                                            return sum + num;
                                        }, 0);

                                        return (
                                            <div className="space-y-3">
                                                {bills.map((bill, idx) => (
                                                    <div key={bill.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                                                                <span className="material-icons-round text-[14px]">receipt</span>
                                                                {bill.label}
                                                            </span>
                                                            {bills.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeBill(idx)}
                                                                    className="text-slate-400 hover:text-red-500 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                >
                                                                    <span className="material-icons-round text-[16px]">close</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Nilai Tagihan *</label>
                                                                <input
                                                                    type="text"
                                                                    className={inputClass}
                                                                    placeholder="Rp 0"
                                                                    value={bill.amount || ''}
                                                                    onChange={e => updateBill(idx, 'amount', formatRupiah(e.target.value))}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Jatuh Tempo</label>
                                                                <input
                                                                    type="date"
                                                                    className={inputClass}
                                                                    value={bill.due || ''}
                                                                    onChange={e => updateBill(idx, 'due', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        {isEdit && (
                                                            <div>
                                                                <label className="text-[10px] font-medium text-slate-500 mb-0.5 block">Status</label>
                                                                <select
                                                                    className={inputClass}
                                                                    value={bill.status || 'Unpaid'}
                                                                    onChange={e => updateBill(idx, 'status', e.target.value)}
                                                                >
                                                                    <option value="Unpaid">Unpaid</option>
                                                                    <option value="Dibayar Sebagian">Dibayar Sebagian</option>
                                                                    <option value="Lunas">Lunas</option>
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={addBill}
                                                    className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-1.5 text-sm"
                                                >
                                                    <span className="material-icons-round text-[16px]">add_circle_outline</span> Tambah Tagihan
                                                </button>
                                                {/* Summary */}
                                                <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/10 p-2.5 rounded-lg border border-orange-200 dark:border-orange-800/40">
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{bills.length} Tagihan</span>
                                                    <span className="text-sm font-black text-orange-600 dark:text-orange-400">Total: Rp {totalNum.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                </form>

                {error && (
                    <div className="px-5 pb-2">
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                            <span className="material-icons-round text-[18px]">error_outline</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-border-dark flex-shrink-0 flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className={`px-5 py-2 rounded-lg text-sm font-bold text-white transition-colors shadow-sm flex items-center gap-2 ${isEdit || forward
                            ? 'bg-primary hover:bg-primary-hover shadow-primary/20'
                            : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                            }`}
                    >
                        <span className="material-icons-round text-[16px]">
                            {isEdit ? 'save' : (forward ? 'check_circle' : 'undo')}
                        </span>
                        {isEdit ? 'Simpan Perubahan' : (forward ? 'Konfirmasi & Pindahkan' : 'Kembalikan Item')}
                    </button>
                </div>
            </div>
        </div>
    );
}
