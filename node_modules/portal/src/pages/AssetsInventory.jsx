import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ASSET_DATABASE } from '../data/assetData';
import { ASSET_REQUESTS } from '../data/assetRequestData';
import EditAssetModal from '../components/EditAssetModal';
import RequestAssetModal from '../components/RequestAssetModal';
import AddAssetModal from '../components/AddAssetModal';
import Sidebar from '../components/Sidebar';
import SisaMaterialTab from '../components/SisaMaterialTab';

export default function AssetsInventory() {
    const [assets, setAssets] = useState(() => {
        const saved = localStorage.getItem('assets');
        return saved ? JSON.parse(saved) : ASSET_DATABASE;
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [requests, setRequests] = useState(() => {
        const saved = localStorage.getItem('assetRequests');
        return saved ? JSON.parse(saved) : ASSET_REQUESTS;
    });
    const [selectedAsset, setSelectedAsset] = useState(() => {
        const saved = localStorage.getItem('assets');
        const parsedAssets = saved ? JSON.parse(saved) : ASSET_DATABASE;
        return parsedAssets[0] || null;
    });
    const [selectedItems, setSelectedItems] = useState([]); // Bulk select state
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'requests'

    React.useEffect(() => {
        localStorage.setItem('assets', JSON.stringify(assets));
        // Also update selectedAsset if it's currently selected to reflect changes deeply
        if (selectedAsset) {
            const updatedSelected = assets.find(a => a.id === selectedAsset.id);
            if (updatedSelected) {
                setSelectedAsset(updatedSelected);
            }
        }
    }, [assets]);

    React.useEffect(() => {
        localStorage.setItem('assetRequests', JSON.stringify(requests));
    }, [requests]);

    // Derived state for pagination (mock)
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const itemsPerPage = 10;

    // Inventory Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = activeTab === 'inventory'
        ? assets.slice(indexOfFirstItem, indexOfLastItem)
        : activeTab === 'requests'
            ? requests.slice(indexOfFirstItem, indexOfLastItem)
            : [];

    // Request List Helpers
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'In Transit': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Deployed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'Completed': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveAsset = (updatedAssetData) => {
        const updatedAssets = assets.map(a =>
            a.id === selectedAsset.id ? { ...a, ...updatedAssetData } : a
        );
        setAssets(updatedAssets);
        setSelectedAsset({ ...selectedAsset, ...updatedAssetData });
    };

    const handleAddAsset = (newAssetData) => {
        const year = new Date().getFullYear();
        let newAssetsList = [];

        const instances = newAssetData.instances && newAssetData.instances.length > 0
            ? newAssetData.instances
            : [{ serialNumber: newAssetData.serialNumber || '', status: newAssetData.status || 'Tersedia' }];

        instances.forEach((inst, idx) => {
            const nextSequence = String(assets.length + newAssetsList.length + 1).padStart(3, '0');
            const newAssetId = `AST-${year}-${nextSequence}`;

            newAssetsList.push({
                ...newAssetData,
                id: newAssetId,
                serialNumber: inst.serialNumber,
                status: inst.status,
                qty: 1, // Enforce qty=1 for serialized assets
                instances: undefined, // remove temp array
                stockBreakdown: [], // reset breakdown for individual item
                image: '',
                detailImage: '',
                history: [
                    {
                        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                        event: 'Aset Baru Didaftarkan',
                        sub: `Kategori: ${newAssetData.category}`,
                        active: true
                    }
                ]
            });
        });

        setAssets([...newAssetsList, ...assets]);
    };

    const handleDeleteAsset = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan.')) {
            setAssets(assets.filter(a => a.id !== id));
            setSelectedAsset(null);
            setSelectedItems(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;
        if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} aset yang dipilih?`)) {
            setAssets(prev => prev.filter(item => !selectedItems.includes(item.id)));
            if (selectedAsset && selectedItems.includes(selectedAsset.id)) {
                setSelectedAsset(null);
            }
            setSelectedItems([]);
        }
    };

    const handleSaveRequest = (newRequestStub) => {
        const newRequest = {
            id: `REQ-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
            ...newRequestStub
        };
        setRequests([newRequest, ...requests]);
    };



    const handleUpdateStatus = (requestId, newStatus) => {
        const updatedRequests = requests.map(req => {
            if (req.id === requestId) {
                // Asset Sync Logic
                if (newStatus === 'Deployed' && req.status !== 'Deployed') {
                    // Move stock from Warehouse to Project
                    const assetIndex = assets.findIndex(a => a.id === req.assetId);
                    if (assetIndex !== -1) {
                        const asset = assets[assetIndex];
                        let newBreakdown = asset.stockBreakdown ? [...asset.stockBreakdown] : [
                            // If no breakdown, assume all are at default location
                            { status: asset.status, condition: asset.condition, location: asset.location, qty: asset.qty }
                        ];

                        // Deduct from Warehouse/Available
                        // Prioritize taking from 'Tersedia' atau 'Gudang Utama'
                        const sourceIdx = newBreakdown.findIndex(item => item.status === 'Tersedia' || item.location.includes('Gudang'));

                        if (sourceIdx !== -1) {
                            if (newBreakdown[sourceIdx].qty >= req.qty) {
                                newBreakdown[sourceIdx].qty -= req.qty;
                                // Remove if 0
                                if (newBreakdown[sourceIdx].qty === 0) newBreakdown.splice(sourceIdx, 1);

                                // Add to Project
                                const targetIdx = newBreakdown.findIndex(item => item.location === req.projectName && item.status === 'Digunakan');
                                if (targetIdx !== -1) {
                                    newBreakdown[targetIdx].qty += req.qty;
                                } else {
                                    newBreakdown.push({
                                        status: 'Digunakan',
                                        condition: 'Baik', // Assume good condition upon deployment
                                        location: req.projectName,
                                        qty: req.qty
                                    });
                                }

                                // Update Asset State
                                const updatedAssets = [...assets];
                                updatedAssets[assetIndex] = { ...asset, stockBreakdown: newBreakdown };
                                setAssets(updatedAssets);
                            } else {
                                alert(`Stok tidak mencukupi di Gudang! (Tersedia: ${newBreakdown[sourceIdx].qty}, Diminta: ${req.qty})`);
                                return req; // Cancel update
                            }
                        } else {
                            // Fallback if no source found (e.g. all deployed)
                            alert("Tidak ada stok tersedia/di gudang untuk dideploy!");
                            return req;
                        }
                    }
                } else if (newStatus === 'Completed' && req.status === 'Deployed') {
                    // Return stock from Project to Warehouse
                    const assetIndex = assets.findIndex(a => a.id === req.assetId);
                    if (assetIndex !== -1) {
                        const asset = assets[assetIndex];
                        if (asset.stockBreakdown) {
                            const newBreakdown = [...asset.stockBreakdown];
                            // Find stock at Project
                            const sourceIdx = newBreakdown.findIndex(item => item.location === req.projectName && item.status === 'Digunakan');

                            if (sourceIdx !== -1) {
                                if (newBreakdown[sourceIdx].qty >= req.qty) {
                                    newBreakdown[sourceIdx].qty -= req.qty;
                                    if (newBreakdown[sourceIdx].qty === 0) newBreakdown.splice(sourceIdx, 1);

                                    // Return to Warehouse
                                    const targetIdx = newBreakdown.findIndex(item => item.location === 'Gudang Utama' && item.status === 'Tersedia');
                                    if (targetIdx !== -1) {
                                        newBreakdown[targetIdx].qty += req.qty;
                                    } else {
                                        newBreakdown.push({
                                            status: 'Tersedia',
                                            condition: 'Baik', // Assume return is good for now
                                            location: 'Gudang Utama',
                                            qty: req.qty
                                        });
                                    }

                                    // Update Asset State
                                    const updatedAssets = [...assets];
                                    updatedAssets[assetIndex] = { ...asset, stockBreakdown: newBreakdown };
                                    setAssets(updatedAssets);
                                }
                            }
                        }
                    }
                }

                return {
                    ...req,
                    status: newStatus,
                    history: [
                        {
                            status: newStatus,
                            date: new Date().toLocaleString(),
                            actor: 'Current User', // Mock
                            note: `Status updated to ${newStatus}`
                        },
                        ...req.history
                    ]
                };
            }
            return req;
        });
        setRequests(updatedRequests);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display antialiased h-screen flex overflow-hidden">
            <Sidebar activePage="assets" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />{/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Bar */}
                {/* Top Bar */}
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button className="md:hidden flex-shrink-0 text-slate-500 hover:text-primary p-1" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">Database Aset Inventaris</h1>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                        <div className="relative flex-1 max-w-sm ml-2">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <span className="material-icons-round text-[20px]">search</span>
                            </span>
                            <input
                                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-border-dark rounded-lg leading-5 bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition duration-150 ease-in-out"
                                placeholder="Cari aset..."
                                type="text"
                            />
                        </div>
                        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none flex-shrink-0">
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-surface-dark"></span>
                            <span className="material-icons-round">notifications</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Inventory List */}
                    <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-border-dark">
                        {/* Toolbar */}
                        <div className="p-4 md:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-border-dark bg-white/50 dark:bg-surface-dark/50 backdrop-blur-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 w-full xl:w-auto overflow-hidden">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-border-dark transition-colors whitespace-nowrap">
                                        <span className="material-icons-round text-lg">filter_list</span>
                                        Filter
                                    </button>
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-border-dark transition-colors whitespace-nowrap">
                                        <span className="material-icons-round text-lg">sort</span>
                                        Urutkan
                                    </button>
                                </div>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg w-full sm:w-auto overflow-x-auto custom-scrollbar">
                                    <button
                                        onClick={() => { setActiveTab('inventory'); setSelectedAsset(null); setSelectedItems([]); }}
                                        className={`px-3 md:px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all flex-1 sm:flex-none ${activeTab === 'inventory' ? 'bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Daftar Aset
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('requests'); setSelectedAsset(null); setSelectedItems([]); }}
                                        className={`px-3 md:px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all flex-1 sm:flex-none ${activeTab === 'requests' ? 'bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Riwayat & Pengajuan
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('sisa'); setSelectedAsset(null); setSelectedItems([]); }}
                                        className={`px-3 md:px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all flex-1 sm:flex-none ${activeTab === 'sisa' ? 'bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                                    >
                                        Daftar Material
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full xl:w-auto justify-end flex-shrink-0">
                                {activeTab === 'inventory' ? (
                                    <button
                                        onClick={() => setIsAddAssetModalOpen(true)}
                                        className="flex xl:flex-none justify-center items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                                    >
                                        <span className="material-icons-round text-lg">add</span>
                                        Tambah Aset
                                    </button>
                                ) : activeTab === 'requests' ? (
                                    <button
                                        onClick={() => setIsRequestModalOpen(true)}
                                        className="flex xl:flex-none justify-center items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                                    >
                                        <span className="material-icons-round text-lg">post_add</span>
                                        Buat Pengajuan
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-white dark:bg-surface-dark custom-scrollbar">
                            {activeTab === 'inventory' ? (
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                                    <thead className="bg-slate-50 dark:bg-background-dark sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12" scope="col">
                                                <input
                                                    className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-transparent"
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            const currentlyViewedIds = currentItems.map(item => item.id);
                                                            const newSelection = [...new Set([...selectedItems, ...currentlyViewedIds])];
                                                            setSelectedItems(newSelection);
                                                        } else {
                                                            const currentlyViewedIds = currentItems.map(item => item.id);
                                                            setSelectedItems(prev => prev.filter(id => !currentlyViewedIds.includes(id)));
                                                        }
                                                    }}
                                                    checked={currentItems.length > 0 && currentItems.every(item => selectedItems.includes(item.id))}
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Aset</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Kategori &amp; Brand</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Lokasi</th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Qty</th>
                                            <th className="relative px-6 py-3" scope="col"><span class="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-surface-dark divide-y divide-slate-200 dark:divide-border-dark">
                                        {currentItems.map((asset) => (
                                            <tr
                                                key={asset.id}
                                                onClick={() => setSelectedAsset(asset)}
                                                className={`group hover:bg-slate-50 dark:hover:bg-primary/5 cursor-pointer transition-colors ${selectedAsset?.id === asset.id ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary' : ''}`}
                                            >
                                                <td className={`px-6 py-4 whitespace-nowrap align-top pt-5 ${selectedAsset?.id === asset.id ? 'pl-5' : ''}`}>
                                                    <input
                                                        className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-transparent"
                                                        type="checkbox"
                                                        checked={selectedItems.includes(asset.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation(); // prevent clicking row
                                                            if (e.target.checked) {
                                                                setSelectedItems(prev => [...prev, asset.id]);
                                                            } else {
                                                                setSelectedItems(prev => prev.filter(id => id !== asset.id));
                                                            }
                                                        }}
                                                        onClick={(e) => e.stopPropagation()} // double protection
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            {asset.image ? (
                                                                <img alt={asset.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-border-dark" src={asset.image} />
                                                            ) : (
                                                                <div className="h-10 w-10 bg-slate-100 dark:bg-border-dark rounded-lg flex items-center justify-center text-slate-500">
                                                                    <span className="material-icons-round text-xl">inventory_2</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{asset.name}</div>
                                                            <div className="text-xs text-primary font-mono mt-0.5">#{asset.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-900 dark:text-slate-300">{asset.category}</div>
                                                    {asset.subCategory && <div className="text-xs text-primary/80 font-medium">{asset.subCategory}</div>}
                                                    <div className="text-xs text-slate-500 dark:text-slate-500">{asset.brand}</div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        {asset.location}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900 dark:text-white">
                                                    {asset.qty} Unit
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset); setIsEditModalOpen(true); }}
                                                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                            title="Edit Aset"
                                                        >
                                                            <span className="material-icons-round text-[18px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id); }}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Hapus Aset"
                                                        >
                                                            <span className="material-icons-round text-[18px]">delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : activeTab === 'requests' ? (
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                                    <thead className="bg-slate-50 dark:bg-background-dark sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">ID Request</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Aset</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Proyek Tujuan</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider" scope="col">Tanggal Request</th>
                                            <th className="relative px-6 py-3" scope="col"><span class="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-surface-dark divide-y divide-slate-200 dark:divide-border-dark">
                                        {currentItems.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                                                    {req.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-900 dark:text-white font-medium">{req.assetName}</div>
                                                    <div className="text-xs text-slate-500">Qty: {req.qty} Unit</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-900 dark:text-white">{req.projectName}</div>
                                                    <div className="text-xs text-slate-500">Req: {req.requester}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {req.requestDate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        {req.status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(req.id, 'Approved')}
                                                                className="text-green-600 hover:text-green-700 font-medium text-xs border border-green-200 bg-green-50 px-3 py-1 rounded-lg"
                                                                title="Approve Request"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {req.status === 'Approved' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(req.id, 'In Transit')}
                                                                className="text-purple-600 hover:text-purple-700 font-medium text-xs border border-purple-200 bg-purple-50 px-3 py-1 rounded-lg"
                                                                title="Mark as Shipped"
                                                            >
                                                                Ship
                                                            </button>
                                                        )}
                                                        {req.status === 'In Transit' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(req.id, 'Deployed')}
                                                                className="text-blue-600 hover:text-blue-700 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1 rounded-lg"
                                                                title="Receive at Site"
                                                            >
                                                                Receive
                                                            </button>
                                                        )}
                                                        {req.status === 'Deployed' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(req.id, 'Completed')}
                                                                className="text-slate-600 hover:text-slate-700 font-medium text-xs border border-slate-200 bg-slate-50 px-3 py-1 rounded-lg"
                                                                title="Return Asset"
                                                            >
                                                                Return
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <SisaMaterialTab />
                            )}
                        </div>

                        {/* Pagination */}
                        {activeTab !== 'sisa' && (
                            <div className="bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark px-4 py-3 flex items-center justify-between sm:px-6">
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-400">
                                            Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> sampai <span className="font-medium">{Math.min(indexOfLastItem, assets.length)}</span> dari <span className="font-medium">{assets.length}</span> aset
                                        </p>
                                    </div>
                                    <div>
                                        <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-border-dark bg-white dark:bg-background-dark text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-border-dark">
                                                <span className="material-icons-round">chevron_left</span>
                                            </button>
                                            <button aria-current="page" className="z-10 bg-primary/10 border-primary text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</button>
                                            <button className="bg-white dark:bg-background-dark border-slate-300 dark:border-border-dark text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-border-dark relative inline-flex items-center px-4 py-2 border text-sm font-medium">2</button>
                                            <button className="bg-white dark:bg-background-dark border-slate-300 dark:border-border-dark text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-border-dark relative inline-flex items-center px-4 py-2 border text-sm font-medium">3</button>
                                            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-border-dark bg-white dark:bg-background-dark text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-border-dark">
                                                <span className="material-icons-round">chevron_right</span>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Asset Detail */}
                    {selectedAsset && activeTab !== 'sisa' && (
                        <aside className="w-96 bg-background-light dark:bg-background-dark border-l border-slate-200 dark:border-border-dark flex-shrink-0 flex flex-col overflow-y-auto">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{selectedAsset.name}</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kode: <span className="font-mono text-primary">#{selectedAsset.id}</span></p>
                                    </div>
                                    <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                        <span className="material-icons-round">close</span>
                                    </button>
                                </div>
                                {/* Image */}
                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-surface-dark mb-6 border border-slate-200 dark:border-border-dark relative group">
                                    {selectedAsset.detailImage || selectedAsset.image ? (
                                        <img alt="Detail view" className="w-full h-full object-cover" src={selectedAsset.detailImage || selectedAsset.image} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <span className="material-icons-round text-4xl">image_not_supported</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full">
                                            <span className="material-icons-round">zoom_in</span>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md font-mono">
                                        SN: {selectedAsset.serialNumber}
                                    </div>
                                </div>
                                {/* Status Card */}
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <span className="material-icons-round text-primary mt-0.5">assignment_turned_in</span>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-primary mb-1">Status: {selectedAsset.status}</h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                                                Saat ini berada di <span className="font-semibold text-slate-900 dark:text-white">{selectedAsset.location}</span>. Penanggung jawab: <span className="underline">{selectedAsset.pic}</span>.
                                            </p>
                                            {selectedAsset.stockBreakdown && (
                                                <div className="mt-3 bg-white dark:bg-surface-dark rounded-lg border border-primary/20 overflow-hidden">
                                                    <table className="w-full text-xs text-left">
                                                        <thead className="bg-primary/5 text-primary font-medium border-b border-primary/10">
                                                            <tr>
                                                                <th className="px-3 py-2">Kondisi</th>
                                                                <th className="px-3 py-2">Lokasi</th>
                                                                <th className="px-3 py-2 text-right">Qty</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-primary/10 text-slate-600 dark:text-slate-300">
                                                            {selectedAsset.stockBreakdown.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="px-3 py-2">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Rusak' ? 'bg-red-500' : item.status === 'Tersedia' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                                                            {item.condition}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2">{item.location}</td>
                                                                    <td className="px-3 py-2 text-right font-medium">{item.qty}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Specs */}
                                <div className="space-y-4 mb-8">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Spesifikasi &amp; Info</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-border-dark">
                                            <div className="text-xs text-slate-500 mb-1">Merk</div>
                                            <div className="text-sm font-medium dark:text-slate-200">{selectedAsset.brand}</div>
                                        </div>
                                        <div className="bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-border-dark">
                                            <div className="text-xs text-slate-500 mb-1">Tahun Beli</div>
                                            <div className="text-sm font-medium dark:text-slate-200">{selectedAsset.purchaseYear}</div>
                                        </div>
                                        <div className="bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-border-dark col-span-2">
                                            <div className="text-sm font-medium dark:text-slate-200 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                {selectedAsset.condition}
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-border-dark col-span-2">
                                            <div className="text-xs text-slate-500 mb-1">Total Quantity</div>
                                            <div className="text-sm font-medium dark:text-slate-200">{selectedAsset.qty} Unit</div>
                                        </div>
                                    </div>
                                </div>
                                {/* History Loop */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Riwayat Aset</h3>
                                    <div className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6 pb-4">
                                        {selectedAsset.history?.map((hist, idx) => (
                                            <div key={idx} className="relative pl-6">
                                                <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ring-4 ring-white dark:ring-background-dark ${hist.active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                                <div className="text-xs text-slate-500 mb-0.5">{hist.date}</div>
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">{hist.event}</div>
                                                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{hist.sub}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-border-dark flex gap-3">
                                    <button
                                        onClick={handleEditClick}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-surface-dark dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
                                    >
                                        <span className="material-icons-round text-lg">edit</span>
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAsset(selectedAsset.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-800/30"
                                    >
                                        <span className="material-icons-round text-lg">delete</span>
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Selected Status Bar for Inventory */}
                {
                    activeTab === 'inventory' && selectedItems.length > 0 && (
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
            </main>

            <EditAssetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                asset={selectedAsset}
                onSave={handleSaveAsset}
            />

            <AddAssetModal
                isOpen={isAddAssetModalOpen}
                onClose={() => setIsAddAssetModalOpen(false)}
                onSave={handleAddAsset}
            />

            <RequestAssetModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                assets={assets}
                onSave={handleSaveRequest}
            />
        </div>
    );
}

