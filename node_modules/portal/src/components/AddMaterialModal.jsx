import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';

export default function AddMaterialModal({ isOpen, onClose, onSave, categories = [], subCategories = [] }) {
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        category: '',
        subCategoryId: '',
        subCategory: '',
        ahsPrice: '',
        unit: 'Unit',
        status: 'Active',
        hasConversion: false,
        conversionFactor: '',
        standardUnit: ''
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);
            // Reset form when opening
            setFormData({
                name: '',
                categoryId: '',
                category: '',
                subCategoryId: '',
                subCategory: '',
                ahsPrice: '',
                unit: 'Unit',
                status: 'Active',
                hasConversion: false,
                conversionFactor: '',
                standardUnit: ''
            });
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'categoryId') {
            const selectedCat = categories.find(c => c.id === value || c.id === Number(value));
            setFormData(prev => ({
                ...prev,
                categoryId: value,
                category: selectedCat ? selectedCat.name : '',
                subCategoryId: '',
                subCategory: ''
            }));
            return;
        }

        if (name === 'subCategoryId') {
            const selectedSub = subCategories.find(s => s.id === value || s.id === Number(value));
            setFormData(prev => ({
                ...prev,
                subCategoryId: value,
                subCategory: selectedSub ? selectedSub.name : ''
            }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredSubCategories = subCategories.filter(s =>
        s.categoryId === formData.categoryId ||
        s.categoryId === Number(formData.categoryId) ||
        s.categoryId === String(formData.categoryId)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, price: formData.ahsPrice };
        if (!payload.hasConversion) {
            payload.conversionFactor = '';
            payload.standardUnit = '';
        } else {
            payload.conversionFactor = Number(payload.conversionFactor);
        }
        onSave(payload);
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className={`fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            <div
                className={`bg-white dark:bg-card-dark w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 relative overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">add_circle</span>
                        Tambah Material Baru
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="add-material-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Material</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Besi Beton D13"
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                                <SearchableSelect
                                    value={formData.categoryId}
                                    onChange={(val) => handleChange({ target: { name: 'categoryId', value: val } })}
                                    placeholder="Pilih Kategori..."
                                    options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub-Kategori</label>
                                <SearchableSelect
                                    value={formData.subCategoryId}
                                    onChange={(val) => handleChange({ target: { name: 'subCategoryId', value: val } })}
                                    placeholder="Pilih Sub-Kategori..."
                                    disabled={!formData.categoryId}
                                    options={filteredSubCategories.map(sub => ({ value: String(sub.id), label: sub.name }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga AHS (Rp)</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-slate-500 sm:text-sm">Rp</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="ahsPrice"
                                        required
                                        min="0"
                                        value={formData.ahsPrice}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white pl-10 focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="0"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Harga standar dari Analisis Harga Satuan.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan Dasar / Market</label>
                                <input
                                    type="text"
                                    name="unit"
                                    required
                                    value={formData.unit}
                                    onChange={handleChange}
                                    placeholder="Unit"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="hasConversion"
                                checked={formData.hasConversion}
                                onChange={(e) => setFormData(prev => ({ ...prev, hasConversion: e.target.checked }))}
                                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                            />
                            <label htmlFor="hasConversion" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                Butuh konversi ke Satuan Standar? (m, m2, kg, dll)
                            </label>
                        </div>

                        {formData.hasConversion && (
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-surface-dark p-4 rounded-lg border border-slate-200 dark:border-slate-700 mt-2 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Faktor Konversi</label>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-slate-500 mr-2 whitespace-nowrap">1 {formData.unit || 'Unit'} =</span>
                                        <input
                                            type="number"
                                            name="conversionFactor"
                                            required={formData.hasConversion}
                                            value={formData.conversionFactor}
                                            onChange={handleChange}
                                            placeholder="Cth: 1000"
                                            step="any"
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan Standar</label>
                                    <input
                                        type="text"
                                        name="standardUnit"
                                        required={formData.hasConversion}
                                        value={formData.standardUnit}
                                        onChange={handleChange}
                                        placeholder="Cth: kg, m, m3"
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                        * Contoh: Jika Market adalah "Sak" dan Konversi "50" ke Standar "kg", 1 Sak = 50 kg.
                                    </p>
                                </div>
                            </div>
                        )}
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
                        type="submit"
                        form="add-material-form"
                        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm hover:shadow transition-all"
                    >
                        Simpan Material
                    </button>
                </div>
            </div>
        </div>
    );
}
