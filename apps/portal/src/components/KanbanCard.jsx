import React from 'react';

export default function KanbanCard({ item, index, onClick, onDelete, onViewHistory, onApprove }) {
    // Helper to determine badge colors
    const getBadgeStyle = (type) => {
        if (type.includes('Material Struktur')) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800';
        if (type.includes('Aset')) return 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 border-purple-100 dark:border-purple-800';
        if (type.includes('Material Finishing')) return 'text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-300 border-teal-100 dark:border-teal-800';
        if (type.includes('Upah Kerja')) return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-300 border-rose-100 dark:border-rose-800';
        if (type.includes('MEP')) return 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-100 dark:border-cyan-800';
        return 'text-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-600';
    };

    return (
        <div onClick={onClick} className={`bg-white dark:bg-card-dark p-3 rounded-lg shadow-sm border border-slate-200 dark:border-border-dark group hover:border-primary/50 transition-colors cursor-pointer ${item.done ? 'grayscale hover:grayscale-0' : ''}`}>

            {/* Header: ID & Status/Menu */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-surface-dark-lighter/50 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{item.code}</span>
                </div>

                {/* Conditional Header Elements based on stage/data */}
                {item.urgent && (
                    <span className="material-icons-round text-slate-400 text-sm opacity-0 group-hover:opacity-100 cursor-pointer">more_horiz</span>
                )}
                {item.status === 'Unpaid' && (
                    <span className="text-[10px] font-bold text-red-500 border border-red-500/30 px-1.5 py-0.5 rounded uppercase">Unpaid</span>
                )}
                {item.status === 'Termin 1' && ( // Using status field for Termin as well for simplicity
                    <span className="text-[10px] font-medium text-orange-400 px-1.5 py-0.5 rounded uppercase">Termin 1</span>
                )}
                {item.project === 'On Site' && (
                    <span className="text-[10px] font-medium text-teal-500 bg-teal-500/10 px-1.5 py-0.5 rounded">On Site</span>
                )}

                {/* Default menu if nothing else */}
                {!item.status && !item.urgent && !item.project?.includes('On Site') && (
                    <span className="material-icons-round text-slate-400 text-sm opacity-0 group-hover:opacity-100 cursor-pointer">more_horiz</span>
                )}
                {item.stage === 'po' && (
                    <span className="material-icons-round text-green-500 text-sm">check_circle</span>
                )}

                <div className="flex gap-1 ml-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewHistory && onViewHistory();
                        }}
                        className="text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded hover:bg-primary/10"
                        title="Lihat Riwayat"
                    >
                        <span className="material-icons-round text-sm">history</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete && onDelete();
                        }}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Hapus / Reject"
                    >
                        <span className="material-icons-round text-sm">delete_outline</span>
                    </button>
                </div>
            </div>

            {/* Type & Project */}
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm border shrink-0 ${getBadgeStyle(item.type)}`}>
                        {item.type}
                    </span>
                    {item.procurementType === 'minor' && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">Kecil</span>
                    )}
                    {item.procurementType === 'asset' && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">Aset</span>
                    )}
                </div>
                {item.project && !item.project.includes('On Site') && !item.project.includes('Finance') && !item.project.includes('Termin') && (
                    <span className="text-[10px] text-slate-500 border border-slate-200 dark:border-border-dark rounded px-1.5 py-0.5 truncate max-w-[120px] font-medium">{item.project}</span>
                )}
            </div>

            {/* Title */}
            <h4 className={`text-sm font-medium text-slate-800 dark:text-white mb-1 leading-snug line-clamp-2 ${item.done ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                {item.title}
            </h4>

            {/* Vol & Cost / Specific Phase Content */}
            <div className="mt-3 mb-3">
                {/* PR Phase */}
                {item.stage === 'pr' && (
                    <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-surface-dark-lighter/50 p-2 rounded border border-slate-100 dark:border-border-dark/50">
                        <div className="flex flex-col">
                            <span className="text-slate-500 dark:text-slate-400">Volume Request</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.qty ? `${item.qty}` : item.vol}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-slate-500 dark:text-slate-400">Est. Budget</span>
                            <span className="font-bold text-slate-900 dark:text-white">{item.est?.replace('Est: ', '') || '-'}</span>
                        </div>
                    </div>
                )}



                {/* PO Phase */}
                {item.stage === 'po' && (
                    <div className="bg-primary/5 p-2 rounded border border-primary/20 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1"><span className="material-icons-round text-[12px] text-primary">store</span> Supplier</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pl-2">{item.store || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-primary/10">
                            <span className="text-slate-500 flex items-center gap-1"><span className="material-icons-round text-[12px] text-primary">local_shipping</span> Max ETA</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.eta || 'TBD'}</span>
                        </div>
                        <div className="bg-white dark:bg-card-dark rounded px-2 py-1.5 mt-1 border border-primary/10 flex justify-between items-center shadow-sm">
                            <span className="text-[10px] font-bold uppercase text-slate-500">Total PO</span>
                            <span className="font-bold text-primary text-sm">{item.total || item.est || 'Rp 0'}</span>
                        </div>
                    </div>
                )}

                {/* Invoice Phase */}
                {item.stage === 'invoice' && (() => {
                    const bills = item.bills || [];
                    const hasBills = bills.length > 0;
                    const paidCount = hasBills ? bills.filter(b => b.status === 'Lunas').length : 0;
                    const paidPercent = hasBills ? Math.round((paidCount / bills.length) * 100) : 0;
                    const displayStatus = hasBills
                        ? (paidCount === bills.length ? 'Lunas' : paidCount > 0 ? `${paidCount}/${bills.length} Lunas` : 'Unpaid')
                        : (item.status || 'Unpaid');

                    return (
                        <div className="bg-orange-50 dark:bg-orange-900/10 p-2 rounded border border-orange-100 dark:border-orange-800/30 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 flex items-center gap-1"><span className="material-icons-round text-[12px] text-orange-500">receipt_long</span> Status</span>
                                <span className={`font-semibold ${paidCount === bills.length && hasBills ? 'text-green-500' : paidCount > 0 ? 'text-orange-500' : 'text-red-500'} truncate pl-2`}>
                                    {displayStatus}
                                </span>
                            </div>
                            {hasBills && bills.length > 1 && (
                                <div className="flex items-center gap-2 text-xs pt-1 border-t border-orange-100 dark:border-orange-800/30">
                                    <span className="text-slate-500 flex items-center gap-1">
                                        <span className="material-icons-round text-[12px] text-orange-500">format_list_numbered</span>
                                        {bills.length} Tagihan
                                    </span>
                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${paidPercent}%` }}></div>
                                    </div>
                                </div>
                            )}
                            {hasBills && bills.length === 1 && (
                                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-orange-100 dark:border-orange-800/30">
                                    <span className="text-slate-500 flex items-center gap-1"><span className="material-icons-round text-[12px] text-orange-500">event</span> Jatuh Tempo</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{bills[0]?.due || item.due?.replace('Due: ', '') || 'TBD'}</span>
                                </div>
                            )}
                            <div className="bg-white dark:bg-card-dark rounded px-2 py-1.5 mt-1 border border-orange-100 dark:border-orange-800/20 flex justify-between items-center shadow-sm">
                                <span className="text-[10px] font-bold uppercase text-slate-500">Tagihan Total</span>
                                <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">{item.total || item.invoiceValue || 'Rp 0'}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* DO Phase */}
                {item.stage === 'do' && (() => {
                    const conditions = item.materialCondition || {};
                    const conditionValues = Object.values(conditions);
                    const hasData = conditionValues.length > 0;
                    const isAllSesuai = hasData && conditionValues.every(v => v === 'sesuai');
                    const isAnyTidakSesuai = hasData && conditionValues.some(v => v === 'tidak_sesuai');

                    return (
                        <div className="bg-teal-50 dark:bg-teal-900/10 p-2 rounded border border-teal-100 dark:border-teal-800/30 flex flex-col gap-1.5">
                            {item.receivedDate ? (
                                <>
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                            <span className="material-icons-round text-[14px] text-teal-500">
                                                event_available
                                            </span>
                                            Waktu Diterima
                                        </span>
                                        <span className="text-teal-600 font-medium">
                                            {new Date(item.receivedDate).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-teal-100 dark:border-teal-800/30">
                                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                            <span className={`material-icons-round text-[14px] ${isAllSesuai ? 'text-green-500' : isAnyTidakSesuai ? 'text-red-500' : 'text-teal-500'}`}>
                                                {isAllSesuai ? 'check_circle' : isAnyTidakSesuai ? 'error' : 'inventory_2'}
                                            </span>
                                            Kondisi Fisik
                                        </span>
                                        <span className={`font-medium ${isAllSesuai ? 'text-green-600' : isAnyTidakSesuai ? 'text-red-600' : 'text-teal-600'}`}>
                                            {isAllSesuai ? 'Semua Sesuai' : isAnyTidakSesuai ? 'Ada Masalah' : 'Dicek'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-xs text-slate-500 italic text-center py-2">Menunggu kedatangan di site...</div>
                            )}
                        </div>
                    );
                })()}

                {/* Evaluation Phase */}
                {item.stage === 'evaluation' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-100 dark:border-yellow-800/30 flex flex-col items-center justify-center gap-2">
                        <span className="text-xs text-slate-500">Penilaian Vendor</span>
                        <div className="flex text-yellow-500 text-lg">
                            <span className="material-icons-round">star</span>
                            <span className="material-icons-round">star</span>
                            <span className="material-icons-round">star</span>
                            <span className="material-icons-round">star</span>
                            <span className="material-icons-round">star_border</span>
                        </div>
                    </div>
                )}

                {/* Done Phase */}
                {item.stage === 'done' && (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-100 dark:border-green-800/30">
                        <span className="text-xs text-slate-500">Total Beli</span>
                        <span className="font-bold text-green-700 dark:text-green-500">{item.total || item.est || 'Rp 0'}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-border-dark/50 pt-2">
                {/* Left Side: Creator Info */}
                <div className="flex items-center gap-2">
                    {item.createdBy ? (
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-bold uppercase shrink-0 border border-primary/20">
                                {item.createdBy.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[90px]">{item.createdBy.name}</span>
                        </div>
                    ) : item.userAvatar ? (
                        <img alt="Avatar" className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-600" src={item.userAvatar} />
                    ) : null}

                    {item.time && !item.done && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><span className="material-icons-round text-[10px]">schedule</span>{item.time}</span>
                    )}

                    {item.recv && item.stage === 'do' && (
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-surface-dark-lighter px-1.5 py-0.5 rounded truncate max-w-[80px]">Oleh: {item.recv}</span>
                    )}
                </div>

                {/* Right Side: Action Button or Status */}
                <div>
                    {item.stage === 'pr' && !item.approvalStatus && onApprove && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onApprove(); }}
                            className="text-[10px] font-bold bg-blue-500 text-white px-2.5 py-1.5 rounded shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                            <span className="material-icons-round text-[14px]">verified</span> Approve
                        </button>
                    )}
                    {item.stage === 'pr' && item.approvalStatus && (
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded flex items-center gap-1 border border-blue-100 dark:border-blue-800/30">
                            <span className="material-icons-round text-[12px]">check_circle</span> Approved
                        </span>
                    )}

                    {item.stage === 'po' && (
                        <button className="text-[10px] font-medium text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">print</span> PO
                        </button>
                    )}
                    {item.stage === 'invoice' && item.status === 'Unpaid' && (
                        <button className="text-[10px] font-medium bg-orange-500 text-white px-2.5 py-1 rounded shadow-sm hover:bg-orange-600 transition-colors">Bayar</button>
                    )}
                </div>
            </div>

            {item.done && (
                <div className="flex flex-col gap-1 w-full mt-3">
                    <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500 bg-green-500/10 px-2 py-1 rounded justify-center">
                        <span className="material-icons-round text-[12px]">done_all</span>
                        Selesai & Lunas
                    </div>
                    {item.rating > 0 && (
                        <div className="flex items-center justify-center gap-1 text-[10px] text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                            <span className="material-icons-round text-[12px]">star</span>
                            Rating: {item.rating}/5
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
