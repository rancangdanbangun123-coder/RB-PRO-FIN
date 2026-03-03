import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EditMaterialModal from '../components/EditMaterialModal';
import AddMaterialModal from '../components/AddMaterialModal';
import { MATERIAL_DATABASE } from '../data/materialData';
import { SUBCON_DATABASE } from '../data/subcontractorData';
import * as XLSX from 'xlsx';
import Sidebar from '../components/Sidebar';
import SearchableSelect from '../components/SearchableSelect';
import { generateMaterialId, updateMaterialsWithNewPrefixes, cascadeSubcontractorMaterialIds } from '../utils/materialUtils';

export default function MaterialDatabase() {
    const [materials, setMaterials] = useState(() => {
        const saved = localStorage.getItem('materials');
        if (saved) return JSON.parse(saved);
        // If no saved materials, initialize with MATERIAL_DATABASE and put it in local storage
        localStorage.setItem('materials', JSON.stringify(MATERIAL_DATABASE));
        return MATERIAL_DATABASE;
    });
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    // Initialize from localStorage or empty object
    const [excludedSuppliers, setExcludedSuppliers] = useState(() => {
        const saved = localStorage.getItem('excludedSuppliers');
        return saved ? JSON.parse(saved) : {};
    });

    const [subcons, setSubcons] = useState(() => {
        const saved = localStorage.getItem('subcontractors');
        return saved ? JSON.parse(saved) : SUBCON_DATABASE;
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Persist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('excludedSuppliers', JSON.stringify(excludedSuppliers));
    }, [excludedSuppliers]);

    useEffect(() => {
        const catData = JSON.parse(localStorage.getItem("categories")) || [];
        const subData = JSON.parse(localStorage.getItem("subCategories")) || [];
        setCategories(catData);
        setSubCategories(subData);
    }, []);

    // Listen to storage events to sync cross-page category renames
    useEffect(() => {
        const handleStorageChange = () => {
            const savedMats = localStorage.getItem('materials');
            if (savedMats) setMaterials(JSON.parse(savedMats));

            const savedCats = localStorage.getItem('categories');
            if (savedCats) setCategories(JSON.parse(savedCats));

            const savedSubs = localStorage.getItem('subCategories');
            if (savedSubs) setSubCategories(JSON.parse(savedSubs));

            const savedSubcons = localStorage.getItem('subcontractors');
            if (savedSubcons) setSubcons(JSON.parse(savedSubcons));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Price Rollup Logic - Derived State
    const materialsWithRollup = useMemo(() => {
        if (!materials) return [];

        return materials.map(material => {
            const supplierPrices = [];
            const excludedForThis = excludedSuppliers[material.id] || [];

            subcons.forEach(subcon => {
                const supply = subcon.suppliedMaterials?.find(m => m.materialId === material.id);
                if (supply && !excludedForThis.includes(subcon.id)) {
                    supplierPrices.push({ price: supply.price, supplierId: subcon.id });
                }
            });

            if (supplierPrices.length > 0) {
                const avgPrice = supplierPrices.reduce((a, b) => a + b.price, 0) / supplierPrices.length;
                return {
                    ...material,
                    marketPrice: avgPrice, // Market price = average of suppliers
                    sourceCount: supplierPrices.length,
                    originalDetails: supplierPrices,
                    hasSuppliers: true
                };
            }
            // If no suppliers (or all excluded), return material with no market price
            return {
                ...material,
                sourceCount: 0,
                hasSuppliers: false
            };
        });
    }, [materials, excludedSuppliers, subcons]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportLinkModalOpen, setIsImportLinkModalOpen] = useState(false);
    const [importLink, setImportLink] = useState('');
    const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
    const [newSupplierData, setNewSupplierData] = useState({ subconId: '', price: '' });

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
    const [subCategoryFilter, setSubCategoryFilter] = useState('Semua Sub-Kategori');
    const [statusFilter, setStatusFilter] = useState('Semua Status');
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const fileInputRef = React.useRef(null);

    // Safety: Check database existence
    if (!materials || !Array.isArray(materials)) {
        return <div className="p-10 text-center text-red-500">Database Error: Material data not found.</div>;
    }

    // Filter Logic - useMemo to prevent infinite loops
    const filteredMaterials = useMemo(() => {
        return materialsWithRollup.filter(item => {
            // Safety: Ensure properties exist and are strings
            const name = (item.name || '').toLowerCase();
            const id = (item.id || '').toLowerCase();
            const category = (item.category || '').toLowerCase();
            const query = searchQuery.toLowerCase();

            const matchesSearch = name.includes(query) || id.includes(query) || category.includes(query);
            const matchesCategory = categoryFilter === 'Semua Kategori' || item.category === categoryFilter;
            const matchesSubCategory = subCategoryFilter === 'Semua Sub-Kategori' || item.subCategory === subCategoryFilter;

            let statusMatch = true;
            if (statusFilter === 'Aktif') statusMatch = item.status === 'Active';
            else if (statusFilter === 'Tidak Aktif') statusMatch = item.status === 'Inactive';
            else if (statusFilter === 'Diarsipkan') statusMatch = item.status === 'Archived';

            return matchesSearch && matchesCategory && matchesSubCategory && statusMatch;
        });
    }, [materialsWithRollup, searchQuery, categoryFilter, subCategoryFilter, statusFilter]);

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, subCategoryFilter, statusFilter]);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

    // Handlers
    const toggleSelection = (id) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const newSelected = new Set([...selectedItems, ...currentItems.map(item => item.id)]);
            setSelectedItems(Array.from(newSelected));
        } else {
            const currentItemIds = currentItems.map(item => item.id);
            setSelectedItems(selectedItems.filter(id => !currentItemIds.includes(id)));
        }
    };

    const handleAddSupplierSubmit = (e) => {
        e.preventDefault();
        if (!selectedMaterial) return;

        const priceNum = parseFloat(newSupplierData.price.replace(/,/g, ''));
        if (isNaN(priceNum) || priceNum <= 0) return alert('Harga tidak valid!');

        const subconId = newSupplierData.subconId;
        if (!subconId) return alert('Pilih supplier');

        const updatedSubcons = subcons.map(sub => {
            if (sub.id === subconId) {
                const existingMaterials = sub.suppliedMaterials || [];
                const existingIdx = existingMaterials.findIndex(m => m.materialId === selectedMaterial.id);
                let newMs = [...existingMaterials];
                const todayDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                if (existingIdx >= 0) {
                    newMs[existingIdx].price = priceNum;
                    newMs[existingIdx].date = todayDate;
                } else {
                    newMs.push({ materialId: selectedMaterial.id, price: priceNum, date: todayDate });
                }
                return { ...sub, suppliedMaterials: newMs };
            }
            return sub;
        });

        setSubcons(updatedSubcons);
        localStorage.setItem('subcontractors', JSON.stringify(updatedSubcons));

        setIsAddSupplierModalOpen(false);
        setNewSupplierData({ subconId: '', price: '' });
    };

    const handleSaveMaterial = (updatedMaterial) => {
        let finalUpdatedMaterial = { ...updatedMaterial, price: Number(updatedMaterial.price) };
        let newActiveId = updatedMaterial.id;

        setMaterials(prev => {
            const newMats = prev.map(item =>
                item.id === updatedMaterial.id ? finalUpdatedMaterial : item
            );

            const { updatedMaterials, hasChanges, oldToNewIdMap } = updateMaterialsWithNewPrefixes(newMats);

            localStorage.setItem('materials', JSON.stringify(updatedMaterials));

            if (hasChanges) {
                cascadeSubcontractorMaterialIds(oldToNewIdMap);
                if (oldToNewIdMap[updatedMaterial.id]) {
                    newActiveId = oldToNewIdMap[updatedMaterial.id];
                    finalUpdatedMaterial.id = newActiveId;
                }
            }

            return updatedMaterials;
        });

        setIsEditModalOpen(false);
        if (selectedMaterial && selectedMaterial.id === updatedMaterial.id) {
            setSelectedMaterial(prev => ({ ...prev, ...finalUpdatedMaterial }));
        }
    };

    const handleAddMaterial = (newItem) => {

        const materialWithId = {
            ...newItem,
            id: generateMaterialId(newItem.category, newItem.subCategory, materials),
            price: Number(newItem.price),
            ahsPrice: newItem.ahsPrice ? Number(newItem.ahsPrice) : undefined,
            lastUpdate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            trend: 'flat',
            trendVal: '0%',
            plan: 'Manual'
        };
        setMaterials(prev => {
            const newMats = [materialWithId, ...prev];
            localStorage.setItem('materials', JSON.stringify(newMats));
            return newMats;
        });
        setIsAddModalOpen(false);
    };

    const handleDeleteMaterial = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus material ini?')) {
            setMaterials(prev => {
                const newMats = prev.filter(item => item.id !== id);
                localStorage.setItem('materials', JSON.stringify(newMats));
                return newMats;
            });
            if (selectedMaterial && selectedMaterial.id === id) {
                setSelectedMaterial(null);
            }
            setSelectedItems(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;
        if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} material yang dipilih?`)) {
            setMaterials(prev => {
                const newMats = prev.filter(item => !selectedItems.includes(item.id));
                localStorage.setItem('materials', JSON.stringify(newMats));
                return newMats;
            });
            if (selectedMaterial && selectedItems.includes(selectedMaterial.id)) {
                setSelectedMaterial(null);
            }
            setSelectedItems([]);
        }
    };

    const processImportedData = (jsonData) => {
        let addedMats = 0;
        const newMaterials = [];
        const skippedMats = [];

        jsonData.forEach((row, index) => {
            const name = row['Nama Item'] || row['Nama Material'] || row['Nama'] || row.Name || row.name || row.Material || '';
            const category = row['Kategori'] || row.Category || row.KATEGORI || 'Uncategorized';
            const subCategory = row['Subkategori'] || row['Sub-kategori'] || row.SubCategory || row.Subcategory || '-';

            // Extract number from "Rp 15.000,00"
            let rawPrice = row['Harga Satuan AHS'] || row['Harga AHS'] || row['Harga'] || row.Price || row.price || '0';
            let cleanPriceStr = String(rawPrice).replace(/Rp/gi, '').replace(/\./g, '').replace(/,/g, '.').trim();
            const price = Number(cleanPriceStr) || 0;

            // Helper to find value regardless of case or trailing spaces in header
            const findValue = (obj, possibleKeys) => {
                const lowerKeys = possibleKeys.map(k => k.toLowerCase().trim());
                for (const key in obj) {
                    if (lowerKeys.includes(key.toLowerCase().trim())) {
                        return obj[key];
                    }
                }
                return null;
            };

            // Read Unit and Conversions mapped from specific columns
            // F: Base UoM, G: Standard Qty, H: Satandard UoM (or Standard UoM)
            const stdUnit = findValue(row, ['satandard uom', 'standard uom', 'satuan standar', 'standard unit']) || 'Unit';
            const rawBaseUnit = findValue(row, ['base uom', 'base unit', 'satuan dasar', 'satuan', 'unit']);
            const baseUnit = rawBaseUnit || stdUnit;
            const rawConvFactor = findValue(row, ['standard qty', 'kuantitas konversi', 'konversi', 'conversion', 'kuantitas standard uom']);

            let hasConversion = false;
            let conversionFactor = '';
            let standardUnit = '';

            if (rawConvFactor && stdUnit) {
                const parsedFactor = Number(rawConvFactor);
                if (!isNaN(parsedFactor) && parsedFactor > 0) {
                    hasConversion = true;
                    conversionFactor = parsedFactor;
                    standardUnit = stdUnit;
                }
            }

            if (!name) return; // Skip empty rows

            // Prevent duplicate by checking existing materials + ones we just added to array
            const isDuplicate = materials.some(m => m.name.toLowerCase() === name.toLowerCase()) ||
                newMaterials.some(m => m.name.toLowerCase() === name.toLowerCase());

            if (!isDuplicate) {
                newMaterials.push({
                    id: `IMP-${Date.now()}-${index}`,
                    name,
                    category,
                    subCategory,
                    price,
                    ahsPrice: price,
                    unit: baseUnit,
                    hasConversion,
                    conversionFactor,
                    standardUnit,
                    status: 'Active',
                    lastUpdate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    trend: 'flat',
                    trendVal: '0%',
                    plan: 'Imported'
                });
                addedMats++;
            } else {
                skippedMats.push(name);
            }
        });

        let resultMessage = '';

        if (addedMats > 0) {
            setMaterials(prev => {
                const combinedMats = [...newMaterials, ...prev];
                const { updatedMaterials, hasChanges, oldToNewIdMap } = updateMaterialsWithNewPrefixes(combinedMats);
                localStorage.setItem('materials', JSON.stringify(updatedMaterials));
                if (hasChanges) {
                    cascadeSubcontractorMaterialIds(oldToNewIdMap);
                }
                return updatedMaterials;
            });
            resultMessage += `Berhasil mengimpor! Menambahkan ${addedMats} Item Material baru.\n\n`;
        } else {
            resultMessage += "Tidak ada data materi baru yang ditambahkan.\n\n";
        }

        if (skippedMats.length > 0) {
            resultMessage += `⚠️ ${skippedMats.length} Item dilewati karena sudah ada di database:\n- ${skippedMats.slice(0, 5).join('\n- ')}`;
            if (skippedMats.length > 5) {
                resultMessage += `\n...dan ${skippedMats.length - 5} lainnya.`;
            }
        }

        if (addedMats > 0 || skippedMats.length > 0) {
            alert(resultMessage.trim());
        } else {
            alert("Format tidak dikenali, pastikan sheet Excel/Link sudah benar.");
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
                const expectedSheet = workbook.SheetNames.find(n => n.toLowerCase() === 'material');
                const sheetName = expectedSheet || workbook.SheetNames[0];
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

        setIsImportLinkModalOpen(false); // Close immediately for feedback

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
            const expectedSheet = workbook.SheetNames.find(n => n.toLowerCase() === 'material');
            const sheetName = expectedSheet || workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            processImportedData(jsonData);
            setImportLink('');

        } catch (error) {
            console.error("Import error:", error);
            alert(error.message || "Terjadi kesalahan saat mengimpor dari link.");
        }
    };

    // Helper for safe currency formatting
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID').format(Number(value) || 0);
    };

    const currentSelectedMaterial = useMemo(() => {
        if (!selectedMaterial) return null;
        return materialsWithRollup.find(m => m.id === selectedMaterial.id) || selectedMaterial;
    }, [materialsWithRollup, selectedMaterial]);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased h-screen flex overflow-hidden">

            <Sidebar activePage="material" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative mr-0 lg:mr-[450px] transition-all duration-300">

                <header className="h-16 shrink-0 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Database Material</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-card-dark transition-colors relative">
                            <span className="material-icons-round text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Controls */}
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Kelola harga dan stok material proyek</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    accept=".csv"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <span className="material-icons-round text-lg">file_download</span>
                                    <span>Export</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                                >
                                    <span className="material-icons-round text-[18px]">upload_file</span>
                                    <span>Import CSV / XLSX</span>
                                </button>
                                <button
                                    onClick={() => setIsImportLinkModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all"
                                >
                                    <span className="material-icons-round text-[18px]">link</span>
                                    <span>Import Link</span>
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all">
                                    <span className="material-icons-round">add</span>
                                    <span>Material Baru</span>
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div className="relative col-span-1 md:col-span-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-round text-slate-400">search</span>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Cari ID, nama item, atau kategori..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            <SearchableSelect
                                value={categoryFilter}
                                onChange={(val) => {
                                    setCategoryFilter(val);
                                    setSubCategoryFilter('Semua Sub-Kategori');
                                }}
                                placeholder="Semua Kategori"
                                options={[
                                    { value: 'Semua Kategori', label: 'Semua Kategori' },
                                    ...categories.map(cat => ({ value: cat.name, label: cat.name }))
                                ]}
                            />
                            <SearchableSelect
                                value={subCategoryFilter}
                                onChange={(val) => setSubCategoryFilter(val)}
                                placeholder="Semua Sub-Kategori"
                                disabled={categoryFilter === 'Semua Kategori'}
                                options={[
                                    { value: 'Semua Sub-Kategori', label: 'Semua Sub-Kategori' },
                                    ...subCategories
                                        .filter(sub => {
                                            if (categoryFilter === 'Semua Kategori') return true;
                                            const parentCat = categories.find(c => c.name === categoryFilter);
                                            return parentCat && (sub.categoryId === parentCat.id || sub.categoryId === String(parentCat.id));
                                        })
                                        .map(sub => ({ value: sub.name, label: sub.name }))
                                ]}
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option>Semua Status</option>
                                <option>Aktif</option>
                                <option>Tidak Aktif</option>
                                <option>Diarsipkan</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="flex-1 overflow-auto px-6 pb-20">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-surface-dark/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={currentItems.length > 0 && currentItems.every(item => selectedItems.includes(item.id))}
                                                className="rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Details</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Harga Satuan</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {currentItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedMaterial(item)}
                                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${selectedMaterial?.id === item.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleSelection(item.id)}
                                                    className="rounded border-slate-300 text-primary focus:ring-primary"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                        {(item.name || '?').charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono">{item.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900 dark:text-white">{item.category}</div>
                                                <div className="text-xs text-slate-500">{item.subCategory}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-mono font-semibold text-slate-900 dark:text-white" title="Harga AHS">
                                                    Rp {formatCurrency(item.ahsPrice || item.price || 0)}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {item.hasSuppliers ? `Mrkt: Rp ${formatCurrency(item.marketPrice)}` : 'Mrkt: -'}
                                                    {item.sourceCount > 0 && (
                                                        <span className="ml-1.5 text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded" title={`Rerata dari ${item.sourceCount} supplier`}>
                                                            {item.sourceCount} Spl
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5">per {item.unit}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${item.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        item.status === 'Inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                    {item.status === 'Active' ? 'Aktif' : item.status === 'Inactive' ? 'Tidak Aktif' : 'Diarsipkan'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteMaterial(item.id);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Hapus Material"
                                                >
                                                    <span className="material-icons-round text-[20px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center py-4 bg-white dark:bg-card-dark px-6 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Menampilkan <span className="font-semibold text-slate-900 dark:text-slate-200">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredMaterials.length)}</span> - <span className="font-semibold text-slate-900 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredMaterials.length)}</span> dari <span className="font-semibold text-slate-900 dark:text-slate-200">{filteredMaterials.length}</span> bahan
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Per Halaman:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1); // Reset to first page when changing size
                                        }}
                                        className="text-sm px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-dark text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-primary focus:border-primary"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={filteredMaterials.length || 1000}>Semua</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 transition-colors"
                                    >
                                        <span className="material-icons-round text-sm">chevron_left</span>
                                    </button>
                                    <div className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium bg-slate-50 dark:bg-surface-dark text-slate-700 dark:text-slate-300">
                                        {currentPage} / {totalPages || 1}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 transition-colors"
                                    >
                                        <span className="material-icons-round text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Details Panel - Fixed to right */}
                <aside className="fixed inset-y-0 right-0 w-full sm:w-96 lg:w-[450px] bg-white dark:bg-card-dark border-l border-slate-200 dark:border-border-dark flex flex-col z-30 shadow-xl transform transition-transform duration-300 lg:translate-x-0 overflow-y-auto">
                    {currentSelectedMaterial ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${currentSelectedMaterial.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {currentSelectedMaterial.status}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDeleteMaterial(currentSelectedMaterial.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Hapus Material"
                                        >
                                            <span className="material-icons-round text-[20px]">delete</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedMaterial(null)}
                                            className="text-slate-400 hover:text-slate-600 lg:hidden"
                                        >
                                            <span className="material-icons-round">close</span>
                                        </button>
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{currentSelectedMaterial.name}</h2>
                                <p className="text-sm text-slate-500 font-mono">{currentSelectedMaterial.id}</p>
                            </div>

                            <div className="p-6 space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 dark:bg-surface-dark rounded-lg">
                                        <p className="text-xs text-slate-500 mb-1">Harga Market</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                                            {currentSelectedMaterial.hasSuppliers ? `Rp ${formatCurrency(currentSelectedMaterial.marketPrice)}` : '-'}
                                        </p>
                                        {currentSelectedMaterial.hasSuppliers && <p className="text-xs text-slate-400">/{currentSelectedMaterial.unit}</p>}
                                    </div>
                                    <div className="p-3 bg-white dark:bg-background-dark rounded-lg border border-slate-200 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 mb-1">Harga AHS</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Rp {formatCurrency(currentSelectedMaterial.ahsPrice || currentSelectedMaterial.price)}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {(() => {
                                                if (!currentSelectedMaterial.hasSuppliers) return <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Belum ada harga pasar</span>;
                                                const market = currentSelectedMaterial.marketPrice;
                                                const ahs = currentSelectedMaterial.ahsPrice || currentSelectedMaterial.price;
                                                const diff = market - ahs;
                                                const percent = (diff / ahs) * 100;
                                                const isHigher = diff > 0;

                                                if (Math.abs(diff) < 1) return <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Sesuai AHS</span>;

                                                return (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${isHigher ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                        <span className="material-icons-round text-[10px]">{isHigher ? 'trending_up' : 'trending_down'}</span>
                                                        {Math.abs(percent).toFixed(1)}%
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {currentSelectedMaterial.hasConversion && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-icons-round text-indigo-600 dark:text-indigo-400 text-[18px]">calculate</span>
                                            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Konversi Satuan Aktif</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            <div className="text-center bg-white dark:bg-background-dark py-2 px-1 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <p className="text-[10px] text-slate-500 mb-0.5">Market (Base)</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">1 <span className="text-xs font-normal">{currentSelectedMaterial.unit}</span></p>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className="material-icons-round text-slate-400">arrow_forward</span>
                                            </div>
                                            <div className="text-center bg-white dark:bg-background-dark py-2 px-1 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm border-b-2 border-b-indigo-500">
                                                <p className="text-[10px] text-slate-500 mb-0.5">Standar Int.</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{currentSelectedMaterial.conversionFactor} <span className="text-xs font-normal">{currentSelectedMaterial.standardUnit}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sumber Harga & Supplier</h3>
                                        <button
                                            onClick={() => setIsAddSupplierModalOpen(true)}
                                            className="text-xs text-primary hover:text-primary-hover flex items-center font-medium"
                                        >
                                            <span className="material-icons-round text-[16px] mr-1">add_circle</span> Tambah Supplier
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {subcons.filter(sub => sub.suppliedMaterials?.some(m => m.materialId === currentSelectedMaterial.id)).length === 0 && (
                                            <div className="text-center p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500">
                                                Belum ada supplier terkait. Tambahkan untuk referensi harga pasar.
                                            </div>
                                        )}
                                        {subcons.filter(sub => sub.suppliedMaterials?.some(m => m.materialId === currentSelectedMaterial.id)).map(sub => {
                                            const supply = sub.suppliedMaterials.find(m => m.materialId === currentSelectedMaterial.id);
                                            const isExcluded = excludedSuppliers[currentSelectedMaterial.id]?.includes(sub.id);

                                            return (
                                                <div key={sub.id} className={`flex items-center justify-between p-2 rounded-lg border ${isExcluded ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-blue-100 bg-blue-50/50'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!isExcluded}
                                                            onChange={(e) => {
                                                                const currentExcluded = excludedSuppliers[currentSelectedMaterial.id] || [];
                                                                let newExcluded;
                                                                if (e.target.checked) {
                                                                    // Un-exclude (Include)
                                                                    newExcluded = currentExcluded.filter(id => id !== sub.id);
                                                                } else {
                                                                    // Exclude
                                                                    newExcluded = [...currentExcluded, sub.id];
                                                                }
                                                                setExcludedSuppliers(prev => ({
                                                                    ...prev,
                                                                    [currentSelectedMaterial.id]: newExcluded
                                                                }));
                                                            }}
                                                            className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">{sub.name}</p>
                                                            <p className="text-[10px] text-slate-500">{supply.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-slate-700">Rp {formatCurrency(supply.price)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Informasi Detil</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500">Kategori</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{currentSelectedMaterial.category}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500">Sub-Kategori</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{currentSelectedMaterial.subCategory}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500">Harga AHS</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">Rp {formatCurrency(currentSelectedMaterial.ahsPrice || currentSelectedMaterial.price)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                            <span className="text-sm text-slate-500">Update Terakhir</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{currentSelectedMaterial.lastUpdate}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-icons-round text-sm">edit</span>
                                    Edit Material
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                            <span className="material-icons-round text-5xl mb-3 text-slate-200 dark:text-slate-700">inventory_2</span>
                            <p className="font-medium">Pilih material untuk melihat detail</p>
                            <p className="text-sm mt-1 text-slate-400">Klik pada salah satu baris di tabel</p>
                        </div>
                    )}
                </aside>

                {/* Modals & Overlays */}
                <EditMaterialModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    material={selectedMaterial}
                    onSave={handleSaveMaterial}
                    categories={categories}
                    subCategories={subCategories}
                />

                <AddMaterialModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddMaterial}
                    categories={categories}
                    subCategories={subCategories}
                />

                {/* Modal for Adding Supplier to Material inline */}
                {
                    isAddSupplierModalOpen && selectedMaterial && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-border-dark relative">
                                <button onClick={() => setIsAddSupplierModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                    <span className="material-icons-round">close</span>
                                </button>
                                <h3 className="text-lg font-bold mb-4">Pautkan Supplier</h3>
                                <p className="text-sm text-slate-500 mb-6 font-mono">{currentSelectedMaterial.id}</p>
                                <form onSubmit={handleAddSupplierSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pilih Supplier <span className="text-red-500">*</span></label>
                                        <SearchableSelect
                                            value={newSupplierData.subconId}
                                            onChange={(val) => setNewSupplierData({ ...newSupplierData, subconId: val })}
                                            placeholder="-- Pilih Supplier --"
                                            options={subcons.map(sub => ({ value: sub.id, label: sub.name }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Harga Penawaran / Beli (Rp) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-background-dark dark:border-border-dark focus:ring-2 focus:ring-primary outline-none"
                                            value={newSupplierData.price}
                                            onChange={e => setNewSupplierData({ ...newSupplierData, price: e.target.value })}
                                            placeholder="Contoh: 150000"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-border-dark">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddSupplierModalOpen(false)}
                                            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-lg shadow-primary/25 flex items-center gap-2"
                                        >
                                            <span className="material-icons-round text-[18px]">add_link</span>
                                            Simpan & Pautkan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }

                {/* Selected Status Bar */}
                {
                    selectedItems.length > 0 && (
                        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 lg:ml-0 z-50 bg-slate-900 text-white px-6 py-3 rounded-full flex items-center shadow-lg gap-6 animate-fade-in-up">
                            <span className="font-medium text-sm flex items-center gap-2">
                                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{selectedItems.length}</span>
                                Item Dipilih
                            </span>
                            <div className="h-4 w-px bg-slate-700"></div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleBulkDelete} className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors">
                                    <span className="material-icons-round text-base">delete</span>
                                    Hapus
                                </button>
                            </div>
                        </div>
                    )
                }
                {/* Modal for Google Sheets Link Import */}
                {
                    isImportLinkModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
                            <div className="bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all animate-scale-up">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-icons-round text-emerald-600">link</span>
                                        Import dari Google Sheets
                                    </h2>
                                    <button
                                        onClick={() => setIsImportLinkModalOpen(false)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <span className="material-icons-round">close</span>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleLinkImport} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Link Google Sheets <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="url"
                                                required
                                                value={importLink}
                                                onChange={(e) => setImportLink(e.target.value)}
                                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-2"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Pastikan akses link diatur ke <strong>"Anyone with the link can view"</strong>. Kami akan mengimpor dari sheet bernama <strong>Material</strong> atau sheet pertama jika tidak ditemukan. Kolom yang dicari: <em>Nama Item, Kategori, Subkategori, Harga Satuan AHS, Base UoM (Kolom F), Standard Qty (Kolom G), Satuan Standar (Kolom H)</em>.
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setIsImportLinkModalOpen(false)}
                                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!importLink}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <span className="material-icons-round text-[18px]">cloud_download</span>
                                                Mulai Import
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}
