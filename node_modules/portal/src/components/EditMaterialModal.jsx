import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';

export default function EditMaterialModal({ isOpen, onClose, material, onSave, categories = [], subCategories = [] }) {
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        categoryId: '',
        category: '',
        subCategoryId: '',
        subCategory: '',
        ahsPrice: '',
        unit: '',
        status: 'Active',
        hasConversion: false,
        conversionFactor: '',
        standardUnit: ''
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);

            if (material) {
                const matchedCategory = categories.find(c => c.name === material.category);
                const categoryId = matchedCategory ? matchedCategory.id : '';

                let matchedSubCategory = null;
                if (categoryId) {
                    matchedSubCategory = subCategories.find(s => s.name === material.subCategory && (s.categoryId === categoryId || s.categoryId === Number(categoryId) || s.categoryId === String(categoryId)));
                }
                const subCategoryId = matchedSubCategory ? matchedSubCategory.id : '';

                setFormData({
                    name: material.name || '',
                    id: material.id || '',
                    categoryId: categoryId,
                    category: material.category || '',
                    subCategoryId: subCategoryId,
                    subCategory: material.subCategory || '',
                    ahsPrice: material.ahsPrice || material.price || '',
                    unit: material.unit || '',
                    status: material.status || 'Active',
                    hasConversion: material.hasConversion || false,
                    conversionFactor: material.conversionFactor || '',
                    standardUnit: material.standardUnit || ''
                });
            }
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, material]);

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
                className={`absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            <div
                className={`bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 relative overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">edit</span>
                        Edit Material
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-material-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Material</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID Material</label>
                                <input
                                    type="text"
                                    name="id"
                                    value={formData.id}
                                    disabled
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-dark text-slate-500 dark:text-slate-400 sm:text-sm cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                >
                                    <option value="Active">Aktif</option>
                                    <option value="Inactive">Tidak Aktif</option>
                                    <option value="Archived">Diarsipkan</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                                <SearchableSelect
                                    value={String(formData.categoryId)}
                                    onChange={(val) => handleChange({ target: { name: 'categoryId', value: val } })}
                                    placeholder="Pilih Kategori..."
                                    options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub Kategori</label>
                                <SearchableSelect
                                    value={String(formData.subCategoryId)}
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
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 sm:text-sm">Rp</span>
                                    <input
                                        type="number"
                                        name="ahsPrice"
                                        value={formData.ahsPrice}
                                        onChange={handleChange}
                                        className="w-full pl-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan Dasar / Market (Base Qty)</label>
                                <input
                                    type="text"
                                    name="unit"
                                    required
                                    value={formData.unit}
                                    onChange={handleChange}
                                    placeholder="Cth: Batang, Sak, M3, dll."
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center mt-2 mb-2">
                            <input
                                type="checkbox"
                                id="hasConversionEdit"
                                checked={formData.hasConversion}
                                onChange={(e) => setFormData(prev => ({ ...prev, hasConversion: e.target.checked }))}
                                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                            />
                            <label htmlFor="hasConversionEdit" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                Butuh konversi ke Satuan Standar Internasional? (m, m2, kg)
                            </label>
                        </div>

                        {formData.hasConversion && (
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-surface-dark p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 animate-fade-in">
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
                            </div>
                        )}

                        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-3 border border-yellow-100 dark:border-yellow-900/30">
                            <h4 className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1 flex items-center gap-1">
                                <span className="material-icons-outlined text-sm">info</span>
                                Perhatian
                            </h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300/80">
                                Perubahan harga AHS akan mempengaruhi estimasi budget proyek yang menggunakan material ini.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-dark flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="edit-material-form"
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/20 transition-colors"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}
