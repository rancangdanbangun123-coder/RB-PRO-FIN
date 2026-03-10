import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import CategoryDetailPanel from "../components/CategoryDetailPanel";
import ReassignCategoryModal from "../components/ReassignCategoryModal";
import Sidebar from "../components/Sidebar";
import { api } from '../lib/api';

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [allExpanded, setAllExpanded] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isImportLinkModalOpen, setIsImportLinkModalOpen] = useState(false);
    const [importLink, setImportLink] = useState('');
    const fileInputRef = useRef(null);

    // Reassign modal state
    const [reassignModal, setReassignModal] = useState({
        isOpen: false,
        type: 'category', // 'category' | 'subcategory'
        itemName: '',
        deletingId: null,
        affectedCount: 0,
        availableTargets: []
    });

    const toggleExpand = (id) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (allExpanded) {
            setExpandedCategories([]);
        } else {
            setExpandedCategories(categories.map(c => c.id));
        }
        setAllExpanded(!allExpanded);
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await api.categories.list();
                const catData = Array.isArray(data) ? data : (data.categories || []);
                const subData = Array.isArray(data) ? [] : (data.subCategories || []);
                setCategories(catData);
                setSubCategories(subData);
                if (catData.length > 0) {
                    setExpandedCategories(catData.map(c => c.id));
                }
            } catch (err) { console.error('Failed to load categories:', err); }
        })();
    }, []);

    const handleDelete = async (id) => {
        const cat = categories.find(c => c.id === id);
        if (!cat) return;

        // Count affected materials — match by BOTH name and categoryId
        let affectedCount = 0;
        try {
            const savedMaterials = await api.materials.list();
            affectedCount = savedMaterials.filter(m =>
                m.category === cat.name ||
                m.categoryId === id ||
                String(m.categoryId) === String(id)
            ).length;
        } catch (err) { console.error(err); }

        if (affectedCount > 0) {
            // Show reassign modal
            const otherCategories = categories
                .filter(c => c.id !== id && c.name.toLowerCase() !== 'aset')
                .map(c => ({ id: c.id, name: c.name }));
            setReassignModal({
                isOpen: true,
                type: 'category',
                itemName: cat.name,
                deletingId: id,
                affectedCount,
                availableTargets: otherCategories
            });
        } else {
            // No materials affected, just confirm and delete
            if (window.confirm(`Hapus kategori "${cat.name}" beserta semua sub-kategorinya?`)) {
                executeCategoryDelete(id);
            }
        }
    };

    const executeCategoryDelete = async (id, action, targetId) => {
        try {
            await api.categories.remove(id);
            const updatedCategories = categories.filter((c) => c.id !== id);
            const updatedSubs = subCategories.filter(s => s.categoryId !== id && s.categoryId !== id.toString());
            setCategories(updatedCategories);
            setSubCategories(updatedSubs);
        } catch (err) { console.error('Failed to delete category:', err); }
    };

    const handleDeleteSubcategory = async (subId) => {
        const sub = subCategories.find(s => s.id === subId);
        if (!sub) return;

        let affectedCount = 0;
        try {
            const savedMaterials = await api.materials.list();
            affectedCount = savedMaterials.filter(m =>
                m.subCategory === sub.name ||
                m.subCategoryId === subId ||
                String(m.subCategoryId) === String(subId)
            ).length;
        } catch (err) { console.error(err); }

        if (affectedCount > 0) {
            // Find sibling subcategories (same parent category)
            const siblingSubCategories = subCategories
                .filter(s => s.id !== subId && (s.categoryId === sub.categoryId || String(s.categoryId) === String(sub.categoryId)))
                .map(s => ({ id: s.id, name: s.name }));
            setReassignModal({
                isOpen: true,
                type: 'subcategory',
                itemName: sub.name,
                deletingId: subId,
                affectedCount,
                availableTargets: siblingSubCategories
            });
        } else {
            if (window.confirm(`Hapus sub-kategori "${sub.name}"?`)) {
                executeSubcategoryDelete(subId);
            }
        }
    };

    const executeSubcategoryDelete = async (subId, action, targetId) => {
        try {
            await api.categories.removeSub(subId);
            const updatedSubs = subCategories.filter(s => s.id !== subId);
            setSubCategories(updatedSubs);
        } catch (err) { console.error('Failed to delete subcategory:', err); }
    };

    const handleReassignConfirm = (action, targetId) => {
        if (reassignModal.type === 'category') {
            executeCategoryDelete(reassignModal.deletingId, action, targetId);
        } else {
            executeSubcategoryDelete(reassignModal.deletingId, action, targetId);
        }
        setReassignModal(prev => ({ ...prev, isOpen: false }));
    };

    const processImportedData = async (jsonData) => {
        if (jsonData.length === 0) {
            alert("Data kosong atau tidak valid.");
            return;
        }

        const newCategories = [...categories];
        const newSubCategories = [...subCategories];
        let addedCats = 0;
        let addedSubs = 0;

        jsonData.forEach((row, index) => {
            const catName = row['Nama Kategori'] || row['Kategori'] || row.Kategori || row.Category || row.KATEGORI || '';
            const subCatName = row['Nama Sub-kategori'] || row['Sub-kategori'] || row['Subkategori'] || row.Subkategori || row.SubCategory || row['SUB-KATEGORI'] || '';
            const catatan = row['Catatan'] || row.Notes || '';

            if (!catName) return;

            let existingCat = newCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
            let catId;

            if (!existingCat) {
                catId = `CRT-${Date.now()}-${index}`;
                existingCat = { id: catId, name: catName, icon: 'category' };
                newCategories.push(existingCat);
                addedCats++;
            } else {
                catId = existingCat.id;
            }

            if (subCatName) {
                const existingSub = newSubCategories.find(
                    s => (s.categoryId === catId || s.categoryId === String(catId)) && s.name.toLowerCase() === subCatName.toLowerCase()
                );

                if (!existingSub) {
                    newSubCategories.push({
                        id: `SUB-${Date.now()}-${index}`,
                        categoryId: catId,
                        name: subCatName,
                        code: catatan || `SUB-${String(newSubCategories.length + 1).padStart(3, '0')}`
                    });
                    addedSubs++;
                }
            }
        });

        if (addedCats > 0 || addedSubs > 0) {
            setCategories(newCategories);
            setSubCategories(newSubCategories);

            // Format data exactly how the backend categoriesService.bulkImport expects it:
            const importPayload = newCategories.map(cat => ({
                category: { id: cat.id, name: cat.name, icon: cat.icon || 'category' },
                subs: newSubCategories
                    .filter(sub => sub.categoryId === cat.id)
                    .map(sub => ({
                        id: sub.id,
                        categoryId: cat.id,
                        name: sub.name,
                        code: sub.code
                    }))
            }));

            try {
                await api.categories.import(importPayload);
            } catch (err) { console.error('Failed to import to database:', err); }

            alert(`Berhasil mengimpor! Menambahkan ${addedCats} Kategori baru dan ${addedSubs} Sub-kategori baru.`);
            setExpandedCategories(newCategories.map(c => c.id));
        } else {
            alert("Tidak ada data baru yang ditambahkan. Semua kategori di file sudah ada di database.");
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                processImportedData(jsonData);
            } catch (error) {
                console.error("Error parsing file:", error);
                alert("Terjadi kesalahan membaca file. Pastikan formatnya benar (.xlsx atau .csv).");
            }
            event.target.value = null;
        };

        reader.readAsBinaryString(file);
    };

    const handleLinkImport = async (e) => {
        e.preventDefault();
        if (!importLink) return;

        try {
            const match = importLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) {
                alert("Link Google Sheet tidak valid. Pastikan Anda menyalin link penuh.");
                return;
            }
            const sheetId = match[1];

            const gidMatch = importLink.match(/[#&?]gid=([0-9]+)/);
            const gid = gidMatch ? gidMatch[1] : '0';

            const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

            const response = await fetch(exportUrl);
            if (!response.ok) {
                throw new Error("Gagal mengunduh data. Pastikan Google Sheet memiliki akses publik (Viewer).");
            }

            const csvText = await response.text();

            if (csvText.trim().toLowerCase().startsWith('<!doctype html>')) {
                throw new Error("File tidak dapat diakses. Pastikan Google Sheet memiliki akses publik (Anyone with the link can view).");
            }

            const workbook = XLSX.read(csvText, { type: 'string' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            processImportedData(jsonData);
            setIsImportLinkModalOpen(false);
            setImportLink('');

        } catch (error) {
            console.error("Import error:", error);
            alert(error.message || "Terjadi kesalahan saat mengimpor dari link.");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-display antialiased h-screen flex overflow-hidden">
            <Sidebar activePage="category" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Manajemen Kategori</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-scroll p-6 md:p-8 custom-scrollbar">
                    {/* Page Header Actions */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Daftar Kategori</h2>
                            <p className="text-slate-500 text-sm">Lihat hirarki kategori dan sub-kategori.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={toggleAll}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-sm"
                            >
                                <span className="material-icons-round">{allExpanded ? 'unfold_less' : 'unfold_more'}</span>
                                <span>{allExpanded ? 'Tutup Semua' : 'Buka Semua'}</span>
                            </button>

                            <input
                                type="file"
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => setIsImportLinkModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all font-medium text-sm"
                            >
                                <span className="material-icons-round">link</span>
                                <span>Import dari Link</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all font-medium text-sm"
                            >
                                <span className="material-icons-round">upload_file</span>
                                <span>Upload File</span>
                            </button>

                            <Link to="/category/create" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all font-medium text-sm">
                                <span className="material-icons-round">add</span>
                                <span>Kategori Baru</span>
                            </Link>
                        </div>
                    </div>

                    {/* Categories List View */}
                    {categories.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {categories.map((cat) => {
                                const catSubs = subCategories.filter(s => s.categoryId === cat.id || s.categoryId === cat.id.toString());
                                const isExpanded = expandedCategories.includes(cat.id);

                                return (
                                    <div key={cat.id} className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transform transition-all hover:shadow-md">
                                        {/* Category Header */}
                                        <div
                                            className="group px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            onClick={() => toggleExpand(cat.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'} transition-colors`}>
                                                    <span className="material-icons-round">category</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                                                    <p className="text-xs text-slate-500">Includes {catSubs.length} sub-categories</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center gap-2 mr-4 transition-opacity ${cat.name.toLowerCase() === 'aset' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    <Link
                                                        to={`/category/edit/${cat.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="Edit Category"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="material-icons-round">edit</span>
                                                    </Link>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); }}
                                                        className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="Manage Subcategories"
                                                    >
                                                        <span className="material-icons-round">settings</span>
                                                    </button>
                                                    {cat.name.toLowerCase() !== 'aset' ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(cat.id); }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            title="Delete Category"
                                                        >
                                                            <span className="material-icons-round">delete</span>
                                                        </button>
                                                    ) : (
                                                        <span
                                                            className="p-1.5 text-amber-500 dark:text-amber-400 cursor-not-allowed"
                                                            title="Kategori sistem — tidak dapat dihapus"
                                                        >
                                                            <span className="material-icons-round">lock</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`material-icons-round text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subcategories List (Expanded) */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4 animate-fadeIn">
                                                {catSubs.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {catSubs.map(sub => (
                                                            <div key={sub.id} className="group flex items-center justify-between gap-3 px-3 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary/50 transition-colors">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <span className="material-icons-round text-slate-400 text-sm flex-shrink-0">subdirectory_arrow_right</span>
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={sub.name}>{sub.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                                    <Link
                                                                        to={`/subcategory/edit/${sub.id}`}
                                                                        className="p-1.5 text-slate-400 hover:text-primary rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                        title="Edit Sub-Kategori"
                                                                    >
                                                                        <span className="material-icons-round text-[16px]">edit</span>
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => handleDeleteSubcategory(sub.id)}
                                                                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                        title="Delete Sub-Kategori"
                                                                    >
                                                                        <span className="material-icons-round text-[16px]">delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Link
                                                            to="/subcategory/create"
                                                            state={{ categoryId: cat.id }}
                                                            className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:text-primary hover:border-primary transition-colors text-sm"
                                                        >
                                                            <span className="material-icons-round text-sm">add</span>
                                                            <span>Add Sub-Category</span>
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-4 text-slate-400">
                                                        <span className="text-xs italic mb-2">No sub-categories yet</span>
                                                        <Link to="/subcategory/create" state={{ categoryId: cat.id }} className="text-xs text-primary hover:underline">Create one</Link>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card-dark rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <span className="material-icons-round text-3xl text-slate-400">category</span>
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Belum ada kategori</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-sm text-center">Buat kategori pertama Anda untuk mengelompokkan proyek dengan lebih baik.</p>
                            <Link to="/category/create" className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                                Buat Kategori Sekarang
                            </Link>
                        </div>
                    )}
                </div>

                <CategoryDetailPanel
                    category={selectedCategory}
                    isOpen={!!selectedCategory}
                    onClose={() => setSelectedCategory(null)}
                    onUpdate={async () => {
                        try {
                            const data = await api.categories.list();
                            const subData = Array.isArray(data) ? [] : (data.subCategories || []);
                            setSubCategories(subData);
                        } catch (err) { console.error(err); }
                    }}
                />

                {/* Reassign Category Modal */}
                <ReassignCategoryModal
                    isOpen={reassignModal.isOpen}
                    onClose={() => setReassignModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={handleReassignConfirm}
                    type={reassignModal.type}
                    itemName={reassignModal.itemName}
                    affectedCount={reassignModal.affectedCount}
                    availableTargets={reassignModal.availableTargets}
                />
            </main>
            {/* Import Link Modal */}
            {isImportLinkModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800 ext-slate-800">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-icons-round text-blue-500">link</span>
                                Import Kategori dari Link
                            </h2>
                            <button onClick={() => setIsImportLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-lg">
                                <span className="material-icons-round">close</span>
                            </button>
                        </header>
                        <form onSubmit={handleLinkImport} className="p-6">
                            <p className="text-sm text-slate-500 mb-4">
                                Masukkan URL Google Spreadsheet yang memiliki kolom <strong>Nama Kategori</strong> dan <strong>Nama Sub-kategori</strong>. Pastikan pengaturan berbaginya (Share) diset ke <strong>"Anyone with the link"</strong>.
                            </p>
                            <label className="block space-y-2 relative">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Link Google Sheet</span>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none dark:bg-slate-800 dark:text-white transition-all text-sm"
                                    value={importLink}
                                    onChange={(e) => setImportLink(e.target.value)}
                                />
                            </label>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsImportLinkModalOpen(false)} className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors font-medium text-sm">
                                    Batal
                                </button>
                                <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all font-medium text-sm flex items-center gap-2">
                                    <span className="material-icons-round text-[18px]">cloud_download</span>
                                    Mulai Import
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
