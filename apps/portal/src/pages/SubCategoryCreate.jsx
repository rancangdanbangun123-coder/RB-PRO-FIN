import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import SearchableSelect from '../components/SearchableSelect';
import { api } from '../lib/api';

export default function SubCategoryCreate() {
    const [categories, setCategories] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const [name, setName] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await api.categories.list();
                const cats = Array.isArray(data) ? data : (data.categories || []);
                setCategories(cats);
            } catch (err) { console.error(err); }
        })();

        if (location.state?.categoryId) {
            setCategoryId(location.state.categoryId);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryId || !name.trim()) return;

        try {
            await api.categories.createSub({ categoryId, name: name.trim() });
            navigate('/category');
        } catch (err) {
            alert(err.message || "Gagal membuat sub-kategori.");
        }
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
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tambah Sub-Kategori</h1>
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
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Sub-Kategori Baru</h2>
                                <p className="text-slate-500 text-sm">Tambahkan sub-kategori untuk klasifikasi lebih detail.</p>
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
                                        Simpan Sub-Kategori
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
