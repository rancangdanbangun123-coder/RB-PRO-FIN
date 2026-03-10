import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import AddSupplyModal from '../components/AddSupplyModal';
import AddSubconModal from '../components/AddSubconModal';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Subkontraktor() {
    const { currentUser } = useAuth();
    const location = useLocation();
    const [subcons, setSubcons] = useState([]);
    const [selectedSubcon, setSelectedSubcon] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('catalog');
    const [transactions, setTransactions] = useState([]);
    const [projectsList, setProjectsList] = useState([]);

    const [subconListTab, setSubconListTab] = useState('directory');
    const [isAddSupplyModalOpen, setIsAddSupplyModalOpen] = useState(false);
    const [isAddSubconModalOpen, setIsAddSubconModalOpen] = useState(false);
    const [editingSupply, setEditingSupply] = useState(null);
    const [editingSubconData, setEditingSubconData] = useState(null);
    const [exclusions, setExclusions] = useState({});
    const [materialsList, setMaterialsList] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [subs, trxs, projs, mats] = await Promise.all([
                    api.subcontractors.list(),
                    api.transactions.list(),
                    api.projects.list(),
                    api.materials.list(),
                ]);
                setSubcons(subs || []);
                setTransactions(trxs || []);
                setProjectsList(projs || []);
                setMaterialsList(mats || []);
                if (subs && subs.length > 0) setSelectedSubcon(subs[0]);
            } catch (err) { console.error('Failed to load subcontractor data:', err); }
        })();
    }, []);

    const handleToggleStatus = (materialId) => {
        const currentExclusions = { ...exclusions };
        const subconList = currentExclusions[materialId] || [];

        if (subconList.includes(selectedSubcon.id)) {
            // Remove from exclusions (make active)
            currentExclusions[materialId] = subconList.filter(id => id !== selectedSubcon.id);
        } else {
            // Add to exclusions (make inactive)
            currentExclusions[materialId] = [...subconList, selectedSubcon.id];
        }

        setExclusions(currentExclusions);
        // Server-side exclusion persistence can be added here
    };

    const handleAddClick = () => {
        setEditingSubconData(null);
        setIsAddSubconModalOpen(true);
    };

    const handleAddSupplyClick = () => {
        setEditingSupply(null);
        setIsAddSupplyModalOpen(true);
    };

    const handleEditClick = (supply) => {
        setEditingSupply(supply);
        setIsAddSupplyModalOpen(true);
    };

    const handleEditProfile = () => {
        setEditingSubconData(selectedSubcon);
        setIsAddSubconModalOpen(true);
    };

    const handleSaveSubcon = (subconData) => {
        if (selectedSubcon && subconData.id === selectedSubcon.id) {
            // Edit existing
            const updatedSubcon = { ...selectedSubcon, ...subconData };
            const updatedList = subcons.map(s => s.id === updatedSubcon.id ? updatedSubcon : s);
            setSubcons(updatedList);
            setSelectedSubcon(updatedSubcon);
        } else {
            // Add new
            const currentYear = new Date().getFullYear();
            const sequenceStr = String(subcons.length + 1).padStart(3, '0');
            const newId = `SUB-${currentYear}-${sequenceStr}`;

            const newSubcon = {
                id: newId,
                ...subconData,
                status: 'Pending L1', // Approval Layer 1
                suppliedMaterials: subconData.initialMaterials || [],
                managers: [], // Initialize empty array to prevent crash
                history: [], // Initialize empty array
                totalSpend: 'Rp 0',
                rating: 0,
                logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(subconData.name)}&background=random`
            };
            const updatedList = [newSubcon, ...subcons];
            setSubcons(updatedList);

            // Set default status to 'Excluded' for all starter materials
            if (subconData.initialMaterials && subconData.initialMaterials.length > 0) {
                setExclusions(prev => {
                    const newExclusions = { ...prev };
                    subconData.initialMaterials.forEach(item => {
                        const matId = item.materialId;
                        if (!newExclusions[matId]) {
                            newExclusions[matId] = [];
                        }
                        // Add subcon ID to exclusion list if not already there
                        if (!newExclusions[matId].includes(newSubcon.id)) {
                            newExclusions[matId].push(newSubcon.id);
                        }
                    });
                    return newExclusions;
                });
            }

            setSubconListTab('registration'); // Switch to registration tab to see new item
            setSelectedSubcon(newSubcon);
        }
    };

    const handleApproveSubcon = (e, subconId, currentStatus) => {
        e.stopPropagation(); // Prevent row click

        // Update logic: Pending L1 -> Pending L2 -> Active
        let newStatus = currentStatus;
        if (currentStatus === 'Pending L1') newStatus = 'Pending L2';
        else if (currentStatus === 'Pending L2') newStatus = 'Active';

        const updatedList = subcons.map(s =>
            s.id === subconId ? { ...s, status: newStatus } : s
        );

        setSubcons(updatedList);

        // Update selected subcon if it's the one being approved
        if (selectedSubcon.id === subconId) {
            setSelectedSubcon({ ...selectedSubcon, status: newStatus });
        }
    };

    const handleRequestDelete = () => {
        if (!window.confirm('Apakah Anda yakin ingin mengajukan penghapusan subkontraktor ini? Status akan berubah menjadi "Pending Deletion" menunggu persetujuan.')) return;

        const updatedSubcon = { ...selectedSubcon, status: 'Pending Deletion', _previousStatus: selectedSubcon.status || 'Active' };
        const updatedList = subcons.map(s => s.id === selectedSubcon.id ? updatedSubcon : s);

        setSubcons(updatedList);
        setSelectedSubcon(updatedSubcon);
    };

    const handleConfirmDelete = () => {
        if (!window.confirm('PERINGATAN: Tindakan ini tidak dapat dibatalkan. Subkontraktor akan dihapus secara permanen. Lanjutkan?')) return;

        const updatedList = subcons.filter(s => s.id !== selectedSubcon.id);
        setSubcons(updatedList);

        // Select an appropriate fallback
        const currentActive = updatedList.filter(s => s.status === 'Active');
        if (currentActive.length > 0) {
            setSelectedSubcon(currentActive[0]);
            setSubconListTab('directory');
        } else {
            setSelectedSubcon(updatedList[0] || null);
        }
    };

    const handleCancelDelete = () => {
        const restoredStatus = selectedSubcon._previousStatus || 'Active';
        const updatedSubcon = { ...selectedSubcon, status: restoredStatus };
        const updatedList = subcons.map(s => s.id === selectedSubcon.id ? updatedSubcon : s);

        setSubcons(updatedList);
        setSelectedSubcon(updatedSubcon);
    };

    const filteredSubcons = subcons.filter(subcon => {
        if (subconListTab === 'directory') return subcon.status === 'Active';
        if (subconListTab === 'registration') return subcon.status !== 'Active' && subcon.status !== 'Pending Deletion';
        if (subconListTab === 'deletion') return subcon.status === 'Pending Deletion';
        return true;
    });

    const handleSaveSupply = (supplyData) => {
        console.log("handleSaveSupply called with:", supplyData);
        let updatedMaterials = [...(selectedSubcon.suppliedMaterials || [])];

        if (editingSupply) {
            // Update existing
            updatedMaterials = updatedMaterials.map(item =>
                item.materialId === supplyData.materialId ? { ...item, ...supplyData } : item
            );
        } else {
            // Add new - Add to TOP of list for better visibility
            updatedMaterials = [supplyData, ...updatedMaterials];
        }

        console.log("Updated materials list:", updatedMaterials);

        // Update local state
        const updatedSubcon = {
            ...selectedSubcon,
            suppliedMaterials: updatedMaterials
        };
        setSelectedSubcon(updatedSubcon);

        // Update main subcons list
        const updatedList = subcons.map(s =>
            s.id === selectedSubcon.id ? updatedSubcon : s
        );
        setSubcons(updatedList);
    };

    const handleDeleteSupply = (materialId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus material ini dari daftar?')) return;

        const updatedMaterials = selectedSubcon.suppliedMaterials.filter(item => item.materialId !== materialId);

        // Update local state
        const updatedSubcon = {
            ...selectedSubcon,
            suppliedMaterials: updatedMaterials
        };
        setSelectedSubcon(updatedSubcon);

        // Update main subcons list
        const updatedList = subcons.map(s =>
            s.id === selectedSubcon.id ? updatedSubcon : s
        );
        setSubcons(updatedList);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display h-screen flex overflow-hidden">
            <AddSubconModal
                key={editingSubconData ? `edit-${editingSubconData.id}` : `add-${Date.now()}`}
                isOpen={isAddSubconModalOpen}
                onClose={() => setIsAddSubconModalOpen(false)}
                onSave={handleSaveSubcon}
                initialData={editingSubconData}
            />
            <AddSupplyModal
                isOpen={isAddSupplyModalOpen}
                onClose={() => setIsAddSupplyModalOpen(false)}
                onSave={handleSaveSupply}
                initialData={editingSupply}
            />
            <Sidebar activePage="subkontraktor" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Subkontraktor</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-card-dark transition-colors relative">
                            <span className="material-icons-round text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar">
                    {/* Controls Section */}
                    {/* Top Section: Cost Summary */}
                    <section className="shrink-0 flex flex-col gap-3 h-80">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons text-primary text-sm">analytics</span>
                                Ringkasan Biaya
                            </h2>
                            <div className="flex items-center gap-2">
                                <select className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm">
                                    <option>Tahun 2026</option>
                                    <option>Tahun 2025</option>
                                </select>
                                <button className="text-xs bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-sm font-medium">
                                    Export CSV
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm">
                            <div className="overflow-auto flex-1 custom-scrollbar">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Nama User</th>
                                            <th className="px-4 py-3 font-medium text-right">Total Kontrak</th>
                                            <th className="px-4 py-3 font-medium text-right">Terbayar (YTD)</th>
                                            <th className="px-4 py-3 font-medium text-right">Sisa Tagihan</th>
                                            <th className="px-4 py-3 font-medium text-center">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                                        {(() => {
                                            const outTrxs = transactions.filter(t => t.type === 'out' && t.payee);
                                            const pmGroups = {};

                                            // Determine valid subcon names from our db to filter out random transactions
                                            const validSubconNames = subcons.map(s => s.name?.toLowerCase());

                                            outTrxs.forEach(t => {
                                                const pm = t.createdBy || 'Sistem';
                                                const subconName = t.payee;

                                                // Only include if the payee is actually a recognized subcon
                                                if (!validSubconNames.includes(subconName.toLowerCase())) return;

                                                if (!pmGroups[pm]) pmGroups[pm] = {};
                                                if (!pmGroups[pm][subconName]) {
                                                    const matchedSubcon = subcons.find(s => s.name?.toLowerCase() === subconName.toLowerCase());

                                                    // Fallback mock contract values to keep UI looking good for demo purposes
                                                    let totalKontrakMock = 50000000;
                                                    if (matchedSubcon?.name === 'PT Beton Jaya Abadi') totalKontrakMock = 1250000000;
                                                    else if (matchedSubcon?.name === 'CV Baja Makmur') totalKontrakMock = 450000000;
                                                    else if (matchedSubcon?.name === 'PT Semen Nusantara') totalKontrakMock = 2800000000;
                                                    else if (matchedSubcon?.name === 'CV Elektrikal Prima') totalKontrakMock = 320000000;

                                                    pmGroups[pm][subconName] = {
                                                        subcon: matchedSubcon,
                                                        subconName: matchedSubcon ? matchedSubcon.name : subconName,
                                                        terbayar: 0,
                                                        totalKontrak: totalKontrakMock,
                                                        projectIds: new Set()
                                                    };
                                                }
                                                pmGroups[pm][subconName].terbayar += t.amount;
                                                if (t.projectId && t.projectId !== 'all') {
                                                    pmGroups[pm][subconName].projectIds.add(t.projectId);
                                                }
                                            });

                                            if (Object.keys(pmGroups).length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic">
                                                            Belum ada data transaksi subkontraktor yang tercatat.
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return Object.entries(pmGroups).map(([pm, subconsMap]) => (
                                                <React.Fragment key={pm}>
                                                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                                        <td className="px-4 py-2 font-semibold text-primary text-xs tracking-wide" colSpan="5">
                                                            <span className="material-icons text-xs align-middle mr-1">person</span> {pm}
                                                        </td>
                                                    </tr>
                                                    {Object.values(subconsMap).map(data => {
                                                        const totalKontrak = Math.max(data.totalKontrak, data.terbayar);
                                                        const sisa = totalKontrak - data.terbayar;
                                                        const progress = totalKontrak > 0 ? Math.round((data.terbayar / totalKontrak) * 100) : 0;

                                                        const isSelected = selectedSubcon?.name?.toLowerCase() === data.subconName.toLowerCase();

                                                        return (
                                                            <tr
                                                                key={`${pm}-${data.subconName}`}
                                                                onClick={() => data.subcon && setSelectedSubcon(data.subcon)}
                                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-transparent'}`}
                                                            >
                                                                <td className="px-4 py-2 pl-8">
                                                                    <div className="font-medium truncate max-w-[200px] text-slate-900 dark:text-white" title={data.subconName}>
                                                                        {data.subconName}
                                                                    </div>
                                                                    {data.projectIds.size > 0 && (
                                                                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={Array.from(data.projectIds).map(id => PROJECT_DATA.find(p => p.id === id)?.name || id).join(', ')}>
                                                                            Proyek: {Array.from(data.projectIds).map(id => PROJECT_DATA.find(p => p.id === id)?.name || id).join(', ')}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-right font-medium text-xs text-slate-900 dark:text-slate-200">
                                                                    Rp {totalKontrak.toLocaleString('id-ID')}
                                                                </td>
                                                                <td className="px-4 py-2 text-right font-medium text-xs text-green-600 dark:text-green-400">
                                                                    Rp {data.terbayar.toLocaleString('id-ID')}
                                                                </td>
                                                                <td className="px-4 py-2 text-right font-medium text-xs text-amber-600 dark:text-amber-400">
                                                                    Rp {sisa.toLocaleString('id-ID')}
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 flex overflow-hidden">
                                                                        <div className={`${progress >= 100 ? 'bg-blue-500' : 'bg-green-500'} h-1.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <div className="flex-1 flex flex-col md:flex-row gap-6">
                        {/* Left Column: Subcon List (Fixed Width) */}
                        <section className="w-full md:w-80 lg:w-1/3 flex-none flex flex-col gap-3">
                            <div className="flex items-center justify-between shrink-0">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daftar Subkontraktor</h2>
                                <button onClick={handleAddClick} className="bg-primary hover:bg-primary-hover text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm shadow-primary/20">
                                    <span className="material-icons text-sm">add</span> Tambah
                                </button>
                            </div>
                            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col h-[600px] shadow-sm overflow-hidden">
                                <div className="px-3 pt-3 flex items-center gap-2">
                                    <button
                                        onClick={() => setSubconListTab('directory')}
                                        className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${subconListTab === 'directory' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                                    >
                                        Direktori
                                    </button>
                                    <button
                                        onClick={() => setSubconListTab('registration')}
                                        className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors relative ${subconListTab === 'registration' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                                    >
                                        Registrasi
                                        {subcons.filter(s => s.status !== 'Active' && s.status !== 'Pending Deletion').length > 0 && (
                                            <span className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSubconListTab('deletion')}
                                        className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${subconListTab === 'deletion' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
                                    >
                                        Penghapusan
                                        {subcons.filter(s => s.status === 'Pending Deletion').length > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">{subcons.filter(s => s.status === 'Pending Deletion').length}</span>
                                        )}
                                    </button>
                                </div>
                                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="material-icons absolute left-2.5 top-2 text-slate-400 text-sm">search</span>
                                        <input
                                            className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-900 dark:text-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder-slate-400"
                                            placeholder="Cari nama subcon..."
                                            type="text"
                                        />
                                    </div>
                                    <button className="px-3 py-1.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary transition-colors">
                                        <span className="material-icons text-sm">filter_list</span>
                                    </button>
                                </div>
                                <div className="overflow-auto flex-1 custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Nama Perusahaan</th>
                                                <th className="px-4 py-3 font-medium">Tipe</th>
                                                <th className="px-4 py-3 font-medium text-center">{subconListTab === 'registration' ? 'Approval' : 'Rating'}</th>
                                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                                {subconListTab === 'registration' && <th className="px-4 py-3 font-medium text-right">Aksi</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredSubcons.map((subcon) => (
                                                <tr
                                                    key={subcon.id}
                                                    onClick={() => setSelectedSubcon(subcon)}
                                                    className={`cursor-pointer transition-colors ${selectedSubcon?.id === subcon.id ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-transparent'}`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className={`font-medium ${selectedSubcon?.id === subcon.id ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>{subcon.name}</div>
                                                        <div className="text-xs text-slate-500">ID: {subcon.id}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{subcon.type}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {subconListTab === 'registration' ? (
                                                            <div className="text-xs font-semibold text-slate-500">
                                                                {subcon.status === 'Pending L1' ? 'Tahap 1' : 'Tahap 2'}
                                                            </div>
                                                        ) : (
                                                            <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subcon.rating >= 4 ? 'bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-400/20' : subcon.rating >= 3 ? 'bg-yellow-50 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-400/20' : 'bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-400/20'}`}>
                                                                <span className="material-icons text-[10px] mr-1">star</span> {subcon.rating}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${subcon.status === 'Active' ? 'bg-green-100 dark:bg-green-400/10 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400'}`}>
                                                            {subcon.status === 'Active' ? 'Active' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    {subconListTab === 'registration' && (
                                                        <td className="px-4 py-3 text-right">
                                                            {['Admin', 'Project Manager', 'Finance'].includes(currentUser?.role) && (
                                                                <button
                                                                    onClick={(e) => handleApproveSubcon(e, subcon.id, subcon.status)}
                                                                    className="text-white bg-primary hover:bg-primary-hover px-3 py-1 rounded text-xs transition-colors shadow-sm"
                                                                >
                                                                    {subcon.status === 'Pending L1' ? 'Approve L1' : 'Approve L2'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                                    <span>Menampilkan 1-5 dari 42 subcon</span>
                                    <div className="flex gap-1">
                                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"><span className="material-icons text-sm">chevron_left</span></button>
                                        <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"><span className="material-icons text-sm">chevron_right</span></button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Right Column: Subcon Detail */}
                        {/* Right Column: Subcon Detail (Flexible Width) */}
                        <section className="flex-1 flex flex-col gap-3 min-w-0">
                            <div className="flex items-center justify-between shrink-0">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detail Subkontraktor</h2>
                                <div className="flex gap-2">
                                    {selectedSubcon?.status === 'Pending Deletion' ? (
                                        <>
                                            {currentUser?.role === 'Admin' && (
                                                <>
                                                    <button onClick={handleCancelDelete} className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm">
                                                        <span className="material-icons text-sm">undo</span> Batal Hapus
                                                    </button>
                                                    <button onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm">
                                                        <span className="material-icons text-sm">delete_forever</span> Konfirmasi Hapus
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={handleEditProfile} className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm">
                                                <span className="material-icons text-sm">edit</span> Edit Profil
                                            </button>
                                            <button className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm">
                                                <span className="material-icons text-sm">print</span> Cetak
                                            </button>
                                            {currentUser?.role === 'Admin' && (
                                                <button onClick={handleRequestDelete} className="bg-white dark:bg-surface-dark hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm">
                                                    <span className="material-icons text-sm">delete</span> Hapus
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            {selectedSubcon ? (
                                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-lg relative">
                                    {/* Profile Header */}
                                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-surface-dark dark:to-surface-dark flex gap-5 items-start">
                                        <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-800 p-1 shrink-0 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                            <img alt="Logo Perusahaan" className="w-full h-full object-cover rounded" src={selectedSubcon.logo} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedSubcon.name}</h3>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${(selectedSubcon.status || 'Active') === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50' :
                                                            (selectedSubcon.status || 'Active') === 'Inactive' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900/50' :
                                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                                                            }`}>
                                                            {selectedSubcon.status || 'Active'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedSubcon.address}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-500 uppercase tracking-wider">Total Belanja (All Time)</div>
                                                    <div className="text-xl font-mono font-bold text-primary">{selectedSubcon.totalSpend}</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 text-sm text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons text-slate-400 text-sm">person</span>
                                                    <span>PIC: {selectedSubcon.pic}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons text-slate-400 text-sm">phone</span>
                                                    <span>{selectedSubcon.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons text-slate-400 text-sm">email</span>
                                                    <span>{selectedSubcon.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 p-4">
                                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                            <span className="material-icons text-sm">pie_chart</span>
                                            Ringkasan Transaksi per User
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {(() => {
                                                if (!selectedSubcon) return null;
                                                // Filter transactions where payee matches the subcon name
                                                const subconTrxs = transactions.filter(t => t.payee?.toLowerCase() === selectedSubcon.name.toLowerCase() && t.type === 'out');

                                                if (subconTrxs.length === 0) {
                                                    return (
                                                        <div className="col-span-3 text-center py-4 text-slate-500 dark:text-slate-400 text-sm italic">
                                                            Belum ada transaksi dengan User manapun.
                                                        </div>
                                                    );
                                                }

                                                // Group by PM
                                                const pmStats = {};
                                                let totalSubconSpend = 0;
                                                subconTrxs.forEach(t => {
                                                    const pmName = t.createdBy || 'Sistem';
                                                    if (!pmStats[pmName]) pmStats[pmName] = 0;
                                                    pmStats[pmName] += t.amount || 0;
                                                    totalSubconSpend += t.amount || 0;
                                                });

                                                // Convert to array and sort by amount desc
                                                const pmArray = Object.entries(pmStats)
                                                    .map(([name, amount], index) => {
                                                        const isTop = amount === Math.max(...Object.values(pmStats));
                                                        const percent = totalSubconSpend > 0 ? Math.round((amount / totalSubconSpend) * 100) : 0;
                                                        const colors = ['primary', 'green-500', 'orange-500', 'purple-500', 'teal-500'];

                                                        return {
                                                            name,
                                                            amount,
                                                            volume: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount),
                                                            percent,
                                                            isTop,
                                                            color: colors[index % colors.length]
                                                        };
                                                    })
                                                    .sort((a, b) => b.amount - a.amount);

                                                return pmArray.map((mgr, index) => (
                                                    <div key={index} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 rounded-lg p-3 flex flex-col shadow-sm">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{mgr.name}</span>
                                                            {mgr.isTop && (
                                                                <span className="text-[10px] text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-1.5 py-0.5 rounded border border-green-200 dark:border-green-900/30">Top User</span>
                                                            )}
                                                        </div>
                                                        <div className="mt-auto">
                                                            <div className="text-xs text-slate-500">Total Volume</div>
                                                            <div className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{mgr.volume}</div>
                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 mt-2 rounded-full overflow-hidden flex">
                                                                <div className={`bg-${mgr.color} h-full`} style={{ width: `${mgr.percent}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-x-auto">
                                        <button
                                            onClick={() => setActiveTab('catalog')}
                                            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'catalog' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        >
                                            Katalog Material & Harga
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('history')}
                                            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        >
                                            Histori Pesanan
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('legal')}
                                            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'legal' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        >
                                            Dokumen Legal
                                        </button>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-0 bg-slate-50/30 dark:bg-background-dark/50">
                                        <div className="p-4 flex flex-col gap-8">
                                            <div>
                                                {/* Catalog Material Table */}
                                                {activeTab === 'catalog' && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide text-xs flex items-center gap-2">
                                                                <span className="material-icons-round text-sm text-primary">inventory_2</span>
                                                                Katalog Material & Harga
                                                            </h4>
                                                            <button
                                                                onClick={handleAddSupplyClick}
                                                                className="text-xs flex items-center gap-1 text-primary hover:text-primary-hover font-medium bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                                                            >
                                                                <span className="material-icons-round text-[16px]">add</span>
                                                                Tambah Material
                                                            </button>
                                                        </div>

                                                        {selectedSubcon.suppliedMaterials && selectedSubcon.suppliedMaterials.length > 0 ? (
                                                            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                                                                <table className="w-full text-sm text-left">
                                                                    <thead className="bg-slate-50 dark:bg-surface-lighter text-xs text-slate-500 dark:text-slate-400 uppercase">
                                                                        <tr>
                                                                            <th className="px-4 py-3 font-medium">Item Material</th>
                                                                            <th className="px-4 py-3 font-medium text-center">Satuan</th>
                                                                            <th className="px-4 py-3 font-medium text-right">Harga Kontrak</th>
                                                                            <th className="px-4 py-3 font-medium text-center">Status</th>
                                                                            <th className="px-4 py-3 font-medium text-center">Aksi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-card-dark">
                                                                        {selectedSubcon.suppliedMaterials.map((supply, idx) => {
                                                                            const material = materialsList.find(m => m.id === supply.materialId);
                                                                            if (!material) return null;

                                                                            // Check exclusion status from state
                                                                            const isExcluded = exclusions[material.id]?.includes(selectedSubcon.id);
                                                                            const isActive = !isExcluded;

                                                                            return (
                                                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                                                    <td className="px-4 py-3">
                                                                                        <div className="font-medium text-slate-900 dark:text-white">{material.name}</div>
                                                                                        <div className="text-xs text-slate-500 font-mono">{material.id}</div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 text-xs">{material.unit}</td>
                                                                                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-900 dark:text-white">
                                                                                        Rp {supply.price.toLocaleString('id-ID')}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center">
                                                                                        <button
                                                                                            onClick={() => handleToggleStatus(material.id)}
                                                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all hover:shadow-sm ${isActive
                                                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                                                }`}
                                                                                            title={isActive ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                                                                                        >
                                                                                            <span className="material-icons-round text-[10px]">{isActive ? 'check_circle' : 'cancel'}</span>
                                                                                            {isActive ? 'Terpilih' : 'Excluded'}
                                                                                        </button>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 text-center">
                                                                                        <div className="flex items-center justify-center gap-1">
                                                                                            <button
                                                                                                onClick={() => handleEditClick(supply)}
                                                                                                className="p-1 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                                                                                title="Edit Harga"
                                                                                            >
                                                                                                <span className="material-icons-round text-[18px]">edit</span>
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleDeleteSupply(supply.materialId)}
                                                                                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                                                title="Hapus Material"
                                                                                            >
                                                                                                <span className="material-icons-round text-[18px]">delete</span>
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-sm">
                                                                Belum ada data yang disuplai.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {/* History */}
                                            {activeTab === 'history' && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wide text-xs">Riwayat Proyek & Pembayaran</h4>
                                                    <div className="relative pl-4 border-l border-slate-300 dark:border-slate-700 space-y-6">
                                                        {(() => {
                                                            const historyTrxs = transactions.filter(t => t.payee?.toLowerCase() === selectedSubcon.name.toLowerCase());

                                                            if (historyTrxs.length === 0) {
                                                                return (
                                                                    <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-sm mt-4">
                                                                        Belum ada riwayat transaksi.
                                                                    </div>
                                                                );
                                                            }

                                                            return historyTrxs.slice().reverse().map((t, index) => {
                                                                const projectName = t.projectId && t.projectId !== 'all' ? (PROJECT_DATA.find(p => p.id === t.projectId)?.name || t.projectId) : 'Sistem / Multi Proyek';

                                                                return (
                                                                    <div key={t.id || index} className="relative">
                                                                        <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 ${index === 0 ? 'border-primary' : 'border-slate-400 dark:border-slate-600'} bg-white dark:bg-background-dark`}></div>
                                                                        <div className={`bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-lg p-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm ${index > 0 ? 'opacity-80' : ''}`}>
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div>
                                                                                    <div className="font-medium text-slate-900 dark:text-white text-sm">{projectName}</div>
                                                                                    <div className="text-xs text-slate-500 mt-0.5">{t.title} • {t.date}</div>
                                                                                </div>
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${t.type === 'in' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                                                    {t.type === 'in' ? 'Masuk' : 'Keluar'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-2">
                                                                                <div className="text-xs text-slate-500 dark:text-slate-400 w-2/3 truncate">User: {t.createdBy || 'Sistem'} | Kas: {t.account}</div>
                                                                                <div className={`font-mono text-sm font-semibold ${t.type === 'in' ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                                                    {t.type === 'in' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(t.amount)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Legal Documents Placeholder */}
                                            {activeTab === 'legal' && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                                        <span className="material-icons-round text-slate-400 text-3xl">folder_off</span>
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Belum ada dokumen legal</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                                                        Dokumen legal seperti SIUP, NPWP, dan Kontrak belum diunggah untuk subkontraktor ini.
                                                    </p>
                                                    <button className="mt-4 px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                                                        Upload Dokumen
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-12 shadow-sm relative h-full mt-4">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <span className="material-icons-round text-slate-400 text-3xl">domain_disabled</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pilih Subkontraktor</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs text-center">
                                        Silakan pilih subkontraktor dari daftar di sebelah kiri untuk melihat detail.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            <AddSupplyModal
                isOpen={isAddSupplyModalOpen}
                onClose={() => setIsAddSupplyModalOpen(false)}
                onSave={handleSaveSupply}
                existingMaterialIds={selectedSubcon?.suppliedMaterials?.map(m => m.materialId) || []}
                initialData={editingSupply}
            />
        </div>
    );
}
