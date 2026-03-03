import React, { useState, useMemo } from 'react';

export default function LaporanKeuangan({ selectedProjectId }) {
    // Simulate project-specific data based on ID
    const financialData = useMemo(() => {
        // Base numbers for "All Projects"
        let baseRevenue = 1250000000;
        let baseCogs = 845200000;
        let baseOpex = 15000000;

        if (selectedProjectId && selectedProjectId !== 'all') {
            // Deterministic random numbers based on project ID length/chars
            const seed = selectedProjectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const projectScale = ((seed % 50) + 10) / 100; // 10% to 60% of base

            baseRevenue = Math.floor(baseRevenue * projectScale);
            baseCogs = Math.floor(baseCogs * projectScale * 1.1); // Slightly different ratio
            baseOpex = Math.floor(baseOpex * projectScale * 0.8);
        }

        // Calculations
        const grossProfit = baseRevenue - baseCogs;
        const netProfit = grossProfit - baseOpex;
        const profitMargin = ((netProfit / baseRevenue) * 100).toFixed(2);
        const cogsPercentage = Math.round((baseCogs / baseRevenue) * 100) || 0;

        return {
            revenue: {
                total: baseRevenue,
                currentMonth: Math.floor(baseRevenue * 0.12),
                termin: Math.floor(baseRevenue * 0.9),
                terminMonth: Math.floor(baseRevenue * 0.9 * 0.12),
                retensi: Math.floor(baseRevenue * 0.1),
                retensiMonth: Math.floor(baseRevenue * 0.1 * 0.12),
            },
            cogs: {
                total: baseCogs,
                currentMonth: Math.floor(baseCogs * 0.11),
                material: Math.floor(baseCogs * 0.5),
                materialMonth: Math.floor(baseCogs * 0.5 * 0.11),
                labor: Math.floor(baseCogs * 0.25),
                laborMonth: Math.floor(baseCogs * 0.25 * 0.11),
                subcon: Math.floor(baseCogs * 0.18),
                subconMonth: Math.floor(baseCogs * 0.18 * 0.11),
                assets: Math.floor(baseCogs * 0.07),
                assetsMonth: Math.floor(baseCogs * 0.07 * 0.11)
            },
            opex: {
                total: baseOpex,
                currentMonth: Math.floor(baseOpex * 0.15),
            },
            grossProfit: {
                total: grossProfit,
                currentMonth: Math.floor(baseRevenue * 0.12) - Math.floor(baseCogs * 0.11)
            },
            netProfit: {
                total: netProfit,
                currentMonth: (Math.floor(baseRevenue * 0.12) - Math.floor(baseCogs * 0.11)) - Math.floor(baseOpex * 0.15),
                margin: profitMargin
            },
            metrics: {
                cogsPercentage
            }
        }

    }, [selectedProjectId]);

    const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Info & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Laporan Laba Rugi</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {selectedProjectId === 'all' ? 'Semua Proyek' : 'Proyek Spesifik'} • Periode: 1 Januari 2023 - 31 Desember 2023
                        </p>
                    </div>
                    {/* Date & Settings Filter */}
                    <div className="flex flex-wrap items-center bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm gap-y-2">
                        <div className="flex items-center pl-2 pr-3 border-r border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-semibold text-slate-500 uppercase mr-2">Tahun Fiskal</span>
                            <select className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-white focus:ring-0 py-1 pl-1 pr-6 cursor-pointer rounded">
                                <option>2023</option>
                                <option>2022</option>
                            </select>
                        </div>
                        <div className="flex items-center px-3 md:border-r border-slate-200 dark:border-slate-700">
                            <label className="flex items-center gap-2 cursor-pointer m-0">
                                <input defaultChecked className="form-checkbox rounded text-primary border-slate-300 dark:border-slate-600 focus:ring-primary bg-transparent" type="checkbox" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">Tampilkan Akrual</span>
                            </label>
                        </div>
                        <button className="text-primary hover:text-primary-hover text-sm font-medium px-3 py-1 hover:bg-primary/5 rounded transition-colors whitespace-nowrap mr-1">
                            + Penyesuaian
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Revenue Card */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pendapatan</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(financialData.revenue.total)}</h3>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <span className="material-icons text-green-500">trending_up</span>
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-green-500 font-medium">
                            <span className="flex items-center"><span className="material-icons text-sm mr-1">arrow_upward</span> 12.5%</span>
                            <span className="text-slate-400 ml-2 font-normal">vs Anggaran Awal</span>
                        </div>
                    </div>

                    {/* Cost Card */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Beban Proyek</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(financialData.cogs.total)}</h3>
                            </div>
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <span className="material-icons text-orange-500">construction</span>
                            </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${financialData.metrics.cogsPercentage}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{financialData.metrics.cogsPercentage}% dari Total Anggaran (Budget)</p>
                    </div>

                    {/* Net Profit Card */}
                    {/* BUG FIX: Removed 'overflow-hidden' and 'relative z-10' from inner content, and isolated stacking context so it doesn't leak/overlap the header dropdown */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-primary/30 shadow-sm relative isolate">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-700 dark:text-primary/80">Laba Bersih (Net)</p>
                                    <h3 className="text-2xl font-bold text-primary mt-1">{formatCurrency(financialData.netProfit.total)}</h3>
                                </div>
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <span className="material-icons text-primary">account_balance_wallet</span>
                                </div>
                            </div>
                            <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                                <span>Margin Keuntungan:</span>
                                <span className="text-slate-800 dark:text-white ml-2 bg-primary/20 px-1.5 py-0.5 rounded border border-primary/20">{financialData.netProfit.margin}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Adjustment / Accrual Section (Expandable) */}
                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-6">
                    <div className="px-6 py-4 flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-1.5 rounded text-blue-600 dark:text-blue-400">
                                <span className="material-icons text-sm">date_range</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Penyesuaian Pendapatan Akrual</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Dihitung berdasarkan persentase penyelesaian fisik di lapangan (Opname)</p>
                            </div>
                        </div>
                        <span className="material-icons text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">expand_more</span>
                    </div>
                </div>

                {/* Financial Statement Table */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden flex flex-col mt-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 sticky-header">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/2">Uraian</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-1/4">Bulan Ini</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-1/4">Tahun Berjalan (YTD)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                                {/* Revenue Section */}
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 group">
                                    <td className="py-3 px-6 font-bold text-slate-800 dark:text-slate-200">
                                        <div className="flex items-center">
                                            <span className="material-icons text-sm text-slate-400 mr-2">expand_more</span>
                                            PENDAPATAN USAHA
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-right font-bold text-slate-800 dark:text-slate-200">{formatCurrency(financialData.revenue.currentMonth)}</td>
                                    <td className="py-3 px-6 text-right font-bold text-slate-800 dark:text-slate-200">{formatCurrency(financialData.revenue.total)}</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-2 px-6 text-slate-600 dark:text-slate-400 pl-10">Pendapatan Termin</td>
                                    <td className="py-2 px-6 text-right text-slate-700 dark:text-slate-300">{formatCurrency(financialData.revenue.terminMonth)}</td>
                                    <td className="py-2 px-6 text-right text-slate-700 dark:text-slate-300">{formatCurrency(financialData.revenue.termin)}</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-2 px-6 text-slate-600 dark:text-slate-400 pl-10">Pendapatan Retensi (5%)</td>
                                    <td className="py-2 px-6 text-right text-slate-700 dark:text-slate-300">{formatCurrency(financialData.revenue.retensiMonth)}</td>
                                    <td className="py-2 px-6 text-right text-slate-700 dark:text-slate-300">{formatCurrency(financialData.revenue.retensi)}</td>
                                </tr>

                                {/* COGS Section Header */}
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 group mt-4">
                                    <td className="py-3 px-6 font-bold text-slate-800 dark:text-slate-200 pt-6">
                                        <div className="flex items-center">
                                            <span className="material-icons text-sm text-slate-400 mr-2">expand_more</span>
                                            BEBAN POKOK PENDAPATAN
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-right font-bold text-slate-800 dark:text-slate-200 pt-6 text-red-600 dark:text-red-400">- {formatCurrency(financialData.cogs.currentMonth)}</td>
                                    <td className="py-3 px-6 text-right font-bold text-slate-800 dark:text-slate-200 pt-6 text-red-600 dark:text-red-400">- {formatCurrency(financialData.cogs.total)}</td>
                                </tr>

                                {/* Material Category */}
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group/item">
                                    <td className="py-2 px-6 text-slate-700 dark:text-slate-300 font-medium pl-10 flex items-center">
                                        <span className="material-icons text-xs text-slate-400 mr-2 opacity-0 group-hover/item:opacity-100 transition-opacity">chevron_right</span>
                                        Material & Bahan Bangunan
                                    </td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.materialMonth)}</td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.material)}</td>
                                </tr>

                                {/* Labor Category */}
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group/item">
                                    <td className="py-2 px-6 text-slate-700 dark:text-slate-300 font-medium pl-10 flex items-center">
                                        <span className="material-icons text-xs text-slate-400 mr-2 opacity-0 group-hover/item:opacity-100 transition-opacity">chevron_right</span>
                                        Upah Tenaga Kerja Langsung
                                    </td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.laborMonth)}</td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.labor)}</td>
                                </tr>

                                {/* Subcon Category */}
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group/item">
                                    <td className="py-2 px-6 text-slate-700 dark:text-slate-300 font-medium pl-10 flex items-center">
                                        <span className="material-icons text-xs text-slate-400 mr-2 opacity-0 group-hover/item:opacity-100 transition-opacity">chevron_right</span>
                                        Jasa Subkontraktor
                                    </td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.subconMonth)}</td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.subcon)}</td>
                                </tr>

                                {/* Assets Category */}
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group/item border-b border-slate-200 dark:border-slate-700">
                                    <td className="py-2 px-6 text-slate-700 dark:text-slate-300 font-medium pl-10 flex items-center">
                                        <span className="material-icons text-xs text-slate-400 mr-2 opacity-0 group-hover/item:opacity-100 transition-opacity">chevron_right</span>
                                        Penyusutan Alat & Aset Proyek
                                    </td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.assetsMonth)}</td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.cogs.assets)}</td>
                                </tr>

                                {/* Gross Profit Calculation */}
                                <tr className="bg-primary/5 dark:bg-primary/10 font-bold border-b border-primary/20">
                                    <td className="py-4 px-6 text-slate-800 dark:text-white uppercase tracking-wide">LABA KOTOR PROYEK</td>
                                    <td className="py-4 px-6 text-right text-primary">{formatCurrency(financialData.grossProfit.currentMonth)}</td>
                                    <td className="py-4 px-6 text-right text-primary">{formatCurrency(financialData.grossProfit.total)}</td>
                                </tr>

                                {/* Expenses Header */}
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 group mt-4">
                                    <td className="py-3 px-6 font-bold text-slate-800 dark:text-slate-200 pt-6">
                                        <div className="flex items-center">
                                            <span className="material-icons text-sm text-slate-400 mr-2">expand_more</span>
                                            BEBAN OPERASIONAL LAINNYA
                                        </div>
                                    </td>
                                    <td className="py-3 px-6 text-right font-bold text-slate-800 dark:text-slate-200 pt-6 text-red-600 dark:text-red-400">- {formatCurrency(financialData.opex.currentMonth)}</td>
                                    <td className="py-3 px-6 text-right font-bold text-slate-800 dark:text-slate-200 pt-6 text-red-600 dark:text-red-400">- {formatCurrency(financialData.opex.total)}</td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="py-2 px-6 text-slate-600 dark:text-slate-400 pl-10">Beban Umum & Administrasi Lapangan</td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.opex.currentMonth)}</td>
                                    <td className="py-2 px-6 text-right text-slate-500 dark:text-slate-400">- {formatCurrency(financialData.opex.total)}</td>
                                </tr>

                                {/* NET PROFIT Calculation */}
                                <tr className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-700 dark:to-slate-800 font-bold text-lg border-t-2 border-primary mt-4">
                                    <td className="py-6 px-6 text-slate-900 dark:text-white uppercase tracking-wide">LABA BERSIH SEBELUM PAJAK</td>
                                    <td className="py-6 px-6 text-right text-green-600 dark:text-green-500">{formatCurrency(financialData.netProfit.currentMonth)}</td>
                                    <td className="py-6 px-6 text-right text-green-600 dark:text-green-500">{formatCurrency(financialData.netProfit.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer of table */}
                <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-6 rounded-xl">
                    <span>Laporan dibuat otomatis oleh sistem PRO-FIN.</span>
                    <div className="flex gap-4">
                        <span>Terakhir diperbarui: Hari ini, 14:30 WIB</span>
                        <span>Oleh: Budi Santoso</span>
                    </div>
                </div>

                {/* Signature Section (Simulating Paper Document) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-sm text-slate-600 dark:text-slate-400 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center">
                        <p className="mb-16">Dibuat Oleh,</p>
                        <div className="h-px w-32 bg-slate-400 mb-2"></div>
                        <p className="font-bold">Project Admin</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="mb-16">Diperiksa Oleh,</p>
                        <div className="h-px w-32 bg-slate-400 mb-2"></div>
                        <p className="font-bold">Project Manager</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="mb-16">Disetujui Oleh,</p>
                        <div className="h-px w-32 bg-slate-400 mb-2"></div>
                        <p className="font-bold">Direktur Keuangan</p>
                    </div>
                </div>
            </div>
            <div className="h-10"></div> {/* Spacer */}
        </div>
    );
}
