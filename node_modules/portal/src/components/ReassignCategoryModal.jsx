import React, { useState, useEffect } from 'react';

/**
 * Modal that appears when deleting a category or subcategory that has linked materials.
 * Gives the user the option to reassign materials to another category/subcategory or clear them.
 *
 * Props:
 *   isOpen, onClose, onConfirm(action, targetId),
 *   type: "category" | "subcategory",
 *   itemName: string,
 *   affectedCount: number,
 *   availableTargets: [{ id, name }]
 */
export default function ReassignCategoryModal({ isOpen, onClose, onConfirm, type, itemName, affectedCount, availableTargets = [] }) {
    const [action, setAction] = useState('reassign'); // 'reassign' | 'clear'
    const [targetId, setTargetId] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setAction('reassign');
            setTargetId(availableTargets.length > 0 ? String(availableTargets[0].id) : '');
            setTimeout(() => setAnimateIn(true), 10);
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, availableTargets]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (action === 'reassign' && !targetId) {
            alert('Pilih target untuk memindahkan material!');
            return;
        }
        onConfirm(action, targetId);
    };

    if (!isVisible) return null;

    const label = type === 'category' ? 'Kategori' : 'Sub-Kategori';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 transform transition-all duration-300 ${animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <span className="material-icons-round text-amber-600 dark:text-amber-400 text-xl">warning</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hapus {label}</h2>
                        <p className="text-sm text-slate-500">{itemName}</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-lg">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Warning */}
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <span className="material-icons-round text-amber-500 text-lg mt-0.5">info</span>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Terdapat <strong>{affectedCount} material</strong> yang terkait dengan {label.toLowerCase()} ini. Pilih tindakan di bawah.
                        </p>
                    </div>

                    {/* Action Selection */}
                    <div className="space-y-3">
                        {/* Reassign option */}
                        <label
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${action === 'reassign'
                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="action"
                                value="reassign"
                                checked={action === 'reassign'}
                                onChange={() => setAction('reassign')}
                                className="mt-1 text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">Pindahkan ke {label.toLowerCase()} lain</p>
                                <p className="text-xs text-slate-500 mt-0.5">Material akan dipindahkan ke {label.toLowerCase()} yang dipilih</p>

                                {action === 'reassign' && (
                                    <select
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        className="mt-3 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        {availableTargets.length === 0 && (
                                            <option value="">-- Tidak ada {label.toLowerCase()} lain --</option>
                                        )}
                                        {availableTargets.map(t => (
                                            <option key={t.id} value={String(t.id)}>{t.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </label>

                        {/* Clear option */}
                        <label
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${action === 'clear'
                                ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="action"
                                value="clear"
                                checked={action === 'clear'}
                                onChange={() => setAction('clear')}
                                className="mt-1 text-red-500 focus:ring-red-500"
                            />
                            <div>
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">Hapus tanpa memindahkan</p>
                                <p className="text-xs text-slate-500 mt-0.5">Material akan kehilangan {label.toLowerCase()}-nya (menjadi "Tanpa Kategori")</p>
                            </div>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={action === 'reassign' && availableTargets.length === 0}
                            className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span className="material-icons-round text-[18px]">delete</span>
                            Hapus {label}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
