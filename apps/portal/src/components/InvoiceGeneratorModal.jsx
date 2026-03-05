import React from 'react';

export default function InvoiceGeneratorModal({ isOpen, onClose, project, termin, client }) {
    if (!isOpen) return null;

    // Use passed data or fallbacks
    const projectName = project?.name || 'Pembangunan Rumah Tinggal';
    const projectSub = project?.description || 'Biaya Bangun Tahap-3';
    const projectId = project?.code || 'INV/2024/2392';

    // Handle multiple terms (bulk) or single term
    const termins = Array.isArray(termin) ? termin : [termin];
    const isBulk = termins.length > 1;

    // Calculate Totals
    const terminsWithAmounts = termins.map(t => {
        const rawAmount = t?.amount || '338,963,366.00';
        const qty = t?.qty || 1;
        const discountPercent = t?.discount || 0;

        // Cleanup formatting to get integer
        const numericAmount = parseInt(rawAmount.replace(/[^0-9]/g, '')) || 338963366;

        // Calculation: (Price * Qty) - Discount
        const grossTotal = numericAmount * qty;
        const discountAmount = grossTotal * (discountPercent / 100);
        const netTotal = grossTotal - discountAmount;

        return {
            ...t,
            title: t?.title || projectName,
            description: t?.description || projectSub,
            amount: rawAmount,
            numericAmount,
            qty,
            discountPercent,
            netTotal
        };
    });

    const totalNumericAmount = terminsWithAmounts.reduce((sum, t) => sum + t.netTotal, 0);
    const ppn = 0; // Keeping 0 based on image "Pajak Rp 0.00"
    const total = totalNumericAmount + ppn;

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

    // Client Data
    const clientName = client?.name || 'David Wahyu Guretno';
    const clientAddress = client?.address?.split(',').map((line, i) => <div key={i}>{line.trim()}</div>) || (
        <>
            Perum Bumi Asri,<br />
            , <br />
            Phone : 08112214148
        </>
    );

    const currentDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Template State
    const [activeTab, setActiveTab] = React.useState('preview'); // 'preview' or 'template'
    const [template, setTemplate] = React.useState({
        companyName: 'RANCANG\nBANGUN\n123',
        companyAddress: 'Jl. Permata Permai IV No. 20 ,\nCisaranten Kulon, Arcamanik, Bandung,\nJawa barat, 40293',
        companyPhone: '089899128321',
        companyEmail: 'rancangdanbangun123@gmail.com',
        bankName: 'BCA',
        bankAccount: '8320310262',
        bankHolder: 'Galih Herprasetyo Aji',
        signatoryName: 'Galih Herprasetyo Aji',
        signatoryTitle: 'Direktur',
        signatoryCity: 'Bandung',
        companyLogo: null,
        stamp: null
    });

    const handleTemplateChange = (field, value) => {
        setTemplate(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (field, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTemplate(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-[#16202a] w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700/50 animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#16202a] shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-icons text-primary text-2xl">description</span>
                            Pratinjau Invoice
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100 dark:bg-[#0b1117]">

                    {/* Left Sidebar: Controls */}
                    <div className="w-full lg:w-[350px] flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-[#16202a]">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                Data Proyek
                            </button>
                            <button
                                onClick={() => setActiveTab('template')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'template' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                Template
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            {activeTab === 'preview' ? (
                                <div className="space-y-6">
                                    {/* RAB Summary Card */}
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Status Anggaran (RAB)</h3>
                                        <div className="bg-slate-50 dark:bg-[#1c2732] p-5 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm text-slate-500 dark:text-slate-400">Total Progres Tagihan</span>
                                                <span className="text-lg font-bold text-slate-900 dark:text-white">60%</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex mb-4">
                                                <div className="h-full bg-slate-400 dark:bg-slate-500 w-[30%]"></div>
                                                <div className="h-full bg-primary w-[30%]"></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-slate-400 text-xs">Total Kontrak</div>
                                                    <div className="font-semibold text-xs dark:text-slate-200">Rp 12.500.000.000</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-slate-400 text-xs">Sisa Tagihan</div>
                                                    <div className="font-semibold text-xs dark:text-slate-200">Rp 5.000.000.000</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Milestone Timeline */}
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Detail Termin</h3>
                                        {/* Simplified visual timeline for context */}
                                        <div className="space-y-4">
                                            {terminsWithAmounts.map((t, idx) => (
                                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700">
                                                    <div className="flex justify-between font-bold text-xs text-slate-700 dark:text-slate-200">
                                                        <span>{t.title}</span>
                                                        <span>{t.amount}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Template Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Identitas Perusahaan</h3>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Logo Perusahaan</label>
                                            <div className="space-y-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload('companyLogo', e)}
                                                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                />
                                                <textarea
                                                    value={template.companyName}
                                                    onChange={(e) => handleTemplateChange('companyName', e.target.value)}
                                                    className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                    rows={2}
                                                    placeholder="Nama Perusahaan (Teks Alternatif)"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Alamat</label>
                                            <textarea
                                                value={template.companyAddress}
                                                onChange={(e) => handleTemplateChange('companyAddress', e.target.value)}
                                                className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Telepon</label>
                                                <input
                                                    type="text"
                                                    value={template.companyPhone}
                                                    onChange={(e) => handleTemplateChange('companyPhone', e.target.value)}
                                                    className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                                                <input
                                                    type="text"
                                                    value={template.companyEmail}
                                                    onChange={(e) => handleTemplateChange('companyEmail', e.target.value)}
                                                    className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Informasi Pembayaran</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Bank</label>
                                                <input
                                                    type="text"
                                                    value={template.bankName}
                                                    onChange={(e) => handleTemplateChange('bankName', e.target.value)}
                                                    className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">No. Rekening</label>
                                                <input
                                                    type="text"
                                                    value={template.bankAccount}
                                                    onChange={(e) => handleTemplateChange('bankAccount', e.target.value)}
                                                    className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Atas Nama</label>
                                            <input
                                                type="text"
                                                value={template.bankHolder}
                                                onChange={(e) => handleTemplateChange('bankHolder', e.target.value)}
                                                className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2">Penandatangan</h3>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Stempel / Cap</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload('stamp', e)}
                                                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Nama</label>
                                                <input
                                                    type="text"
                                                    value={template.signatoryName} // Note: This state isn't used in preview yet, need to update preview
                                                    onChange={(e) => handleTemplateChange('signatoryName', e.target.value)}
                                                    className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Jabatan</label>
                                                <input
                                                    type="text"
                                                    value={template.signatoryTitle}
                                                    onChange={(e) => handleTemplateChange('signatoryTitle', e.target.value)}
                                                    className="w-full text-xs p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Document Preview Viewport */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center">

                        {/* THE INVOICE PAPER - A4 Aspect Ratio */}
                        <div className="bg-white text-black w-full max-w-[794px] min-h-[1123px] h-auto shadow-2xl p-12 text font-sans relative mx-auto box-border flex flex-col break-words" style={{ fontFamily: 'Arial, sans-serif' }}>

                            {/* Header Logo & Title */}
                            <div className="flex justify-between items-start mb-8 relative">
                                {/* Logo Placeholder */}
                                <div className="flex items-center gap-2">
                                    {template.companyLogo ? (
                                        <img src={template.companyLogo} alt="Company Logo" className="max-h-20 max-w-[200px] object-contain" />
                                    ) : (
                                        <div className="bg-neutral-900 text-white p-2 font-bold text-xs leading-tight w-32 whitespace-pre-line">
                                            {template.companyName}
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="text-center absolute left-1/2 -translate-x-1/2 top-4">
                                    <h1 className="text-2xl font-bold uppercase underline underline-offset-4 decoration-2">INVOICE</h1>
                                    <p className="font-bold text-sm mt-1">{projectId}</p>
                                </div>
                            </div>

                            {/* Customer & Dates Section */}
                            <div className="flex justify-between items-start mb-6">
                                {/* Kepada Yth Box */}
                                <div className="flex flex-col gap-1 w-[45%]">
                                    <p className="font-bold text-xs mb-1">Kepada Yth,</p>
                                    <div className="border-2 border-black p-3 h-32 text-xs font-bold leading-relaxed">
                                        {clientName}<br />
                                        {clientAddress}<br />
                                        {client.contact}
                                    </div>
                                </div>

                                {/* Dates Info */}
                                <div className="w-[45%] text-xs font-bold leading-relaxed mt-6">
                                    <div className="grid grid-cols-[140px_10px_1fr]">
                                        <span>Tanggal</span>
                                        <span>:</span>
                                        <span className="text-right">{currentDate}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_10px_1fr]">
                                        <span>PO/WO No.</span>
                                        <span>:</span>
                                        <span className="text-right"></span>
                                    </div>
                                    <div className="grid grid-cols-[140px_10px_1fr]">
                                        <span>Tanggal PO/WO</span>
                                        <span>:</span>
                                        <span className="text-right"></span>
                                    </div>
                                    <div className="grid grid-cols-[140px_10px_1fr]">
                                        <span>Metode Pembayaran</span>
                                        <span>:</span>
                                        <span className="text-right"></span>
                                    </div>
                                    <div className="grid grid-cols-[140px_10px_1fr]">
                                        <span>Tgl. Jatuh Tempo</span>
                                        <span>:</span>
                                        <span className="text-right">{dueDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Table */}
                            <table className="w-full table-fixed border-2 border-black border-collapse text-xs font-medium text-black mb-1">
                                <thead>
                                    <tr className="border-b-2 border-black bg-white text-center font-bold">
                                        <th className="border-r-2 border-black py-2 w-[40px] align-middle" rowSpan={2}>No.</th>
                                        <th className="border-r-2 border-black py-2 align-middle" rowSpan={2}>Deskripsi</th>
                                        <th className="border-r-2 border-black py-2 w-[70px] align-middle" rowSpan={2}>Kuantitas</th>
                                        <th className="border-r-2 border-black py-2 w-[50px] align-middle" rowSpan={2}>Diskon</th>
                                        <th className="border-r-2 border-black py-2 w-[50px] align-middle" rowSpan={2}>Pajak</th>
                                        <th className="py-2 border-b-2 border-black w-[180px]" colSpan={2}>Harga (Rp)</th>
                                    </tr>
                                    <tr className="border-b-2 border-black bg-white text-center font-bold">
                                        <th className="border-r-2 border-black py-1 w-[90px]">/ Unit</th>
                                        <th className="py-1 w-[90px]">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {terminsWithAmounts.map((item, idx) => (
                                        <tr key={idx} className="border-b-2 border-black">
                                            <td className="border-r-2 border-black p-2 text-center align-top">{idx + 1}</td>
                                            <td className="border-r-2 border-black p-2 font-bold align-top break-words">
                                                {item.title}<br />
                                                <span className="font-normal">{item.description}</span>
                                            </td>
                                            <td className="border-r-2 border-black p-2 text-center align-top">{item.qty}</td>
                                            <td className="border-r-2 border-black p-2 text-center align-top">{item.discountPercent}%</td>
                                            <td className="border-r-2 border-black p-2 text-center align-top">-</td>
                                            <td className="border-r-2 border-black p-2 text-right align-top break-words max-w-[90px]">{formatCurrency(item.numericAmount)}</td>
                                            <td className="p-2 text-right align-top break-words max-w-[90px]">{formatCurrency(item.netTotal)}</td>
                                        </tr>
                                    ))}
                                    {/* Empty filler rows to maintain grid lines (Visual separation) */}
                                    <tr className="h-[120px]">
                                        <td className="border-r-2 border-black p-2"></td>
                                        <td className="border-r-2 border-black p-2"></td>
                                        <td className="border-r-2 border-black p-2"></td>
                                        <td className="border-r-2 border-black p-2"></td>
                                        <td className="border-r-2 border-black p-2"></td>
                                        <td className="border-r-2 border-black p-2"></td>
                                        <td className="p-2"></td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Summary Footer */}
                            <div className="flex border-2 border-black border-t-2 mb-8">
                                {/* Terbilang Section */}
                                <div className="flex-1 border-r-2 border-black p-2">
                                    <div className="text-xs font-bold mb-1">Terbilang :</div>
                                    <div className="bg-slate-100 p-2 text-xs font-bold italic min-h-[40px] flex items-center">
                                        Tiga Ratus Tiga Puluh Delapan Juta Sembilan Ratus Enam Puluh Tiga Ribu Tiga Ratus Enam Puluh Enam Rupiah
                                    </div>
                                </div>
                                {/* Totals Section */}
                                <div className="w-[300px] text-xs font-bold">
                                    <div className="grid grid-cols-[1fr_120px] p-1 border-b border-black/20">
                                        <div className="text-right pr-2">Subtotal</div>
                                        <div className="text-right">Rp {formatCurrency(totalNumericAmount)}</div>
                                    </div>
                                    <div className="grid grid-cols-[1fr_120px] p-1 border-b border-black/20">
                                        <div className="text-right pr-2">Pajak</div>
                                        <div className="text-right">Rp 0.00</div>
                                    </div>
                                    <div className="grid grid-cols-[1fr_120px] p-1 border-b border-black/20">
                                        <div className="text-right pr-2">Total</div>
                                        <div className="text-right">Rp {formatCurrency(total)}</div>
                                    </div>
                                    <div className="grid grid-cols-[1fr_120px] p-1 border-b border-black/20">
                                        <div className="text-right pr-2">Pajak Inclusive</div>
                                        <div className="text-right">Rp 0.00</div>
                                    </div>
                                    <div className="grid grid-cols-[1fr_120px] p-1 bg-slate-100">
                                        <div className="text-right pr-2">Jumlah Tertagih</div>
                                        <div className="text-right">Rp {formatCurrency(total)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-auto pt-8">
                                {/* Left Info */}
                                <div className="text-xs font-bold w-[55%]">
                                    <p className="mb-8">
                                        Pembayaran mohon ditransfer via rekening :<br />
                                        <span className="ml-4">{template.bankName} {template.bankAccount} a.n {template.bankHolder}</span>
                                    </p>

                                    <div className="mt-8 space-y-1">
                                        <p>No. NPWP : 838326619423000</p>
                                        <p>Rancangbangun Arsitama Buana</p>
                                        <div className="whitespace-pre-line">{template.companyAddress}</div>
                                        <p>Indonesia,</p>
                                        <p>Telp : {template.companyPhone}</p>
                                        <p>Email : {template.companyEmail}</p>
                                    </div>
                                </div>

                                {/* Right Signature */}
                                <div className="text-center w-[200px] flex flex-col items-center">
                                    <p className="font-bold text-xs mb-8">Dengan Hormat</p>

                                    {/* Logo / Stamp */}
                                    <div className="w-24 h-16 relative my-4 flex items-center justify-center">
                                        {template.stamp ? (
                                            <img src={template.stamp} alt="Stamp" className="max-h-20 max-w-[120px] object-contain opacity-90 rotate-[-5deg]" />
                                        ) : (
                                            <div className="w-24 h-16 relative flex items-center justify-center">
                                                <div className="text-4xl font-black text-blue-600/80 tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>RB</div>
                                                <div className="absolute inset-0 border-4 border-blue-600/30 rounded-full -rotate-12"></div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="font-bold text-xs mt-4">{template.signatoryTitle}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Modal Footer (Actions) */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#16202a] flex justify-between items-center shrink-0 z-20">
                    <div className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                        Rancang Bangun 123 Format
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto justify-end">
                        <button className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm">
                            <span className="material-icons text-lg">download</span>
                            Download PDF
                        </button>
                        <button
                            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium shadow-lg shadow-primary/25 transition-all flex items-center gap-2 text-sm"
                            onClick={() => {
                                alert('Invoice sent!');
                                onClose();
                            }}
                        >
                            <span className="material-icons text-lg">send</span>
                            Kirim Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
