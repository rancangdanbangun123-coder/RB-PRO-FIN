import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import SearchableSelect from './SearchableSelect';

export default function AddSupplyModal({ isOpen, onClose, onSave, existingMaterialIds = [], initialData = null }) {
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        materialId: '',
        price: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [availableMaterials, setAvailableMaterials] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);

            (async () => {
                try {
                    const mats = await api.materials.list();
                    const filtered = (mats || []).filter(m => {
                        const isInactive = ['inactive', 'tidak aktif'].includes((m.status || '').toLowerCase());
                        if (isInactive) return false;
                        return !existingMaterialIds.includes(m.id) || (initialData && m.id === initialData.materialId);
                    });
                    setAvailableMaterials(filtered);
                } catch (err) { console.error(err); }
            })();

            if (initialData) {
                setFormData({
                    materialId: initialData.materialId,
                    price: initialData.price,
                    date: initialData.date || new Date().toISOString().split('T')[0]
                });
            } else {
                // Reset form for new entry
                setFormData({
                    materialId: '',
                    price: '',
                    date: new Date().toISOString().split('T')[0]
                });
            }
            setError(''); // Reset error on open
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, existingMaterialIds, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault(); // Keep preventDefault just in case triggered by form


        if (!formData.materialId) {
            setError('Mohon pilih material terlebih dahulu');
            return;
        }
        if (!formData.price) {
            setError('Mohon isi harga kontrak');
            return;
        }

        try {
            onSave({
                materialId: formData.materialId,
                price: Number(formData.price),
                date: formData.date
            });
            onClose();
        } catch (err) {
            console.error("Error saving supply:", err);
            setError('Terjadi kesalahan saat menyimpan: ' + err.message);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${animateIn ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div
                className={`bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 relative overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">{initialData ? 'edit' : 'add_link'}</span>
                        {initialData ? 'Edit Suplai Material' : 'Tambah Suplai Material'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        type="button"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="add-supply-form" onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
                                <span className="material-icons-round text-base">error_outline</span>
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Material</label>
                            <SearchableSelect
                                value={formData.materialId}
                                onChange={(val) => handleChange({ target: { name: 'materialId', value: val } })}
                                placeholder="-- Pilih Material --"
                                disabled={!!initialData}
                                options={availableMaterials.map(m => ({ value: m.id, label: `${m.name} (${m.unit})` }))}
                            />
                            {availableMaterials.length === 0 && (
                                <p className="mt-1 text-xs text-amber-500">Semua material sudah terdaftar untuk subkontraktor ini.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga Kontrak (Rp)</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 sm:text-sm">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white pl-10 focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Kontrak</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm hover:shadow transition-all"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}
