import React, { useState } from 'react';
import { api } from '../lib/api';

export default function AddSubconModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        pic: '',
        address: '',
        email: '',
        phone: '',
        rating: 3,
        status: 'Pending L1'
    });

    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    const [selectedMaterials, setSelectedMaterials] = useState([]);

    // Dynamic Types
    const [availableTypes, setAvailableTypes] = useState(['Sipil', 'MEP', 'Arsitektur', 'Interior', 'Material Supplier', 'Struktural', 'Logistik Umum', 'Supplier Beton']);
    const [materialDatabase, setMaterialDatabase] = useState([]);

    React.useEffect(() => {
        if (isOpen) {
            // Load materials from API
            (async () => {
                try {
                    const mats = await api.materials.list();
                    setMaterialDatabase((mats || []).filter(m => m.status !== 'Inactive'));
                } catch (e) { console.error(e); }
            })();
            if (initialData) {
                setFormData({
                    ...initialData
                });
                setSelectedMaterials([]); // Reset for edit mode, or load if needed (but currently specific for new entry)
            } else {
                // Reset for new entry
                setFormData({
                    name: '',
                    type: '',
                    pic: '',
                    address: '',
                    email: '',
                    phone: '',
                    rating: 3,
                    status: 'Pending L1'
                });
                setSelectedMaterials([]);
            }
            setIsVisible(true);
            const timer = setTimeout(() => setAnimateIn(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Save custom type to available types if it doesn't exist yet
        if (formData.type && !availableTypes.includes(formData.type)) {
            const newTypes = [...availableTypes, formData.type];
            setAvailableTypes(newTypes);
        }

        // Merge initialData to ensure ID is preserved when editing
        // Include selectedMaterials for new entries
        onSave({ ...initialData, ...formData, initialMaterials: selectedMaterials });
        onClose();
        // Reset form
        setFormData({
            name: '',
            type: '',
            pic: '',
            address: '',
            email: '',
            phone: '',
            rating: 3,
            status: 'Pending L1'
        });
        setSelectedMaterials([]);
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${animateIn ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-border-dark flex flex-col max-h-[90vh] relative z-10 transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
                <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Subkontraktor' : 'Tambah Subkontraktor Baru'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="add-subcon-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Informasi Perusahaan</h3>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="PT. Contoh Karya"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipe / Spesialisasi</label>
                                    <input
                                        list="subcon-types"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Pilih atau ketik tipe baru..."
                                    />
                                    <datalist id="subcon-types">
                                        {availableTypes.map((t, idx) => (
                                            <option key={idx} value={t} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alamat Kantor</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Alamat lengkap..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Right Column: Contact & Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-4">Kontak & Detail</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama PIC</label>
                                        <input
                                            type="text"
                                            name="pic"
                                            value={formData.pic}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Bpk. Budi"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kontak / HP</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone || ''}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="+62 812..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="email@perusahaan.com"
                                    />
                                </div>

                                {initialData && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status Subkontraktor</label>
                                        <select
                                            name="status"
                                            value={formData.status || 'Active'}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Pending L1">Pending L1</option>
                                            <option value="Pending L2">Pending L2</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!initialData && (
                            <div className="pt-4 border-t border-slate-200 dark:border-border-dark mt-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Starter Material (Opsional)
                                    <span className="block text-xs font-normal text-slate-500">Pilih material awal untuk katalog subkontraktor ini.</span>
                                </label>

                                <div className="flex gap-2 mb-3 items-end">
                                    <div className="flex-1">
                                        <select
                                            id="starter-material-select"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const priceInput = document.getElementById('starter-material-price');
                                                if (val && priceInput) {
                                                    const material = materialDatabase.find(m => m.id === val);
                                                    if (material) priceInput.value = material.price;
                                                }
                                            }}
                                        >
                                            <option value="">-- Pilih Material --</option>
                                            {materialDatabase.filter(m => !selectedMaterials.some(sm => sm.materialId === m.id)).map(m => (
                                                <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <input
                                            id="starter-material-price"
                                            type="number"
                                            placeholder="Harga"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const select = document.getElementById('starter-material-select');
                                            const priceInput = document.getElementById('starter-material-price');
                                            const val = select.value;
                                            const priceVal = priceInput.value;

                                            if (val && priceVal) {
                                                const material = materialDatabase.find(m => m.id === val);
                                                setSelectedMaterials(prev => [...prev, {
                                                    materialId: val,
                                                    price: parseInt(priceVal), // Use input price
                                                    date: new Date().toISOString().split('T')[0]
                                                }]);
                                                select.value = "";
                                                priceInput.value = "";
                                            }
                                        }}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Tambah
                                    </button>
                                </div>

                                {selectedMaterials.length > 0 && (
                                    <div className="space-y-2 bg-slate-50 dark:bg-background-dark p-3 rounded-lg border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
                                        {selectedMaterials.map((item, idx) => {
                                            const mat = materialDatabase.find(m => m.id === item.materialId);
                                            return (
                                                <div key={idx} className="flex items-center justify-between text-sm bg-white dark:bg-card-dark p-2 rounded border border-slate-100 dark:border-slate-700/50">
                                                    <div>
                                                        <div className="font-medium text-slate-700 dark:text-slate-200">{mat?.name}</div>
                                                        <div className="text-xs text-slate-500">Rp {item.price.toLocaleString('id-ID')} / {mat?.unit}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMaterials(prev => prev.filter((_, i) => i !== idx))}
                                                        className="text-red-400 hover:text-red-500 p-1"
                                                    >
                                                        <span className="material-icons-round text-base">close</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                            {initialData ? (
                                <p className="flex items-start gap-2">
                                    <span className="material-icons-round text-sm text-slate-400 mt-0.5">info</span>
                                    <span>Perubahan profil akan langsung diperbarui di database.</span>
                                </p>
                            ) : (
                                <p className="flex items-start gap-2">
                                    <span className="material-icons-round text-sm text-slate-400 mt-0.5">info</span>
                                    <span>Subkontraktor baru akan masuk status <strong>"Pending L1"</strong> dan memerlukan persetujuan sebelum aktif.</span>
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-border-dark flex justify-end gap-3 bg-slate-50 dark:bg-surface-dark/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="add-subcon-form"
                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg shadow-lg shadow-primary/25 transition-all transform active:scale-95"
                    >
                        {initialData ? 'Update Profil' : 'Simpan'}
                    </button>
                </div>
            </div >
        </div >
    );
}
