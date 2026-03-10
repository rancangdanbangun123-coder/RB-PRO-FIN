import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import { api } from '../lib/api';

export default function CategoryEdit() {
    const { id } = useParams();
    const [name, setName] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const data = await api.categories.list();
                const cats = Array.isArray(data) ? data : (data.categories || []);
                const category = cats.find((c) => String(c.id) === String(id));
                if (category) {
                    setName(category.name);
                } else {
                    alert("Category not found!");
                    navigate("/category");
                }
            } catch (err) { console.error(err); }
        })();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await api.categories.update(id, { name: name.trim() });
            navigate("/category");
        } catch (err) {
            alert(err.message || "Gagal mengubah kategori.");
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
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Kategori</h1>
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
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Edit Kategori</h2>
                                <p className="text-slate-500 text-sm">Ubah nama kategori proyek Anda.</p>
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Nama Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Infrastruktur, Gedung, Renovasi"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        required
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Nama kategori harus unik.
                                    </p>
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
