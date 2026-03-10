import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';

export default function SisaMaterialTab() {
    // 1. Load Data
    const [materials, setMaterials] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [sisaMaterials, setSisaMaterials] = useState([]);
    const [projectsList, setProjectsList] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [mats, projs] = await Promise.all([
                    api.materials.list(),
                    api.projects.list(),
                ]);
                setMaterials(mats || []);
                setProjectsList(projs || []);
                // TODO: load sisa materials from API when endpoint exists
                // For now, start with empty array
            } catch (err) { console.error('Failed to load sisa material data:', err); }
        })();
    }, []);

    // 3. Form Mode & State
    const [formMode, setFormMode] = useState('Opname'); // 'Opname' or 'Transfer'
    const [formData, setFormData] = useState({
        projectId: '',
        materialId: '',
        qty: '',
        unit: 'Unit',
        targetLocation: 'Gudang Pusat (Main Warehouse)'
    });

    // 4. Derived & Stats
    const totalItems = sisaMaterials.reduce((sum, item) => sum + Number(item.qty), 0);

    // Derived Transfer Constraints
    const availableMaterialsForTransfer = useMemo(() => {
        if (!formData.projectId || formMode !== 'Transfer') return materials;

        const selectedProject = projects.find(p => p.id === formData.projectId);
        if (!selectedProject) return [];

        // Find materials currently existing in the chosen Project's inventory scope
        const existingInProject = sisaMaterials.filter(item => item.projectOrigin === selectedProject.name);

        // Map back to global materials reference to render options
        return materials.filter(m => existingInProject.some(ex => ex.sku === m.sku || ex.materialName === m.name));

    }, [formData.projectId, formMode, materials, sisaMaterials, projectsList]);

    const maxTransferQty = useMemo(() => {
        if (formMode !== 'Transfer' || !formData.projectId || !formData.materialId) return null;

        const selectedProject = projects.find(p => p.id === formData.projectId);
        const selectedMaterial = materials.find(m => m.id === formData.materialId);

        if (!selectedProject || !selectedMaterial) return null;

        const existingRecords = sisaMaterials.filter(item =>
            item.projectOrigin === selectedProject.name &&
            (item.sku === selectedMaterial.sku || item.materialName === selectedMaterial.name)
        );

        return existingRecords.reduce((sum, item) => sum + Number(item.qty), 0);
    }, [formData.projectId, formData.materialId, formMode, sisaMaterials, projectsList, materials]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.projectId || !formData.materialId || !formData.qty) {
            alert("Harap lengkapi Proyek Asal, Material, dan Jumlah.");
            return;
        }

        if (formMode === 'Transfer' && !formData.targetLocation) {
            alert("Harap lengkapi Tujuan Lokasi untuk Transfer.");
            return;
        }

        if (formMode === 'Transfer' && maxTransferQty !== null && Number(formData.qty) > maxTransferQty) {
            alert(`Jumlah transfer melebihi stok yang tersedia di proyek ini (Max: ${maxTransferQty}).`);
            return;
        }

        const project = projects.find(p => p.id === formData.projectId);
        const material = materials.find(m => m.id === formData.materialId);

        const finalTargetLocation = formMode === 'Opname' ? (project ? project.name : formData.projectId) : formData.targetLocation;

        const newItem = {
            id: Date.now(),
            materialName: material ? material.name : formData.materialId,
            sku: formData.materialId || '-',
            projectOrigin: project ? project.name : formData.projectId,
            projectColor: 'bg-indigo-500', // random default color
            qty: formData.qty,
            unit: formData.unit,
            targetLocation: finalTargetLocation,
            mode: formMode
        };

        setSisaMaterials([newItem, ...sisaMaterials]);

        // Reset form
        setFormData({
            projectId: '',
            materialId: '',
            qty: '',
            unit: 'Unit',
            targetLocation: 'Gudang Pusat (Main Warehouse)'
        });
        alert("Material sisa berhasil ditambahkan!");
    };

    // CRUD Handlers
    const handleDelete = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data material sisa ini?')) {
            setSisaMaterials(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleEditClick = (item) => {
        setEditingItem({ ...item }); // clone to avoid direct mutation
        setIsEditModalOpen(true);
    };

    const handleEditSave = (e) => {
        e.preventDefault();
        setSisaMaterials(prev => prev.map(item =>
            item.id === editingItem.id ? { ...editingItem } : item
        ));
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    // Grouping Sisa Materials by Project
    const groupedSisaMaterials = useMemo(() => {
        const groups = {};
        sisaMaterials.forEach(item => {
            const project = item.projectOrigin || 'Unassigned';
            if (!groups[project]) {
                groups[project] = {
                    color: item.projectColor || 'bg-slate-500',
                    items: []
                };
            }
            groups[project].items.push(item);
        });
        return groups;
    }, [sisaMaterials]);

    return (
        <>
            <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-8">

                {/* Inventory Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Qty Sisa</div>
                            <span className="material-icons-round text-primary bg-primary/20 p-1 rounded text-base">inventory_2</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalItems.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500 ml-1">unit</span></div>
                    </div>
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Nilai Estimasi</div>
                            <span className="material-icons-round text-emerald-500 bg-emerald-500/20 p-1 rounded text-base">attach_money</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">Rp 85.4M</div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 pb-8">
                    {/* Cards Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons-round text-primary">view_list</span>
                                Daftar Material per Proyek
                            </h2>
                            <div className="flex gap-2">
                                {/* Filters removed */}
                            </div>
                        </div>

                        {Object.keys(groupedSisaMaterials).length === 0 ? (
                            <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700/50 p-8 text-center text-slate-500">
                                Belum ada data material sisa.
                            </div>
                        ) : (
                            Object.entries(groupedSisaMaterials).map(([projectName, group]) => (
                                <div key={projectName} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-surface-darker/50 flex justify-between items-center">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${group.color}`}></div>
                                            {projectName}
                                        </h3>
                                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-1 px-3 rounded-full text-xs font-semibold">
                                            {group.items.length} Material
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                            <thead className="text-[11px] text-slate-500 uppercase bg-white dark:bg-surface-dark dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold" scope="col">Nama Material</th>
                                                    <th className="px-5 py-3 font-semibold text-center" scope="col">Qty</th>
                                                    <th className="px-5 py-3 font-semibold text-right" scope="col">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                                {group.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                            {item.materialName}
                                                            <div className="text-xs text-slate-500 font-normal mt-0.5">ID: {item.sku}</div>
                                                        </td>
                                                        <td className="px-5 py-3 text-center font-semibold text-slate-900 dark:text-slate-200">
                                                            {item.qty} <span className="text-xs font-normal text-slate-500">{item.unit.toLowerCase()}</span>
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleEditClick(item)}
                                                                    className="text-slate-400 hover:text-primary transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <span className="material-icons-round text-base">edit_note</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                                    title="Hapus"
                                                                >
                                                                    <span className="material-icons-round text-base">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-lg sticky top-0">
                            <form onSubmit={handleSubmit}>
                                <div className="p-5 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-surface-darker/50 rounded-t-xl">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                        <span className="material-icons-round text-primary">assignment_return</span>
                                        Atur Gudang
                                    </h2>

                                    {/* Mode Toggle */}
                                    <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setFormMode('Opname')}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formMode === 'Opname' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            Opname Fisik
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormMode('Transfer')}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formMode === 'Transfer' ? 'bg-white dark:bg-surface-dark text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                        >
                                            Transfer Keluar
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Proyek Asal</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <span className="material-icons-round text-lg">apartment</span>
                                            </span>
                                            <select
                                                name="projectId"
                                                value={formData.projectId}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                                required
                                            >
                                                <option disabled value="">Pilih Proyek...</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nama Material</label>
                                            <select
                                                name="materialId"
                                                value={formData.materialId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                                required
                                            >
                                                <option disabled value="">
                                                    {formMode === 'Transfer' ? 'Pilih Stok Tersedia di Proyek...' : 'Pilih Material dari Database...'}
                                                </option>
                                                {formMode === 'Transfer'
                                                    ? availableMaterialsForTransfer.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name} (SKU: {m.sku || '-'})</option>
                                                    ))
                                                    : materials.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name} (SKU: {m.sku || '-'})</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Jumlah {formMode === 'Transfer' && maxTransferQty !== null && <span className="text-xs text-slate-500 font-normal">(Max: {maxTransferQty})</span>}
                                            </label>
                                            <input
                                                name="qty"
                                                value={formData.qty}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                                placeholder="0"
                                                type="number"
                                                required
                                                min="1"
                                                max={formMode === 'Transfer' && maxTransferQty !== null ? maxTransferQty : undefined}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Satuan</label>
                                            <select
                                                name="unit"
                                                value={formData.unit}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                            >
                                                <option value="Unit">Unit</option>
                                                <option value="Pcs">Pcs</option>
                                                <option value="Batang">Batang</option>
                                                <option value="Sak">Sak</option>
                                                <option value="Dus">Dus</option>
                                                <option value="Meter">Meter</option>
                                                <option value="Box">Box</option>
                                            </select>
                                        </div>
                                    </div>



                                    <div className="space-y-4 pt-2">
                                        {formMode === 'Transfer' && (
                                            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tujuan Lokasi</label>
                                                <select
                                                    name="targetLocation"
                                                    value={formData.targetLocation}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                                >
                                                    <option value="Gudang Pusat (Main Warehouse)">Gudang Pusat (Main Warehouse)</option>
                                                    {projects
                                                        .filter(p => p.id !== formData.projectId) // Don't allow transferring to the same project
                                                        .map(p => (
                                                            <option key={`target-${p.id}`} value={p.name}>Proyek: {p.name}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        )}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Foto Bukti Fisik</label>
                                            <div className="flex items-center justify-center w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-surface-darker hover:bg-slate-100 transition-colors" htmlFor="dropzone-file">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <span className="material-icons-round text-slate-400 mb-1">cloud_upload</span>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> atau drag and drop</p>
                                                    </div>
                                                    <input className="hidden" id="dropzone-file" type="file" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setFormData({ projectId: '', materialId: '', qty: '', unit: 'Unit', targetLocation: 'Gudang Pusat (Main Warehouse)' })} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 py-2.5 rounded-lg text-sm font-medium transition-colors">
                                            Reset
                                        </button>
                                        <button type="submit" className="flex-[2] bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2">
                                            <span className="material-icons-round text-sm">save_alt</span>
                                            Submit {formMode === 'Opname' ? 'Opname' : 'Transfer'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div >
            </div >

            {/* Edit Modal Overlay */}
            {
                isEditModalOpen && editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in transition-all">
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-surface-darker/50">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-icons-round text-primary">edit_square</span>
                                    Edit Material Sisa
                                </h3>
                                <button
                                    onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                                    className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <span className="material-icons-round text-xl">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleEditSave} className="p-6 space-y-5">
                                {/* Read-Only Material Name */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Material</label>
                                    <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400">
                                        {editingItem.materialName} ({editingItem.sku})
                                    </div>
                                </div>

                                {/* Editable Qty */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jumlah</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editingItem.qty}
                                            onChange={(e) => setEditingItem({ ...editingItem, qty: Number(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Satuan</label>
                                        <select
                                            value={editingItem.unit}
                                            onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-surface-darker border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary text-slate-900 dark:text-white"
                                        >
                                            <option value="Unit">Unit</option>
                                            <option value="Pcs">Pcs</option>
                                            <option value="Batang">Batang</option>
                                            <option value="Sak">Sak</option>
                                            <option value="Dus">Dus</option>
                                            <option value="Meter">Meter</option>
                                            <option value="Box">Box</option>
                                        </select>
                                    </div>
                                </div>



                                {/* Action Buttons */}
                                <div className="pt-4 flex gap-3 border-t border-slate-200 dark:border-slate-700/50 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                                        className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 py-2.5 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2"
                                    >
                                        <span className="material-icons-round text-sm">save</span>
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
}
