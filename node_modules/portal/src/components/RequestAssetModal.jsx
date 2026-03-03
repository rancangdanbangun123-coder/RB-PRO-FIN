import React, { useState, useEffect } from 'react';

export default function RequestAssetModal({ isOpen, onClose, assets, projects, onSave }) {
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        assetId: '',
        projectId: '',
        qty: 1,
        notes: '',
        requestDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setAnimateIn(true), 10);
            // Reset form when opening
            setFormData({
                assetId: '',
                projectId: '',
                qty: 1,
                notes: '',
                requestDate: new Date().toISOString().split('T')[0]
            });
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Enrich data with names for display
        const selectedAsset = assets.find(a => a.id === formData.assetId);
        // Mock project interaction for now, assuming projects list passed or just IDs
        // In a real app we'd look up the project name

        const submissionData = {
            ...formData,
            assetName: selectedAsset?.name || 'Unknown Asset',
            requester: 'Current User', // Mock
            status: 'Pending',
            history: [
                { status: 'Pending', date: new Date().toLocaleString(), actor: 'Current User', note: 'Pengajuan baru' }
            ]
        };

        onSave(submissionData);
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className={`absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            <div
                className={`bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 relative overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-surface-dark">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-icons-outlined text-primary">post_add</span>
                        Buat Pengajuan Aset
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="request-asset-form" onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Aset</label>
                            <select
                                name="assetId"
                                value={formData.assetId}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                <option value="">-- Pilih Aset --</option>
                                {assets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name} (Tersedia: {asset.qty})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proyek Tujuan</label>
                            <select
                                name="projectId"
                                value={formData.projectId}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                <option value="">-- Pilih Proyek --</option>
                                <option value="115">115 - Bojongkoneng</option>
                                <option value="116">116 - Pesona Bali</option>
                                <option value="117">117 - Dago Pakar</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah (Qty)</label>
                                <input
                                    type="number"
                                    name="qty"
                                    min="1"
                                    value={formData.qty}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Diperlukan</label>
                                <input
                                    type="date"
                                    name="requestDate"
                                    value={formData.requestDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catatan / Keperluan</label>
                            <textarea
                                name="notes"
                                rows="3"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Jelaskan kebutuhan aset ini..."
                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                            ></textarea>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-800 dark:text-blue-200">
                            <p>
                                <span className="font-semibold">Note:</span> Pengajuan akan masuk status "Pending" dan menunggu persetujuan Logistik.
                            </p>
                        </div>

                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface-dark flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="request-asset-form"
                        className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/20 transition-colors"
                    >
                        Ajukan Permintaan
                    </button>
                </div>
            </div>
        </div>
    );
}
