import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function EditAssetModal({ isOpen, onClose, asset, onSave }) {
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
        brand: '',
        serialNumber: '',
        purchaseYear: '',
        status: '',
        location: '',
        condition: '',
        pic: '',
        qty: 0,
        stockBreakdown: []
    });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);



    useEffect(() => {
        if (isOpen) {
            // Refresh categories & sub-categories from API every time the modal opens
            (async () => {
                try {
                    const allCats = await api.categories.list();
                    const catData = (allCats || []).filter(c => !c.categoryId); // top-level
                    const subData = (allCats || []).filter(c => !!c.categoryId); // sub-categories
                    setCategories(catData);
                    setSubCategories(subData);

                    // Auto-lock category to 'Aset' — self-healing: create if missing
                    let asetCat = catData.find(c => c.name.toLowerCase() === 'aset');
                    if (!asetCat) {
                        asetCat = { id: `SYS-ASET-${Date.now()}`, name: 'Aset', icon: 'inventory_2' };
                        try { await api.categories.create(asetCat); } catch (e) { /* ignore */ }
                        setCategories(prev => [...prev, asetCat]);
                    }
                } catch (e) { console.error('Failed to load categories for EditAssetModal:', e); }
            })();

            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);
            if (asset) {
                setFormData({
                    name: asset.name || '',
                    id: asset.id || '',
                    categoryId: asetCat ? String(asetCat.id) : (asset.categoryId || ''),
                    category: asetCat ? asetCat.name : (asset.category || 'Aset'),
                    subCategoryId: asset.subCategoryId || '',
                    subCategory: asset.subCategory || '',
                    brand: asset.brand || '',
                    serialNumber: asset.serialNumber || '',
                    purchaseYear: asset.purchaseYear || '',
                    status: asset.status || 'Tersedia',
                    location: asset.location || '',
                    condition: asset.condition || '',
                    pic: asset.pic || '',
                    qty: asset.qty || 0,
                    stockBreakdown: asset.stockBreakdown || []
                });
            }
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, asset]);

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

        if (name === 'qty') {
            const newQty = parseInt(value) || 0;
            setFormData(prev => {
                let newBreakdown = [...(prev.stockBreakdown || [])];
                if (newQty > newBreakdown.length) {
                    for (let i = newBreakdown.length; i < newQty; i++) {
                        newBreakdown.push({ serialNumber: '', condition: 'Baik', status: 'Tersedia', location: '', qty: 1 });
                    }
                } else if (newQty > 0 && newQty < newBreakdown.length) {
                    newBreakdown = newBreakdown.slice(0, newQty);
                } else if (newQty === 0) {
                    newBreakdown = [];
                }
                return { ...prev, qty: newQty, stockBreakdown: newBreakdown };
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredSubCategories = subCategories.filter(s =>
        s.categoryId === formData.categoryId ||
        s.categoryId === Number(formData.categoryId) ||
        s.categoryId === String(formData.categoryId)
    );

    const handleBreakdownChange = (index, field, value) => {
        const newBreakdown = [...formData.stockBreakdown];
        newBreakdown[index] = { ...newBreakdown[index], [field]: value };
        setFormData(prev => ({ ...prev, stockBreakdown: newBreakdown }));
    };



    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.categoryId || !formData.subCategoryId) {
            alert('Nama Aset, Kategori, dan Sub-Kategori wajib diisi!');
            return;
        }

        onSave(formData);
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
                className={`bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 relative overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">edit</span>
                        Edit Aset
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="edit-asset-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">Investasi Utama</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Aset</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID Aset</label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        disabled
                                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-dark text-slate-500 dark:text-slate-400 sm:text-sm cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tahun Beli</label>
                                    <input
                                        type="number"
                                        name="purchaseYear"
                                        value={formData.purchaseYear}
                                        onChange={handleChange}
                                        placeholder="2024"
                                        min="2000"
                                        max="2099"
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Qty</label>
                                    <input
                                        type="number"
                                        name="qty"
                                        value={formData.qty}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                                    <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-dark px-3 py-2 flex items-center gap-2">
                                        <span className="material-icons-outlined text-primary text-sm">lock</span>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formData.category || 'Aset'}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub-Kategori <span className="text-red-500">*</span></label>
                                    <select
                                        name="subCategoryId"
                                        value={formData.subCategoryId}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    >
                                        <option value="" disabled>Pilih Sub-Kategori...</option>
                                        {filteredSubCategories.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand / Merk</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kondisi Umum</label>
                                    <input
                                        type="text"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleChange}
                                        placeholder="Baik / Rusak / Perlu Servis"
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lokasi Utama</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIC (Penanggung Jawab)</label>
                                <input
                                    type="text"
                                    name="pic"
                                    value={formData.pic}
                                    onChange={handleChange}
                                    placeholder="Contoh: Pak Budi"
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Stock Breakdown Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Detail Pembagian Stok & Serial Number {formData.qty > 1 ? `(${formData.qty} Item)` : ''}
                                </h3>
                            </div>

                            {formData.stockBreakdown.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 dark:bg-background-dark rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Silakan masukkan jumlah (Total Qty) untuk menghasilkan baris.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                                    {formData.stockBreakdown.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 dark:bg-background-dark rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="col-span-12 flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-primary">Item #{index + 1}</span>
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">SN / No. Seri</label>
                                                <input
                                                    type="text"
                                                    value={item.serialNumber || ''}
                                                    onChange={(e) => handleBreakdownChange(index, 'serialNumber', e.target.value)}
                                                    className="w-full rounded border-slate-300 dark:border-slate-600 px-2 py-1.5 text-xs bg-white dark:bg-surface-dark dark:text-white"
                                                    placeholder="SN..."
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Kondisi</label>
                                                <input
                                                    type="text"
                                                    value={item.condition}
                                                    onChange={(e) => handleBreakdownChange(index, 'condition', e.target.value)}
                                                    className="w-full rounded border-slate-300 dark:border-slate-600 px-2 py-1.5 text-xs bg-white dark:bg-surface-dark dark:text-white"
                                                    placeholder="Baik/Baru"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleBreakdownChange(index, 'status', e.target.value)}
                                                    className="w-full rounded border-slate-300 dark:border-slate-600 px-2 py-1.5 text-xs bg-white dark:bg-surface-dark dark:text-white"
                                                >
                                                    <option value="Tersedia">Tersedia</option>
                                                    <option value="Digunakan">Digunakan</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                    <option value="Rusak">Rusak</option>
                                                </select>
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Lokasi</label>
                                                <input
                                                    type="text"
                                                    value={item.location}
                                                    onChange={(e) => handleBreakdownChange(index, 'location', e.target.value)}
                                                    className="w-full rounded border-slate-300 dark:border-slate-600 px-2 py-1.5 text-xs bg-white dark:bg-surface-dark dark:text-white"
                                                    placeholder="Gudang..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30">
                            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-1">
                                <span className="material-icons-outlined text-sm">history</span>
                                Catatan Sistem
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300/80">
                                Perubahan data ini akan otomatis tersimpan dalam database aset.
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
                        form="edit-asset-form"
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/20 transition-colors"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
}
