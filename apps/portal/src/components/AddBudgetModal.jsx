import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import { api } from '../lib/api';

export default function AddBudgetModal({ isOpen, onClose, onSave, initialData }) {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [formData, setFormData] = useState({
        category: '',
        subCategory: '',
        name: '',
        spec: '',
        qtyTotal: '',
        qtyUnit: 'unit',
        ahsPrice: 0,
        totalBudget: ''
    });

    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        if (isOpen) {
            (async () => {
                try {
                    const [cats, mats] = await Promise.all([
                        api.categories.list(),
                        api.materials.list(),
                    ]);
                    // categories API returns { categories: [...], subCategories: [...] } or flat array
                    const catList = Array.isArray(cats) ? cats : (cats.categories || []);
                    const subList = Array.isArray(cats) ? [] : (cats.subCategories || []);

                    const finalCats = catList.length > 0 ? catList : [
                        { id: '1', name: 'MATERIAL' },
                        { id: '2', name: 'UPAH' },
                        { id: '3', name: 'ALAT' },
                        { id: '4', name: 'SUBKON' },
                        { id: '5', name: 'LAIN-LAIN' }
                    ];

                    setCategories(finalCats);
                    setSubCategories(subList);
                    setMaterials(mats || []);

                    if (initialData) {
                        setFormData({
                            category: initialData.category || finalCats[0]?.name || '',
                            subCategory: initialData.subCategory || '',
                            name: initialData.name || '',
                            spec: initialData.spec || '',
                            qtyTotal: initialData.qtyTotal || '',
                            qtyUnit: initialData.qtyUnit || 'unit',
                            ahsPrice: initialData.ahsPrice || 0,
                            totalBudget: initialData.totalBudget ? String(initialData.totalBudget).replace(/[^0-9]/g, '') : ''
                        });
                    } else {
                        setFormData({
                            category: finalCats[0]?.name || '',
                            subCategory: '',
                            name: '',
                            spec: '',
                            qtyTotal: '',
                            qtyUnit: 'unit',
                            ahsPrice: 0,
                            totalBudget: ''
                        });
                    }
                } catch (err) {
                    console.error('Failed to load budget modal data:', err);
                }
            })();
        }
    }, [initialData, isOpen]);

    // Calculate available subCategories for the current selected category
    const currentCategoryObj = categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase()) || categories[0];
    const availableSubs = currentCategoryObj
        ? subCategories.filter(s => String(s.categoryId) === String(currentCategoryObj.id))
        : [];

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            if (name === 'category') {
                const newCatObj = categories.find(c => c.name.toLowerCase() === value.toLowerCase());
                const newSubs = newCatObj ? subCategories.filter(s => String(s.categoryId) === String(newCatObj.id)) : [];
                updated.subCategory = newSubs.length > 0 ? newSubs[0].name : 'Lainnya';
            }

            // Auto-calculate budget when qty updates
            if (name === 'qtyTotal') {
                const qty = parseFloat(value) || 0;
                const price = parseFloat(prev.ahsPrice) || 0;
                updated.totalBudget = String(Math.round(qty * price));
            }

            return updated;
        });
    };

    const handleMaterialSelect = (materialName) => {
        const selectedMat = materials.find(m => m.name === materialName);
        if (selectedMat) {
            setFormData(prev => {
                const qty = parseFloat(prev.qtyTotal) || 0;
                const price = parseFloat(selectedMat.ahsPrice || selectedMat.price) || 0;

                let finalCategory = prev.category;
                let finalSubCategory = prev.subCategory;
                
                if (selectedMat.category) {
                    const matchedCat = categories.find(c => c.name.toLowerCase() === selectedMat.category.toLowerCase());
                    finalCategory = matchedCat ? matchedCat.name : selectedMat.category;
                }

                if (selectedMat.subCategory) {
                    const matchedSub = subCategories.find(s => s.name.toLowerCase() === selectedMat.subCategory.toLowerCase());
                    finalSubCategory = matchedSub ? matchedSub.name : selectedMat.subCategory;
                }

                return {
                    ...prev,
                    name: materialName,
                    category: finalCategory,
                    subCategory: finalSubCategory,
                    qtyUnit: selectedMat.unit || prev.qtyUnit,
                    ahsPrice: price,
                    totalBudget: String(Math.round(qty * price))
                };
            });
        } else {
            setFormData(prev => ({ ...prev, name: materialName }));
        }
    };

    const handleBudgetChange = (e) => {
        // Allow only numbers
        const value = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({
            ...prev,
            totalBudget: value
        }));
    };

    const handleCategoryChange = (val) => {
        // 'val' ini adalah nilai yang dipilih dari komponenmu
        setFormData(prev => ({
            ...prev,
            category: val
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Format budget back to Rp string for display (simplified for now)
        const formattedBudget = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.totalBudget);

        onSave({
            ...formData,
            category: formData.category.toUpperCase().trim(),
            totalBudget: formattedBudget,
            // Calculate dummy effective budget for now or set to 0
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-border-dark flex justify-between items-center bg-white dark:bg-card-dark">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {initialData ? 'Edit Item Anggaran' : 'Tambah Item Anggaran'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                            <SearchableSelect
                                value={formData.category}
                                onChange={(val) => handleChange({ target: { name: 'category', value: val } })}
                                placeholder="Pilih Kategori..."
                                options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub-Kategori</label>
                            <SearchableSelect
                                value={formData.subCategory}
                                onChange={(val) => handleChange({ target: { name: 'subCategory', value: val } })}
                                placeholder="Pilih Sub-Kategori..."
                                options={[
                                    ...availableSubs.map(sub => ({ value: sub.name, label: sub.name })),
                                    ...(availableSubs.length === 0 ? [{ value: 'Lainnya', label: 'Lainnya' }] : [])
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Item</label>
                        <SearchableSelect
                            value={formData.name}
                            onChange={handleMaterialSelect}
                            placeholder="Cari atau pilih item material..."
                            options={materials.map(m => ({ value: m.name, label: m.name }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Spesifikasi</label>
                        <input
                            type="text"
                            name="spec"
                            value={formData.spec}
                            onChange={handleChange}
                            placeholder="Contoh: 50kg / Sak"
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah (Qty)</label>
                            <input
                                type="number"
                                name="qtyTotal"
                                value={formData.qtyTotal}
                                onChange={handleChange}
                                required
                                placeholder="0"
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
                            <input
                                type="text"
                                name="qtyUnit"
                                value={formData.qtyUnit}
                                onChange={handleChange}
                                placeholder="unit"
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total Anggaran (Rp)</label>
                            {formData.ahsPrice > 0 && (
                                <span className="text-[10px] text-slate-500 italic">
                                    Harga AHS: Rp {new Intl.NumberFormat('id-ID').format(formData.ahsPrice)}
                                </span>
                            )}
                        </div>
                        <input
                            type="text"
                            name="totalBudget"
                            value={new Intl.NumberFormat('id-ID').format(formData.totalBudget)}
                            onChange={handleBudgetChange}
                            required
                            placeholder="0"
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-background-dark text-slate-900 dark:text-white focus:border-primary focus:ring-primary sm:text-sm font-semibold"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-white bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-border-dark transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/30 transition-colors"
                        >
                            Simpan Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
