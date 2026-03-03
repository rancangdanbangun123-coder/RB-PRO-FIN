import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="bg-white dark:bg-card-dark w-full max-w-sm rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark relative z-10 p-6 transform transition-all scale-100">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-primary'}`}>
                        <span className="material-icons-round text-2xl">{type === 'danger' ? 'warning' : 'info'}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-hover transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg transition-transform active:scale-95 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-primary hover:bg-primary-hover shadow-primary/20'}`}
                        >
                            {type === 'danger' ? 'Hapus' : 'Konfirmasi'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
