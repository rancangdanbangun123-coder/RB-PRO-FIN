import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LaporanKeuangan from '../components/LaporanKeuangan';
import LaporanProyek from '../components/LaporanProyek';
import { projects as PROJECT_DATA } from '../data/projectData';
import Sidebar from '../components/Sidebar';

export default function Laporan() {
    const [activeTab, setActiveTab] = useState('keuangan');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Global Project State
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

    const selectedProjectName = useMemo(() => {
        if (selectedProjectId === 'all') return 'Semua Proyek';
        const project = PROJECT_DATA.find(p => p.id === selectedProjectId);
        return project ? project.name : 'Proyek Tidak Ditemukan';
    }, [selectedProjectId]);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased h-screen flex overflow-hidden">
            <Sidebar activePage="laporan" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />{/* Overlay for mobile sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-slate-500 hover:text-primary"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Laporan & Analisis</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Global Project Dropdown */}
                        <div className="relative group hidden sm:block">
                            <button
                                onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors min-w-[200px] justify-between"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <span className={`w-2 h-2 rounded-full ${selectedProjectId === 'all' ? 'bg-slate-400' : 'bg-green-500'}`}></span>
                                    <span className="truncate max-w-[150px]">{selectedProjectName}</span>
                                </div>
                                <span className="material-icons text-sm ml-1 text-slate-400">expand_more</span>
                            </button>

                            {isProjectMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProjectMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 max-h-96 overflow-y-auto custom-scrollbar">
                                        <button
                                            onClick={() => {
                                                setSelectedProjectId('all');
                                                setIsProjectMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${selectedProjectId === 'all' ? 'text-primary font-medium bg-slate-50 dark:bg-slate-700/50' : 'text-slate-600 dark:text-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                <span>Semua Proyek</span>
                                            </div>
                                            {selectedProjectId === 'all' && <span className="material-icons-round text-sm">check</span>}
                                        </button>

                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>

                                        {PROJECT_DATA.map((project) => (
                                            <button
                                                key={project.id}
                                                onClick={() => {
                                                    setSelectedProjectId(project.id);
                                                    setIsProjectMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${project.id === selectedProjectId ? 'text-primary font-medium bg-slate-50 dark:bg-slate-700/50' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                                                    <span className="truncate">{project.name}</span>
                                                </div>
                                                {project.id === selectedProjectId && <span className="material-icons-round text-sm">check</span>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                        <button className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-card-dark transition-colors relative">
                            <span className="material-icons-round text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark px-6 flex gap-6 sticky top-16 z-10">
                    <button
                        onClick={() => setActiveTab('keuangan')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'keuangan'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        <span className="material-icons-round text-lg">analytics</span>
                        Laporan Keuangan
                    </button>
                    <button
                        onClick={() => setActiveTab('proyek')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'proyek'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        <span className="material-icons-round text-lg">inventory_2</span>
                        Laporan Proyek
                    </button>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {activeTab === 'keuangan' && <LaporanKeuangan selectedProjectId={selectedProjectId} />}
                    {activeTab === 'proyek' && <LaporanProyek selectedProjectId={selectedProjectId} />}
                </div>
            </main>
        </div>
    );
}
