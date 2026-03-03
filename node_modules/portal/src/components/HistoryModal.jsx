import React, { useState, useEffect } from 'react';

const PHASE_LABELS = {
    pr: 'PR',
    rfq: 'RFQ',
    selection: 'Seleksi',
    po: 'PO',
    invoice: 'Invoice',
    do: 'Delivery Order',
    evaluation: 'Evaluasi',
    done: 'Selesai'
};

export default function HistoryModal({ isOpen, onClose, item }) {
    const [animateIn, setAnimateIn] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            setIsVisible(true);
            const timer = setTimeout(() => setAnimateIn(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, item]);

    if (!isVisible || !item) return null;

    const transitions = item.transitions || [];

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${animateIn ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'}`}>
            <div
                className={`bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] transition-all duration-300 ${animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-200 dark:border-border-dark flex-shrink-0 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons-round text-primary">history</span>
                            Riwayat Pembelian
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Tracking perjalanan item <span className="font-semibold text-slate-700 dark:text-slate-300">{item.code}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Body - Timeline */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-background-dark">
                    {transitions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <span className="material-icons-round text-4xl mb-2 opacity-50">hourglass_empty</span>
                            <p className="text-sm">Belum ada riwayat pergerakan fase untuk item ini.</p>
                        </div>
                    ) : (
                        <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700/50 space-y-8">
                            {transitions.map((transition, index) => (
                                <div key={index} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-card-dark border-2 border-primary shadow-sm"></div>

                                    {/* Content Card */}
                                    <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                                                    {PHASE_LABELS[transition.from] || transition.from.toUpperCase()}
                                                </span>
                                                <span className="material-icons-round text-sm text-slate-400">arrow_forward</span>
                                                <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                                                    {PHASE_LABELS[transition.to] || transition.to.toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">calendar_today</span>
                                                {transition.date}
                                            </span>
                                        </div>

                                        {/* Data Payload display */}
                                        {transition.data && Object.keys(transition.data).length > 0 && (
                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                                {Object.entries(transition.data).map(([key, value]) => {
                                                    // Ignore structural or very long fields if desired, but here we show all for transparency
                                                    if (value === '' || value === null || value === undefined) return null;
                                                    // Ignore internal state fields that start with underscore (_)
                                                    if (key.startsWith('_')) return null;

                                                    // Format array (like multiselect vendors)
                                                    const displayValue = Array.isArray(value) ? value.join(', ') : String(value);

                                                    return (
                                                        <div key={key} className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                            <span className="text-sm text-slate-800 dark:text-slate-200">{displayValue}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-border-dark flex justify-end bg-white dark:bg-card-dark rounded-b-2xl shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
