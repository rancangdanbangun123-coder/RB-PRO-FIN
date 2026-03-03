import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import SearchableSelect from '../components/SearchableSelect';
import { updateMaterialsWithNewPrefixes, cascadeSubcontractorMaterialIds } from '../utils/materialUtils';

export default function SubCategoryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [name, setName] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const catData = JSON.parse(localStorage.getItem("categories")) || [];
        setCategories(catData);

        const subData = JSON.parse(localStorage.getItem("subCategories")) || [];
        // Support both string and number
        const subCategory = subData.find((s) => String(s.id) === String(id));
        const oldName = subCategory ? subCategory.name : "";

        if (subCategory) {
            setName(subCategory.name);
            setCategoryId(subCategory.categoryId);
        } else {
            alert("Sub-Kategori tidak ditemukan!");
            navigate("/category");
        }
    }, [id, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!categoryId || !name.trim()) return;

        const existingSubs = JSON.parse(localStorage.getItem("subCategories")) || [];

        // Check for duplicates within the same category (exclude self)
        const isDuplicate = existingSubs.some(
            (sub) => sub.categoryId == categoryId && sub.name.toLowerCase() === name.trim().toLowerCase() && String(sub.id) !== String(id)
        );

        if (isDuplicate) {
            alert("Sub-kategori dengan nama ini sudah ada di kategori tersebut!");
            return;
        }

        const updatedSubs = existingSubs.map((sub) =>
            String(sub.id) === String(id) ? { ...sub, name: name.trim(), categoryId: categoryId } : sub
        );

        const currentSubCategory = existingSubs.find(c => String(c.id) === String(id));
        const oldName = currentSubCategory ? currentSubCategory.name : "";
        const allCategories = JSON.parse(localStorage.getItem("categories")) || [];
        const newCategory = allCategories.find((c) => String(c.id) === String(categoryId));
        const newCategoryName = newCategory ? newCategory.name : "";

        const existingMaterialsJSON = localStorage.getItem("materials");
        if (existingMaterialsJSON && typeof oldName !== "undefined") {
            const rawMaterials = JSON.parse(existingMaterialsJSON);
            let materialsChangedToNewName = false;

            const updatedCategoryNameMaterials = rawMaterials.map((m) => {
                if (m.subCategory === oldName || String(m.subCategoryId) === String(id)) {
                    materialsChangedToNewName = true;
                    return {
                        ...m,
                        subCategory: name.trim(),
                        categoryId: categoryId,
                        category: newCategoryName || m.category
                    };
                }
                return m;
            });

            if (materialsChangedToNewName) {
                const { updatedMaterials, hasChanges, oldToNewIdMap } = updateMaterialsWithNewPrefixes(updatedCategoryNameMaterials);
                localStorage.setItem("materials", JSON.stringify(updatedMaterials));

                if (hasChanges) {
                    cascadeSubcontractorMaterialIds(oldToNewIdMap);
                }
                window.dispatchEvent(new Event("storage"));
            }
        }
        localStorage.setItem("subCategories", JSON.stringify(updatedSubs));

        // If we came from a specific page like category detail panel, could use location.state.from but for now navigate to list
        navigate("/category");
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased h-screen flex overflow-hidden">
            <Sidebar activePage="category" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />{/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Sub-Kategori</h1>
                    </div>
                </header>

                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="max-w-2xl mx-auto">
                        {/* Page Header Actions */}
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => navigate('/category')}
                                className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-icons-round">arrow_back</span>
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Edit Sub-Kategori</h2>
                                <p className="text-slate-500 text-sm">Ubah detail sub-kategori ini atau pindahkan ke kategori induk lain.</p>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Pilih Kategori Induk <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        value={String(categoryId)}
                                        onChange={(val) => setCategoryId(val)}
                                        placeholder="Pilih Kategori"
                                        options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Sub-kategori ini akan berada di bawah kategori yang dipilih.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Nama Sub-Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Pekerjaan Tanah, Interior, Eksterior"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/category')}
                                        className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/25 font-medium transition-all"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
