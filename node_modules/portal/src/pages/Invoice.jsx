import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projectData';
import ClientProjectSelect from '../components/ClientProjectSelect';
import InvoiceGeneratorModal from '../components/InvoiceGeneratorModal';
import Sidebar from '../components/Sidebar';

export default function Invoice() {
    const [isEditing, setIsEditing] = useState(false);
    // Tabs & Client Data
    const [activeTab, setActiveTab] = useState('invoices');
    const [selectedClientId, setSelectedClientId] = useState(1);
    const [selectedProjectId, setSelectedProjectId] = useState('117');
    const [isEditingClients, setIsEditingClients] = useState(false);
    const [isEditingLogs, setIsEditingLogs] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedTerminForInvoice, setSelectedTerminForInvoice] = useState(null);
    const [selectedTerminIds, setSelectedTerminIds] = useState(new Set());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Convert imported projects to state to allow "Simulation" updates
    const [projectsData, setProjectsData] = useState(projects);

    // Initial Client Data (Static Info)
    const [clientData, setClientData] = useState([
        {
            id: 1,
            name: 'Bapak Budi Santoso',
            type: 'Perorangan',
            contact: '0812-3456-7890',
            email: 'budi.s@gmail.com',
            address: 'Jl. Merpati No. 12, Jakarta Selatan',
            initial: 'BS',
        },
        {
            id: 2,
            name: 'Ibu Ratna Dewi',
            type: 'Perorangan',
            contact: '0811-9876-5432',
            email: 'ratna.dewi88@yahoo.com',
            address: 'Apartemen Taman Rasuna, Jakarta',
            initial: 'RD',
        },
        {
            id: 3,
            name: 'Bapak Hendra Wijaya',
            type: 'Perorangan',
            contact: '0813-5555-1234',
            email: 'hendra.w@gmail.com',
            address: 'Cluster Anggrek Blok C, Tangerang',
            initial: 'HW',
        },
    ]);

    // Project-Specific Billing Data (Timeline & Logs)
    const [projectBillingData, setProjectBillingData] = useState({
        '117': {
            timelineSteps: [
                { id: 1, title: 'Uang Muka (DP)', description: 'Pembayaran awal 20% kontrak', amount: 'Rp 300.000.000', date: '2023-01-01', status: 'LUNAS', isPaid: true, qty: 1, discount: 0 },
                { id: 2, title: 'Termin 1 (Progress 30%)', description: 'Pekerjaan Pondasi & Struktur Bawah', amount: 'Rp 450.000.000', date: '2023-03-15', status: 'LUNAS', isPaid: true, qty: 1, discount: 0 },
                { id: 3, title: 'Termin 2 (Progress 60%)', description: 'Pekerjaan Dinding & Atap', amount: 'Rp 450.000.000', date: '2023-05-20', status: 'JATUH TEMPO', isOverdue: true, qty: 1, discount: 0 },
                { id: 4, title: 'Retensi (Progress 100%)', description: 'Finishing & Serah Terima', amount: 'Rp 300.000.000', date: '2023-08-01', status: 'PENDING', isPending: true, qty: 1, discount: 0 }
            ],
            paymentLogs: [
                { id: 1, ref: '#TRX-8821', date: '2023-03-15', method: 'Transfer BCA', amount: 450000000, status: 'Verified', isVerified: true },
                { id: 2, ref: '#TRX-8004', date: '2023-01-01', method: 'Transfer Mandiri', amount: 300000000, status: 'Verified', isVerified: true }
            ]
        },
        '118': {
            timelineSteps: [
                { id: 1, title: 'Uang Muka (DP)', description: 'Pembayaran awal 30% kontrak', amount: 'Rp 150.000.000', date: '2023-02-10', status: 'LUNAS', isPaid: true },
                { id: 2, title: 'Termin 1 (Progress 50%)', description: 'Struktur Utama', amount: 'Rp 200.000.000', date: '2023-04-01', status: 'PENDING', isPending: true }
            ],
            paymentLogs: [
                { id: 1, ref: '#TRX-9001', date: '2023-02-10', method: 'Transfer BCA', amount: 150000000, status: 'Verified', isVerified: true }
            ]
        },
        '120': {
            timelineSteps: [
                { id: 1, title: 'Uang Muka (DP)', description: 'Pembayaran awal 10% kontrak', amount: 'Rp 450.000.000', date: '2023-11-01', status: 'LUNAS', isPaid: true },
            ],
            paymentLogs: []
        }
    });

    // Derived State for Current View
    const activeClient = clientData.find(c => c.id === selectedClientId) || clientData[0] || {};
    const clientProjects = projectsData.filter(p => p.clientId === selectedClientId);

    // Safety check for active project
    const activeProject = projectsData.find(p => p.id === selectedProjectId) || clientProjects[0] || {};
    const billingData = projectBillingData[activeProject?.id] || { timelineSteps: [], paymentLogs: [] };
    const timelineSteps = billingData.timelineSteps;
    const paymentLogs = billingData.paymentLogs;

    // Handlers
    const handleUpdateStep = (id, field, value) => {
        setProjectBillingData(prev => ({
            ...prev,
            [activeProject.id]: {
                ...prev[activeProject.id],
                timelineSteps: prev[activeProject.id].timelineSteps.map(step =>
                    step.id === id ? { ...step, [field]: value } : step
                )
            }
        }));
    };

    const handleAddStep = () => {
        setProjectBillingData(prev => {
            const currentSteps = prev[activeProject.id]?.timelineSteps || [];
            const newId = (Math.max(...(currentSteps.map(s => s.id) || [0]), 0)) + 1;
            return {
                ...prev,
                [activeProject.id]: {
                    ...prev[activeProject.id],
                    timelineSteps: [...currentSteps, {
                        id: newId,
                        title: 'Termin Baru',
                        description: 'Deskripsi pekerjaan...',
                        amount: 'Rp 0',
                        date: new Date().toISOString().split('T')[0],
                        date: new Date().toISOString().split('T')[0],
                        status: 'PENDING',
                        isPending: true,
                        qty: 1,
                        discount: 0
                    }]
                }
            };
        });
    };

    const handleDeleteStep = (id) => {
        setProjectBillingData(prev => ({
            ...prev,
            [activeProject.id]: {
                ...prev[activeProject.id],
                timelineSteps: prev[activeProject.id].timelineSteps.filter(step => step.id !== id)
            }
        }));
    };

    const handleUpdateLog = (id, field, value) => {
        setProjectBillingData(prev => ({
            ...prev,
            [activeProject.id]: {
                ...prev[activeProject.id],
                paymentLogs: prev[activeProject.id].paymentLogs.map(log =>
                    log.id === id ? { ...log, [field]: value } : log
                )
            }
        }));
    };

    const handleAddLog = () => {
        setProjectBillingData(prev => {
            const currentLogs = prev[activeProject.id]?.paymentLogs || [];
            const newId = (Math.max(...(currentLogs.map(l => l.id) || [0]), 0)) + 1;
            return {
                ...prev,
                [activeProject.id]: {
                    ...prev[activeProject.id],
                    paymentLogs: [...currentLogs, {
                        id: newId,
                        ref: '#TRX-NEW',
                        date: new Date().toISOString().split('T')[0],
                        method: 'Transfer Bank',
                        amount: 0,
                        status: 'Pending',
                        isVerified: false
                    }]
                }
            };
        });
    };

    const handleDeleteLog = (id) => {
        setProjectBillingData(prev => ({
            ...prev,
            [activeProject.id]: {
                ...prev[activeProject.id],
                paymentLogs: prev[activeProject.id].paymentLogs.filter(log => log.id !== id)
            }
        }));
    };

    const formatIDR = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '-') return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const handleUpdateClient = (id, field, value) => {
        setClientData(prev => prev.map(client =>
            client.id === id ? { ...client, [field]: value } : client
        ));
    };

    const handleAddClient = () => {
        const newId = (Math.max(...(clientData.map(c => c.id) || [0]), 0)) + 1;
        setClientData([...clientData, {
            id: newId,
            name: 'Nama Klien Baru',
            type: 'Perorangan',
            contact: '-',
            email: '-',
            address: '-',
            initial: 'NK',
        }]);
    };

    const handleDeleteClient = (id) => {
        setClientData(prev => prev.filter(client => client.id !== id));
    };

    const handleOpenInvoice = (step) => {
        setSelectedTerminForInvoice(step);
        setShowInvoiceModal(true);
    };

    const handleToggleTermin = (id) => {
        const newSelected = new Set(selectedTerminIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedTerminIds(newSelected);
    };

    const handleOpenBulkInvoice = () => {
        const selectedTermins = timelineSteps.filter(step => selectedTerminIds.has(step.id));
        setSelectedTerminForInvoice(selectedTermins);
        setShowInvoiceModal(true);
    };

    // Render Helpers
    const renderClientCard = () => (
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                    {activeClient.initial || 'CL'}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeClient.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activeClient.type}</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Proyek</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {activeProject?.name || '-'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Lokasi</span>
                        <span className="font-medium text-gray-900 dark:text-white">{activeProject?.location || activeClient.address}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Kontrak</span>
                        <span className="font-medium text-primary">
                            {formatIDR(activeProject?.value || 0)}
                        </span>
                    </div>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress Pembayaran</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">50%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-2 text-gray-500 dark:text-gray-400">
                        <span>Terbayar: Rp 750jt</span>
                        <span>Sisa: Rp 750jt</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-2">
                <button className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2">
                    <span className="material-icons text-sm">email</span> Email
                </button>
                <button className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2">
                    <span className="material-icons text-sm">phone</span> WA
                </button>
            </div>
        </div>
    );

    const renderTimeline = () => (
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="material-icons text-primary">timeline</span> Rincian Termin
                </h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isEditing
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                >
                    <span className="material-icons-round text-sm">{isEditing ? 'check' : 'edit'}</span>
                    {isEditing ? 'Selesai' : 'Kustomisasi'}
                </button>
            </div>

            <div className="relative pl-4">
                <div className="absolute left-[27px] top-4 bottom-10 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                {/* Bulk Action Bar */}
                {selectedTerminIds.size > 0 && (
                    <div className="sticky top-0 z-20 mb-6 bg-primary text-white p-3 rounded-lg shadow-lg flex justify-between items-center animate-in slide-in-from-top-2">
                        <span className="text-sm font-medium px-2">{selectedTerminIds.size} item terpilih</span>
                        <button
                            onClick={handleOpenBulkInvoice}
                            className="bg-white text-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-50 transition-colors uppercase tracking-wider"
                        >
                            Buat Invoice Gabungan
                        </button>
                    </div>
                )}

                {timelineSteps.map((step) => (
                    <div key={step.id} className="relative flex gap-6 mb-8 group">
                        <div className="flex flex-col items-center z-10 gap-2">
                            {/* Bulk Select Checkbox */}
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={selectedTerminIds.has(step.id)}
                                    onChange={() => handleToggleTermin(step.id)}
                                    className="w-4 h-4 text-primary rounded ring-offset-0 focus:ring-0 cursor-pointer border-slate-300 dark:border-slate-600"
                                />
                            </div>

                            <div className={`w-6 h-6 rounded-full border-4 border-white dark:border-card-dark flex items-center justify-center ${step.status === 'LUNAS' ? 'bg-emerald-500' :
                                step.status === 'JATUH TEMPO' ? 'bg-rose-500 animate-pulse shadow-lg shadow-rose-500/30' :
                                    'bg-gray-300 dark:bg-gray-700'
                                }`}>
                                <span className={`material-icons text-[10px] font-bold ${step.status === 'PENDING' ? 'text-gray-500 dark:text-gray-400' : 'text-white'}`}>
                                    {step.status === 'LUNAS' ? 'check' : step.status === 'JATUH TEMPO' ? 'priority_high' : 'hourglass_empty'}
                                </span>
                            </div>
                        </div>

                        <div className={`flex-1 rounded-lg p-4 border transition-colors ${step.status === 'LUNAS' ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700' :
                            step.status === 'JATUH TEMPO' ? 'bg-rose-50/10 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/50 shadow-sm relative overflow-hidden' :
                                'bg-white dark:bg-card-dark border-dashed border-gray-300 dark:border-gray-700 opacity-70 hover:opacity-100'
                            }`}>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={step.title}
                                            onChange={(e) => handleUpdateStep(step.id, 'title', e.target.value)}
                                            className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Judul Termin"
                                        />
                                        <select
                                            value={step.status}
                                            onChange={(e) => handleUpdateStep(step.id, 'status', e.target.value)}
                                            className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 dark:border-slate-700"
                                        >
                                            <option value="LUNAS">LUNAS</option>
                                            <option value="JATUH TEMPO">JATUH TEMPO</option>
                                            <option value="PENDING">PENDING</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={step.description}
                                        onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-700"
                                        placeholder="Deskripsi"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={step.amount}
                                            onChange={(e) => handleUpdateStep(step.id, 'amount', e.target.value)}
                                            className="flex-1 px-2 py-1 text-sm font-bold border rounded dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Jumlah"
                                        />
                                        <div className="flex items-center gap-1 w-20">
                                            <span className="text-[10px] text-slate-400">Qty</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={step.qty || 1}
                                                onChange={(e) => handleUpdateStep(step.id, 'qty', parseInt(e.target.value) || 1)}
                                                className="w-full px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-700 text-center"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 w-24">
                                            <span className="text-[10px] text-slate-400">Disc%</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={step.discount || 0}
                                                onChange={(e) => handleUpdateStep(step.id, 'discount', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-700 text-center"
                                            />
                                        </div>
                                        <input
                                            type="date"
                                            value={step.date}
                                            onChange={(e) => handleUpdateStep(step.id, 'date', e.target.value)}
                                            className="w-32 px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-700"
                                            placeholder="Tanggal"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleDeleteStep(step.id)}
                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"
                                    >
                                        <span className="material-icons text-sm">delete</span> Hapus
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${step.status === 'LUNAS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    step.status === 'JATUH TEMPO' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                        'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                                                    }`}>{step.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{step.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${step.status === 'JATUH TEMPO' ? 'text-rose-500 text-lg' : 'text-gray-900 dark:text-white'}`}>{step.amount}</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {step.qty || 1} Unit • Disc {step.discount || 0}%
                                            </div>
                                            <div className={`text-xs ${step.status === 'JATUH TEMPO' ? 'text-rose-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{step.date}</div>
                                        </div>
                                    </div>
                                    {step.status === 'JATUH TEMPO' && (
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => handleOpenInvoice(step)}
                                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center shadow-lg shadow-rose-500/20"
                                            >
                                                <span className="material-icons text-sm mr-2">send</span> Kirim Invoice
                                            </button>
                                            <button className="flex-1 bg-white dark:bg-card-dark border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-center items-center">
                                                <span className="material-icons text-sm mr-2">upload</span> Bukti Bayar
                                            </button>
                                        </div>
                                    )}
                                    {step.status === 'LUNAS' && (
                                        <div className="flex gap-2 mt-3">
                                            <button className="text-xs flex items-center text-primary hover:text-blue-400 transition-colors">
                                                <span className="material-icons text-sm mr-1">receipt</span> Lihat Invoice
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {isEditing && (
                    <button
                        onClick={handleAddStep}
                        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-icons">add_circle_outline</span> Tambah Termin
                    </button>
                )}
            </div>
        </div>
    );

    const renderPaymentLogs = () => (
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Log Pembayaran Masuk</h2>
                <button
                    onClick={() => setIsEditingLogs(!isEditingLogs)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isEditingLogs
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'text-primary hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="material-icons-round text-sm">{isEditingLogs ? 'check' : 'edit'}</span>
                    {isEditingLogs ? 'Selesai' : 'Kustomisasi'}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No. Ref</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jumlah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-card-dark divide-y divide-gray-200 dark:divide-gray-800">
                        {paymentLogs.map((log) => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {isEditingLogs ? (
                                        <input
                                            type="text"
                                            value={log.ref}
                                            onChange={(e) => handleUpdateLog(log.id, 'ref', e.target.value)}
                                            className="w-24 px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                        />
                                    ) : log.ref}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {isEditingLogs ? (
                                        <input
                                            type="date"
                                            value={log.date}
                                            onChange={(e) => handleUpdateLog(log.id, 'date', e.target.value)}
                                            className="w-36 px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                        />
                                    ) : formatDate(log.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {isEditingLogs ? (
                                        <input
                                            type="text"
                                            value={log.method}
                                            onChange={(e) => handleUpdateLog(log.id, 'method', e.target.value)}
                                            className="w-32 px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                        />
                                    ) : (
                                        <div className="flex items-center">
                                            <span className="material-icons text-xs mr-1 text-gray-400">account_balance</span>
                                            {log.method}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-500">
                                    {isEditingLogs ? (
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 text-xs">Rp</span>
                                            <input
                                                type="number"
                                                value={log.amount}
                                                onChange={(e) => handleUpdateLog(log.id, 'amount', Number(e.target.value))}
                                                className="w-32 px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                placeholder="0"
                                            />
                                        </div>
                                    ) : formatIDR(log.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {isEditingLogs ? (
                                        <select
                                            value={log.status}
                                            onChange={(e) => handleUpdateLog(log.id, 'status', e.target.value)}
                                            className="px-2 py-1 border rounded bg-white dark:bg-slate-800 dark:border-slate-700 text-xs"
                                        >
                                            <option value="Verified">Verified</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'Verified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                                            log.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                                                'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                            }`}>
                                            {log.status}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {isEditingLogs ? (
                                        <button
                                            onClick={() => handleDeleteLog(log.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <span className="material-icons text-lg">delete</span>
                                        </button>
                                    ) : (
                                        <a className="text-gray-400 hover:text-primary transition-colors" href="#"><span className="material-icons text-lg">print</span></a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isEditingLogs && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleAddLog}
                            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-icons">add_circle_outline</span> Tambah Log
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderClientDatabase = () => (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6 mt-auto">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Database Klien</h1>
                    <p className="text-slate-500 dark:text-slate-400">Kelola data klien dan riwayat proyek.</p>
                </div>
                <button
                    onClick={() => setIsEditingClients(!isEditingClients)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isEditingClients
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                >
                    <span className="material-icons-round text-sm">{isEditingClients ? 'check' : 'edit'}</span>
                    {isEditingClients ? 'Selesai' : 'Edit Mode'}
                </button>
            </div>

            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-gray-800">
                <div className="overflow-x-auto overflow-y-visible min-h">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-800">
                        <thead className="bg-slate-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama Klien</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kontak</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Alamat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proyek</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-gray-800">
                            {clientData.map((client) => (
                                <tr key={client.id} className={client.id === selectedClientId ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isEditingClients ? (
                                            <input
                                                type="text"
                                                value={client.name}
                                                onChange={(e) => handleUpdateClient(client.id, 'name', e.target.value)}
                                                className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-900 dark:text-white">{client.name}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isEditingClients ? (
                                            <select
                                                value={client.type}
                                                onChange={(e) => handleUpdateClient(client.id, 'type', e.target.value)}
                                                className="px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                            >
                                                <option value="Perorangan">Perorangan</option>
                                                <option value="Perusahaan">Perusahaan</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.type === 'Perusahaan' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {client.type}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {isEditingClients ? (
                                            <input
                                                type="text"
                                                value={client.contact}
                                                onChange={(e) => handleUpdateClient(client.id, 'contact', e.target.value)}
                                                className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                            />
                                        ) : client.contact}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {isEditingClients ? (
                                            <input
                                                type="text"
                                                value={client.email}
                                                onChange={(e) => handleUpdateClient(client.id, 'email', e.target.value)}
                                                className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                            />
                                        ) : client.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {isEditingClients ? (
                                            <input
                                                type="text"
                                                value={client.address}
                                                onChange={(e) => handleUpdateClient(client.id, 'address', e.target.value)}
                                                className="w-full px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                                            />
                                        ) : <span className="truncate max-w-xs block">{client.address}</span>}
                                    </td>
                                    <td className="px-1 py-4 text-sm text-slate-500 align-top">
                                        <div className="flex flex-col gap-2 min-w-[220px]">
                                            {isEditingClients ? (
                                                <ClientProjectSelect
                                                    client={client}
                                                    allProjects={projectsData}
                                                    onAddProject={(projectId) => {
                                                        setProjectsData(prev =>
                                                            prev.map(p => p.id === projectId ? { ...p, clientId: client.id } : p)
                                                        );
                                                    }}
                                                    onRemoveProject={(projectId) => {
                                                        setProjectsData(prev =>
                                                            prev.map(proj => proj.id === projectId ? { ...proj, clientId: null } : proj)
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {projectsData.filter(p => p.clientId === client.id).length > 0 ? (
                                                        projectsData.filter(p => p.clientId === client.id).map(p => (
                                                            <span key={p.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                                                {p.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">-</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {isEditingClients ? (
                                            <button
                                                onClick={() => handleDeleteClient(client.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const clientProjs = projectsData.filter(p => p.clientId === client.id);
                                                    setSelectedClientId(client.id);
                                                    if (clientProjs.length > 0) {
                                                        setSelectedProjectId(clientProjs[0].id);
                                                    }
                                                    setActiveTab('invoices');
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="flex items-center gap-1 text-primary hover:text-blue-700 transition-colors ml-auto"
                                            >
                                                Lihat Tagihan <span className="material-icons text-sm">arrow_forward</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {isEditingClients && (
                    <div className="p-4 border-t border-slate-200 dark:border-gray-700">
                        <button
                            onClick={handleAddClient}
                            className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-gray-700 rounded-lg text-slate-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-icons">add_circle_outline</span> Tambah Klien Baru
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-display antialiased h-screen flex overflow-hidden">
            <Sidebar activePage="invoice" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Invoice</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-card-dark transition-colors relative">
                            <span className="material-icons-round text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                    </div>
                </header>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark px-6 flex gap-6 sticky top-16 z-10">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'invoices'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Tagihan & Pembayaran
                    </button>
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'clients'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Database Klien
                    </button>
                </div >

                <div className="flex-1 overflow-y-scroll p-4 sm:p-8 custom-scrollbar">
                    {activeTab === 'invoices' && (
                        <div className="w-full px-4 sm:px-6 lg:px-8">
                            {/* Breadcrumb & Header */}
                            <div className="mb-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {activeProject?.name || 'Pilih Proyek'}
                                        </h1>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Klien: {activeClient.name} | {clientProjects.length} Proyek Terdaftar
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                                        {clientProjects.length > 1 && (
                                            <div className="flex items-center gap-2 bg-white dark:bg-card-dark p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-2">Switch Project</span>
                                                <select
                                                    value={selectedProjectId}
                                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                                    className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer py-1 pl-2 pr-8"
                                                >
                                                    {clientProjects.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors">
                                                <span className="material-icons text-sm mr-2">download</span>
                                                Export Laporan
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Project Context */}
                                <div className="lg:col-span-1 space-y-6">
                                    {renderClientCard()}
                                    {/* Mini Summary Card */}
                                    <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                                            <span className="material-icons text-9xl">account_balance_wallet</span>
                                        </div>
                                        <h3 className="text-blue-100 text-sm font-medium mb-1">Tagihan Jatuh Tempo</h3>
                                        <div className="text-3xl font-bold mb-4">Rp 450.000.000</div>
                                        <p className="text-blue-100 text-xs mb-4">Termin 3: Progress 60% (Struktur Atap)</p>
                                        <button className="w-full bg-white text-primary hover:bg-gray-100 py-2 rounded-lg text-sm font-semibold transition-colors">
                                            Kirim Pengingat
                                        </button>
                                    </div>
                                </div>
                                {/* Right Column: Timeline & Logs */}
                                <div className="lg:col-span-2 space-y-8">
                                    {renderTimeline()}
                                    {renderPaymentLogs()}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'clients' && renderClientDatabase()}
                </div>
            </main >

            <InvoiceGeneratorModal
                isOpen={showInvoiceModal}
                onClose={() => setShowInvoiceModal(false)}
                project={activeProject}
                termin={selectedTerminForInvoice}
                client={activeClient}
            />
        </div >
    );
}
