import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { projects as PROJECT_DATA } from '../data/projectData';

export default function LaporanProyek({ selectedProjectId = 'all' }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const selectedProjectName = useMemo(() => {
        if (selectedProjectId === 'all') return 'Semua Proyek';
        const project = PROJECT_DATA.find(p => p.id === selectedProjectId);
        return project ? project.name : 'Proyek Tidak Ditemukan';
    }, [selectedProjectId]);

    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const mats = await api.materials.list();
                setMaterials((mats || []).filter(m => !['inactive', 'tidak aktif'].includes((m.status || '').toLowerCase())));
            } catch (err) { console.error(err); }
        })();
    }, []);

    // Generate report data by combining fetched materials with mocked inventory/usage data
    const reportData = useMemo(() => {
        return materials.map(item => {
            // Generate a stable random inventory based on item ID char codes
            const seed = item.id.charCodeAt(0) + (item.id.charCodeAt(item.id.length - 1) || 0) + item.price;
            const inventoryQty = (seed % 500) + 50;

            let usedQty = 0;

            if (!selectedProjectId || selectedProjectId === 'all') {
                // For "All Projects", sum of all theoretical project usage
                usedQty = Math.floor(inventoryQty * 0.7);
            } else {
                // For specific projects, generate a deterministic lower usage based on BOTH item and project
                const projectSeed = selectedProjectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

                // Mix the item seed and project seed to get a unique interaction
                const mixer = (seed * 17 + projectSeed * 23) % 100;

                // Allow some materials to not be used at all in certain projects depending on the mix
                if (mixer < 20) {
                    usedQty = 0; // 20% chance this project didn't use this material
                } else {
                    // Usage between 5% and 40% of inventory for this project
                    const usagePercentage = 0.05 + ((mixer % 35) / 100);
                    usedQty = Math.floor(inventoryQty * usagePercentage);
                }
            }

            return {
                ...item,
                inventoryQty,
                usedQty,
                remainingQty: inventoryQty - usedQty,
                totalInventoryValue: inventoryQty * item.price,
                totalUsedValue: usedQty * item.price,
                totalRemainingValue: (inventoryQty - usedQty) * item.price
            };
        });
    }, [selectedProjectId]);

    const filteredData = useMemo(() => {
        return reportData.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reportData, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value);

    // Totals for Summary Cards
    const totalInventoryVal = filteredData.reduce((acc, curr) => acc + curr.totalInventoryValue, 0);
    const totalUsedVal = filteredData.reduce((acc, curr) => acc + curr.totalUsedValue, 0);
    const totalRemainingVal = filteredData.reduce((acc, curr) => acc + curr.totalRemainingValue, 0);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Info */}
                <div className="flex flex-col justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Laporan Material Proyek</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Monitoring Penggunaan Material vs Inventaris</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Nilai Inventaris</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalInventoryVal)}</h3>
                        <p className="text-xs text-slate-400 mt-2">Total aset material tersedia (Gudang Utama)</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {selectedProjectId === 'all' ? 'Total Nilai Terpakai (All)' : 'Terpakai di Proyek Ini'}
                        </p>
                        <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalUsedVal)}</h3>
                        <p className="text-xs text-slate-400 mt-2">Material yang sudah digunakan</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sisa Nilai Material</p>
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalRemainingVal)}</h3>
                        <p className="text-xs text-slate-400 mt-2">Inventaris dikurangi penggunaan</p>
                    </div>
                </div>

                {/* Filters & Table */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Cari material (nama, ID, kategori)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                            <span className="material-icons text-sm">filter_list</span>
                            Filter
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Material</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Inventaris</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Terpakai</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Sisa</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Nilai Sisa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3 px-6">
                                                <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                <div className="text-xs text-slate-500">{item.id} • {item.category}</div>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className="font-medium text-slate-700 dark:text-slate-200">{formatNumber(item.inventoryQty)} {item.unit}</div>
                                                <div className="text-xs text-slate-400">{formatCurrency(item.totalInventoryValue)}</div>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className="font-medium text-blue-600 dark:text-blue-400">{formatNumber(item.usedQty)} {item.unit}</div>
                                                <div className="text-xs text-slate-400">{formatCurrency(item.totalUsedValue)}</div>
                                                {/* Usage Bar */}
                                                <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min((item.usedQty / item.inventoryQty) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <div className={`font-medium ${item.remainingQty < (item.inventoryQty * 0.2) ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {formatNumber(item.remainingQty)} {item.unit}
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-right font-medium text-green-600 dark:text-green-500">
                                                {formatCurrency(item.totalRemainingValue)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-slate-500">Tidak ada data material ditemukan</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm text-slate-500">
                        <span>Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
