import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CreateProjectModal from '../components/CreateProjectModal';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { projects as PROJECT_DATA } from '../data/projectData';

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { currentUser, hasPermission } = useAuth();

    const [localProjects, setLocalProjects] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('projects');
        if (saved) {
            setLocalProjects(JSON.parse(saved));
        } else {
            setLocalProjects(PROJECT_DATA);
        }
    }, []);

    // Helper: parse IDR currency string to number
    const parseCurrency = (str) => {
        if (!str) return 0;
        return Number(String(str).replace(/[^0-9-]/g, '')) || 0;
    };

    const formatShort = (val) => {
        if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
        if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    // Enrich projects with real progress & value from localStorage
    const enrichedProjects = useMemo(() => {
        return localProjects.map(p => {
            const savedProgress = localStorage.getItem(`project_progress_${p.id}`);
            const realProgress = savedProgress !== null ? Number(savedProgress) : p.progress;

            const savedBudgets = JSON.parse(localStorage.getItem(`budgetItems_${p.id}`)) || [];
            const realValue = savedBudgets.length > 0
                ? savedBudgets.reduce((sum, item) => sum + parseCurrency(item.totalBudget), 0)
                : (p.value || p.budget || 0);

            return { ...p, progress: realProgress, value: realValue };
        });
    }, [localProjects]);

    // Filter projects by user role
    const userProjects = hasPermission('view_all_projects')
        ? enrichedProjects
        : enrichedProjects.filter(p => p.pm === currentUser?.name);

    // Compute real KPI values
    const { totalActiveProjects, totalPengeluaran, totalProyekWarning } = useMemo(() => {
        const active = userProjects.filter(p => p.status !== 'Completed').length;

        const allTrxs = JSON.parse(localStorage.getItem('transactions')) || [];
        const userProjectIds = userProjects.map(p => p.id);
        const relevantTrxs = allTrxs.filter(t => userProjectIds.includes(t.projectId));
        const pengeluaran = relevantTrxs.filter(t => t.type === 'out').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const warning = userProjects.filter(p => p.health === 'Warning' || p.health === 'Critical').length;

        return {
            totalActiveProjects: active,
            totalPengeluaran: pengeluaran,
            totalProyekWarning: warning
        };
    }, [userProjects]);

    const handleProjectClick = (projectId) => {
        navigate(`/project/${projectId}`);
    };

    const [isProjectsExpanded, setIsProjectsExpanded] = useState(false);

    const visibleProjects = searchQuery
        ? userProjects.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : userProjects;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-display antialiased h-screen flex overflow-hidden">
            <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <Sidebar activePage="dashboard" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <span className="material-icons-round text-[22px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-card-dark"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-scroll p-4 sm:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Card 1 */}
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-border-dark flex flex-col justify-between h-32 relative overflow-hidden group hover:border-primary/50 transition-all">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Proyek Aktif</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalActiveProjects}</h3>
                                </div>
                                <div className="flex items-center text-xs text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit mt-2">
                                    <span className="material-icons-round text-[14px] mr-1">trending_up</span>
                                    <span>+2 bulan ini</span>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-icons-round text-[80px] text-primary">apartment</span>
                                </div>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-border-dark flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-500/50 transition-all">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pengeluaran</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatShort(totalPengeluaran)}</h3>
                                </div>
                                <div className="flex items-center text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded w-fit mt-2">
                                    <span className="material-icons-round text-[14px] mr-1">trending_up</span>
                                    <span>+15% vs bulan lalu</span>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-icons-round text-[80px] text-blue-500">payments</span>
                                </div>
                            </div>
                            {/* Card 3 */}
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-border-dark flex flex-col justify-between h-32 relative overflow-hidden group hover:border-orange-500/50 transition-all">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tagihan Pending</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalProyekWarning}</h3>
                                </div>
                                <div className="flex items-center text-xs text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded w-fit mt-2">
                                    <span className="material-icons-round text-[14px] mr-1">warning</span>
                                    <span>Segera jatuh tempo</span>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-icons-round text-[80px] text-orange-500">receipt_long</span>
                                </div>
                            </div>
                            {/* Card 4 */}
                            <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-border-dark flex flex-col justify-between h-32 relative overflow-hidden group hover:border-purple-500/50 transition-all">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">SDM Aktif</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{userProjects.length}</h3>
                                </div>
                                <div className="flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded w-fit mt-2">
                                    <span className="material-icons-round text-[14px] mr-1">groups</span>
                                    <span>Di 3 lokasi berbeda</span>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-icons-round text-[80px] text-purple-500">engineering</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Projects Table */}
                        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark overflow-hidden">
                            <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between gap-4 flex-wrap">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Proyek Berjalan</h2>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                        <input
                                            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none w-full md:w-64 placeholder-slate-400"
                                            placeholder="Cari proyek..."
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                                    >
                                        <span className="material-icons-round text-[18px]">add</span>
                                        Proyek Baru
                                    </button>
                                </div>
                            </div>
                            {/* Table */}
                            <div className={`overflow-x-auto overflow-y-hidden transition-all duration-500 ease-in-out ${isProjectsExpanded ? 'max-h-[1000px]' : 'max-h-[280px]'}`}>
                                <table className="w-full text-left text-sm table-fixed">
                                    <thead className="bg-slate-50 dark:bg-surface-hover/50 text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 w-48">Nama Proyek</th>
                                            <th className="px-6 py-4 w-40">Lokasi</th>
                                            <th className="px-6 py-4 w-40">Klien</th>
                                            <th className="px-6 py-4 w-44">Project Manager</th>
                                            <th className="px-6 py-4 text-center w-32">Progress</th>
                                            <th className="px-6 py-4 w-36">Status</th>
                                            <th className="px-6 py-4 text-right w-16">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                        {visibleProjects.map((project) => {
                                            // derive display properties
                                            const pmName = project.pm || 'Unknown';
                                            const pmInitials = pmName.charAt(0);
                                            // simple hash for color
                                            const colors = ['blue', 'purple', 'orange', 'teal', 'green'];
                                            const pmColor = colors[pmName.length % colors.length];

                                            return (
                                                <tr key={project.id} onClick={() => handleProjectClick(project.id)} className="hover:bg-slate-50 dark:hover:bg-surface-hover/30 transition-colors cursor-pointer">
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white truncate">{project.name}</td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap">
                                                        <span className="material-icons-round text-[16px] text-slate-400">place</span>
                                                        {project.location}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 truncate">{project.client}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 rounded-full bg-${pmColor}-100 dark:bg-${pmColor}-900/30 flex items-center justify-center text-[10px] font-bold text-${pmColor}-600 dark:text-${pmColor}-400 flex-shrink-0`}>
                                                                {pmInitials}
                                                            </div>
                                                            <span className="text-slate-600 dark:text-slate-300 truncate">{pmName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                                                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{project.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                                project.status === 'BAST-1' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                                    project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                                                        project.status === 'Maintenance' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                                            'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300'}`}>
                                                            {project.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                            <span className="material-icons-round text-[20px]">more_horiz</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {/* Table Footer */}
                            <div className="p-4 border-t border-slate-200 dark:border-border-dark flex justify-center">
                                <button
                                    onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                                    className="text-sm font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
                                >
                                    {isProjectsExpanded ? 'Tutup Daftar Proyek' : 'Lihat Semua Proyek'}
                                    <span className="material-icons-round text-[16px]">
                                        {isProjectsExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>
                            </div>
                        </div>


                    </div>
                </div>
            </main>
        </div>
    );
}
