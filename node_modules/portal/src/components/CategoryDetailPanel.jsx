import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchableSelect from './SearchableSelect';

export default function CategoryDetailPanel({ category, isOpen, onClose, onUpdate }) {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]); // For moving subcats
    const [editingSubId, setEditingSubId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editParentId, setEditParentId] = useState("");

    useEffect(() => {
        if (isOpen && category) {
            loadData();
        }
    }, [isOpen, category]);

    const loadData = () => {
        const allSubs = JSON.parse(localStorage.getItem("subCategories")) || [];
        const allCats = JSON.parse(localStorage.getItem("categories")) || [];
        // Handle both string and number ID comparison
        const filtered = allSubs.filter(s => s.categoryId == category.id);

        setSubCategories(filtered);
        setCategories(allCats);
    };

    const handleEditClick = (sub) => {
        setEditingSubId(sub.id);
        setEditName(sub.name);
        setEditParentId(sub.categoryId);
    };

    const handleCancelEdit = () => {
        setEditingSubId(null);
        setEditName("");
        setEditParentId("");
    };

    const handleSaveEdit = () => {
        if (!editName.trim()) return;

        const allSubs = JSON.parse(localStorage.getItem("subCategories")) || [];

        // Check for duplicates (excluding current)
        const isDuplicate = allSubs.some(
            (sub) =>
                sub.categoryId == editParentId &&
                sub.name.toLowerCase() === editName.trim().toLowerCase() &&
                sub.id !== editingSubId
        );

        if (isDuplicate) {
            alert("Sub-kategori dengan nama ini sudah ada di kategori tujuan!");
            return;
        }

        const updatedSubs = allSubs.map(sub => {
            if (sub.id === editingSubId) {
                return { ...sub, name: editName.trim(), categoryId: editParentId };
            }
            return sub;
        });

        localStorage.setItem("subCategories", JSON.stringify(updatedSubs));

        // Refresh local view
        const reFiltered = updatedSubs.filter(s => s.categoryId == category.id);
        setSubCategories(reFiltered); // Note: If moved, it will disappear from list, which is correct

        handleCancelEdit();
        if (onUpdate) onUpdate(); // Refresh parent list counts
    };

    const handleDelete = (id) => {
        if (window.confirm("Hapus sub-kategori ini?")) {
            const allSubs = JSON.parse(localStorage.getItem("subCategories")) || [];
            const updatedSubs = allSubs.filter(s => s.id !== id);
            localStorage.setItem("subCategories", JSON.stringify(updatedSubs));

            // Fix orphaned materials: clear subCategory reference
            const savedMaterials = JSON.parse(localStorage.getItem("materials")) || [];
            let materialsChanged = false;
            const updatedMaterials = savedMaterials.map((m) => {
                if (m.subCategoryId === id || String(m.subCategoryId) === String(id)) {
                    materialsChanged = true;
                    return { ...m, subCategoryId: '', subCategory: '' };
                }
                return m;
            });
            if (materialsChanged) {
                localStorage.setItem("materials", JSON.stringify(updatedMaterials));
                window.dispatchEvent(new Event("storage"));
            }

            loadData();
            if (onUpdate) onUpdate();
        }
    };

    if (!isOpen || !category) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                <div className="w-screen max-w-md bg-white dark:bg-card-dark shadow-xl flex flex-col h-full border-l border-slate-200 dark:border-border-dark transform transition-transform duration-300">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{category.name}</h2>
                            <p className="text-sm text-slate-500">Detail & Sub-kategori</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Daftar Sub-Kategori</h3>
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                                    {subCategories.length} items
                                </span>
                            </div>

                            {subCategories.length > 0 ? (
                                <div className="space-y-3">
                                    {subCategories.map((sub) => (
                                        <div key={sub.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-all hover:border-primary/50">
                                            {editingSubId === sub.id ? (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs text-slate-500 block mb-1">Nama</label>
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="w-full px-3 py-1.5 text-sm border rounded dark:bg-slate-800 dark:border-slate-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-500 block mb-1">Pindahkan Kategori</label>
                                                        <SearchableSelect
                                                            value={String(editParentId)}
                                                            onChange={(val) => setEditParentId(val)}
                                                            placeholder="Pilih Kategori..."
                                                            options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 justify-end pt-2">
                                                        <button onClick={handleCancelEdit} className="text-xs px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded">Batal</button>
                                                        <button onClick={handleSaveEdit} className="text-xs px-3 py-1.5 bg-primary text-white rounded shadow-sm hover:bg-primary-hover">Simpan</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-icons-round text-slate-400 text-sm">subdirectory_arrow_right</span>
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sub.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleEditClick(sub)} className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                                            <span className="material-icons-round text-sm">edit</span>
                                                        </button>
                                                        <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                                            <span className="material-icons-round text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                    <span className="material-icons-round text-3xl mb-2 opacity-50">low_priority</span>
                                    <p className="text-sm">Belum ada sub-kategori.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <Link
                            to="/subcategory/create"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white dark:bg-card-dark border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors shadow-sm"
                        >
                            <span className="material-icons-round text-[20px]">add</span>
                            <span>Tambah Sub-Kategori Baru</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
