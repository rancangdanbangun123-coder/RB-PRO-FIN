import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projectData';
import CreateProjectModal from '../components/CreateProjectModal';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [statusFilter, setStatusFilter] = useState('Semua');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [localProjects, setLocalProjects] = useState([]);

    useEffect(() => {
        const loadProjects = () => {
            const saved = localStorage.getItem('projects');
            if (saved) {
                setLocalProjects(JSON.parse(saved));
            } else {
                localStorage.setItem('projects', JSON.stringify(projects));
                setLocalProjects(projects);
            }
        };

        loadProjects();

        const handleUpdate = () => loadProjects();
        window.addEventListener('projectsUpdated', handleUpdate);
        return () => window.removeEventListener('projectsUpdated', handleUpdate);
    }, []);

    const { currentUser, hasPermission } = useAuth();

    // Helper: parse IDR currency string to number
    const parseCurrency = (str) => {
        if (!str) return 0;
        return Number(String(str).replace(/[^0-9-]/g, '')) || 0;
    };

    // Enrich projects with real progress & budget from localStorage
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

    const filteredProjects = userProjects.filter(p => {
        if (statusFilter === 'Semua') return true;
        if (statusFilter === 'Ongoing' && p.status === 'Ongoing') return true;
        if (statusFilter === 'BAST-1' && (p.status === 'BAST-1' || p.status === 'Persiapan')) return true;
        if (statusFilter === 'Maintenance' && p.status === 'Maintenance') return true;
        if (statusFilter === 'Completed' && p.status === 'Completed') return true;
        return false;
    });

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

    const formatShort = (val) => {
        if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
        if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
        return formatCurrency(val);
    };

    const totalActive = userProjects.filter(p => p.status !== 'Completed').length;
    const totalValue = userProjects.reduce((sum, p) => sum + (p.value || p.budget || 0), 0);
    const totalWarning = userProjects.filter(p => p.health === 'Warning' || p.health === 'Critical').length;

    return (
        <div className="bg-slate-50 dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display h-screen flex overflow-hidden">
            <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <Sidebar activePage="proyek" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Daftar Proyek</h1>
                    </div>
                </header>

                <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar">
                    {/* Stats Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-border-dark flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Total Proyek Aktif</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalActive}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <span className="material-icons-round text-2xl">domain</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-border-dark flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Nilai Kontrak Total</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatShort(totalValue)}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <span className="material-icons-round text-2xl">payments</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-border-dark flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Perlu Perhatian</p>
                                <h3 className="text-2xl font-bold text-orange-600">{totalWarning}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                <span className="material-icons-round text-2xl">warning_amber</span>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex bg-white dark:bg-card-dark p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {['Semua', 'Ongoing', 'BAST-1', 'Maintenance', 'Completed'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${statusFilter === filter
                                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <div className="flex bg-white dark:bg-card-dark p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-primary' : 'text-slate-400'}`}
                                >
                                    <span className="material-icons-round">grid_view</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-primary' : 'text-slate-400'}`}
                                >
                                    <span className="material-icons-round">view_list</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover shadow-lg shadow-primary/25 transition-all"
                            >
                                <span className="material-icons-round">add</span>
                                <span>Proyek Baru</span>
                            </button>
                        </div>
                    </div>

                    {/* Projects Grid/List */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <div key={project.id} className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                {project.name.slice(0, 3)}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                                                ${project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                                                    project.status === 'BAST-1' ? 'bg-yellow-100 text-yellow-700' :
                                                        project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            project.status === 'Maintenance' ? 'bg-purple-100 text-purple-700' :
                                                                project.status === 'Persiapan' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-green-100 text-green-700'}`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        <Link to={`/project/${project.id}`} className="block mb-1 text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                                            {project.name}
                                        </Link>
                                        <p className="text-sm text-slate-500 mb-4">{project.location}</p>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-500">Progress</span>
                                                    <span className="font-semibold text-slate-900 dark:text-white">{project.progress}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Nilai Kontrak</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{formatCurrency(project.value)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">PM</p>
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{project.pm}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                        <span className={`text-xs font-medium flex items-center gap-1 
                                            ${project.health === 'Good' || project.health === 'Excellent' ? 'text-green-600' : 'text-orange-500'}`}>
                                            <span className="material-icons-round text-[14px]">
                                                {project.health === 'Good' || project.health === 'Excellent' ? 'trending_up' : 'warning'}
                                            </span>
                                            Margin: {project.margin}%
                                        </span>
                                        <Link to={`/project/${project.id}`} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1 group/link">
                                            Detail
                                            <span className="material-icons-round text-[16px] group-hover/link:translate-x-0.5 transition-transform">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Project Name</th>
                                        <th className="px-6 py-3 font-medium">Client</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Value</th>
                                        <th className="px-6 py-3 font-medium">Progress</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                        {project.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{project.name}</div>
                                                        <div className="text-xs text-slate-500">{project.location}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{project.client}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold 
                                                    ${project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                                                        project.status === 'BAST-1' ? 'bg-yellow-100 text-yellow-700' :
                                                            project.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                project.status === 'Maintenance' ? 'bg-purple-100 text-purple-700' :
                                                                    project.status === 'Persiapan' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-green-100 text-green-700'}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{formatCurrency(project.value)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-slate-200 rounded-full h-1.5">
                                                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium">{project.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/project/${project.id}`} className="text-primary hover:text-primary-hover font-medium text-xs">
                                                    Open
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
