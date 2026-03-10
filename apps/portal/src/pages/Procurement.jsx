import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { PROCUREMENT_TYPES, mapFromBoardColumn, isValidMove } from '../data/procurementFlows';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanCard from '../components/KanbanCard';
import ProcurementDetailModal from '../components/ProcurementDetailModal';
import CreatePRModal from '../components/CreatePRModal';
import ConfirmationModal from '../components/ConfirmationModal';
import PhaseTransitionModal from '../components/PhaseTransitionModal';
import EditItemModal from '../components/EditItemModal';
import HistoryModal from '../components/HistoryModal';
import Sidebar from '../components/Sidebar';

const initialData = {
    items: {
        'pr-1024': { id: 'pr-1024', code: '#PR-1024', type: 'Material', project: '113 - Ciwaruga', title: 'Semen Portland 50kg', vol: '200 Sak', est: 'Rp 14.000.000', urgent: true, userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRA8PN32cYatarc3DFYYGtEdd7d8g1OhWOadk5qmzUQEyT55b89oCprpKrj1fYEpcGMFj_xFLht0-cnWMOEqTcTSgNLyLpwGHiG2UYd8dyaTQYmsoexJ0HCSZRM07gaI_s49EYJWK2Rmayb87_qUsVCEiTiKOf6BuI9Zz-bDkv2fpvEWT4GbtdIZPqlHUux-4tTXsrd4xwYlU7fsQmYxO1oLNCyx0GVOflcmzl93vt2SIrpmptbJUUOPBrp-yhhYh6q026UpfJwgF8', stage: 'pr' },
        'pr-1025': { id: 'pr-1025', code: '#PR-1025', type: 'Material', project: '116 - Pesona Bali', title: 'Besi Ulir 13 Grade Full', vol: '100 Btg', est: 'Rp 12.000.000', time: '2h ago', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6VFjMf9UijAOWkBnm943BZTmxuX-wYpJj3TUxdBMWJcGMdaBbGcUVnohROt96AHbU8vKlRgrkuxAV0MS2zGl0NofsISDzmy5346NgQ3KHt34rn7kX3D8VbEDWDf073Vi2AhurWMPhtcjeAeCoLv9eNFaiERq1ql9xF5ZGTZdrqviSEqBQAC1XBn2D9j5KQbgRfnz2zgjMiibFDCQdKo3tw58NRHLB8ftNV2Q6W0tanHixzq9UlZZ8k6JERhI9NqvemV15ITQp2P8', stage: 'pr' },
        'po-0012': { id: 'po-0012', code: '#PO-0012', type: 'Material', project: '113 - Ciwaruga', title: 'Pasir Beton Lumajang', qty: '50 M3', total: 'Rp 14.000.000', store: 'PT Semen Nusantara', eta: '24 Okt 2023', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9yO1l8gh2O_AWoqxXD9RrbFx2B9Nt2eHepBkqK_rGynnAZ-sxPUTa-rnY3d13g19yEIfmom1xMpmbcu7u-V-0TRcA_OgzMkGV543BTs0bim_ZuQ58H4NCHV01Ik83_L058QC4Ki0D0Ew35FCigRp97qsPkoWfRtAvp1SAErGtUAIgZIIW9_KiLxipAfiRfTiG7NTPdDZQpMJlhv8RpqA_3tv5a3TH-wk8iE-9AlYzRijxj4uC0E-HkSxu4nK1xLS6vDZE6IerL6r', stage: 'po' },
        'inv-993': {
            id: 'inv-993', code: '#INV-993', type: 'Material', project: '113 - Ciwaruga', title: 'Wiremesh M8', vol: '500 Lembar', total: 'Rp 325.000.000', status: 'Dibayar Sebagian', bills: [
                { id: 1, label: 'Tagihan 1', amount: 'Rp 200.000.000', due: '2023-11-01', status: 'Lunas' },
                { id: 2, label: 'Tagihan 2', amount: 'Rp 125.000.000', due: '2023-12-01', status: 'Unpaid' },
            ], userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATwKZSAYvfPNu-FPVflOnemqQBDAyH5PiXUbvVpq-zxo9BeumCFlbxs1i3eifTRE6YVngrLI1bVt0DP3O-51pM5pY0nVdJmYetS6HL59MW-axqcnCFCHsrnI15QBOmIPaO7y3Bsgnm6K7xAQG0P7eAiR2azqjQ0Fxy2Hi1FGA-OWnBw6Rmj9p3CNe21qY1yI0oooEDZgnDxD2oUdVk0k9x8Rj9GDg2iGz2RSa5U0WZTQMi62aDBp70hpRgbSdeYoxr5_jRgTLxomwC', stage: 'invoice'
        },
        'inv-998': {
            id: 'inv-998', code: '#INV-998', type: 'Material', project: '116 - Pesona Bali', title: 'Kabel NYM 3x2.5mm', vol: '1000 Meter', total: 'Rp 15.000.000', status: 'Unpaid', bills: [
                { id: 1, label: 'Tagihan 1', amount: 'Rp 15.000.000', due: '2023-11-20', status: 'Unpaid' },
            ], userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_q8HhKA6LRO_ctAXqS3RASWeH0JCaOy9Hun-FRn2SZkdpK2Fa0iQdk5i6EcPV2fqcX2on3swESMZZIycuMK9T0RxzGrxd5WjahGWlFAf0KzEGt1MFlHZgMCIdJ3zQlh4L56GC2bjpfyCHaz0NpYrKkFpWsRXtN7Ie2XJFZSGw2X2FD5pwjfD4gIbfVXy3hINGeFpGIyEsNq_Vo0D1-gFceQNMfCwdW_TXQETpPGM5wKvlsAR7R8W36uLgSHzzFqhDKxNerxN9WpKS', stage: 'invoice'
        },
        'do-3321': { id: 'do-3321', code: '#DO-3321', type: 'Material', project: 'On Site', title: 'Pipa PVC AW 4"', vol: '40 Btg', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeb81wSA1MQlXU2cOtpyoOls10PmmuCc0_6Rf6Y0sYofe_tnYFPRc4ESaHPi-09r3ikP8mKuMesVSUtjk_QP87Zu6qDj1qtcIW8J3hseXZArE6UvL1G_8k_roOEVLddL4M56ieRmOLUWDUYQzuDQkdqj3aqvMVOCpGZJCFSzz4dMpMlQzZsbRrBL6r5yAzB66Lmt_vJMnmLrO4ZiXJlhMnY0MmSG_y6sPostPjOsjhj-39RAhJnGoliuSRhkwgpXQ7sGlekAhDbMO1', recv: 'Pak Mandor', checklist: { physical: true, doc: false }, stage: 'do' },
        'comp-002': { id: 'comp-002', code: '#COMP-002', type: 'Material', title: 'Saklar Ganda Panasonic', vol: '100 Pcs', total: 'Rp 2.500.000', done: true, stage: 'done' },
        'comp-001': { id: 'comp-001', code: '#COMP-001', type: 'Material', title: 'Besi Polos 8 KS', vol: '500 Btg', total: 'Rp 29.000.000', done: true, stage: 'done' },
    },
    columns: {
        'pr': { id: 'pr', title: 'PR (Permintaan)', itemIds: ['pr-1024', 'pr-1025'], color: 'slate', dotColor: 'bg-slate-400' },
        'approval': { id: 'approval', title: 'Approval PR', itemIds: [], color: 'blue', dotColor: 'bg-blue-500' },
        'po': { id: 'po', title: 'PO (Pesanan)', itemIds: ['po-0012'], color: 'primary', dotColor: 'bg-primary' },
        'invoice': { id: 'invoice', title: 'Invoice', itemIds: ['inv-993', 'inv-998'], color: 'orange', dotColor: 'bg-orange-500' },
        'do': { id: 'do', title: 'DO (Diterima)', itemIds: ['do-3321'], color: 'teal', dotColor: 'bg-teal-400' },
        'evaluation': { id: 'evaluation', title: 'Evaluasi', itemIds: [], color: 'yellow', dotColor: 'bg-yellow-400' },
        'done': { id: 'done', title: 'Selesai', itemIds: ['comp-002', 'comp-001'], color: 'green', dotColor: 'bg-green-500' },
    },
    columnOrder: ['pr', 'approval', 'po', 'invoice', 'do', 'evaluation', 'done']
};

// ─── Utility: Enforce Standard Phase Structure ────────────────────────────────────
// Strips away old UI properties and builds the exact structure needed for the target phase
const applyPhaseStandard = (item, destPhase, formValues, isForward, isEdit = false) => {
    // 1. Remove ALL phase-specific UI properties from the base item if NOT editing
    let baseItem;
    if (isEdit) {
        baseItem = { ...item };
    } else {
        const {
            due, progress, progressLabel, tags, est, store, total, eta, qty,
            status, recv, checklist, statusLabel, done,
            ...rest
        } = item;
        baseItem = rest;
    }

    // Helper to grab form value or historical value for backward moves
    const getVal = (key) => {
        if (formValues[key] !== undefined) return formValues[key];
        if (isEdit) return item[key];
        const history = baseItem.transitions || [];
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].to === destPhase && history[i].data && history[i].data[key] !== undefined) {
                return history[i].data[key];
            }
        }
        return null;
    };

    let phaseProps = {};

    switch (destPhase) {
        case 'po':
            phaseProps = {
                store: getVal('supplierName') || 'TBD Supplier',
                total: getVal('poValue') || baseItem.est || 'Rp 0',
                eta: getVal('eta') || 'TBD',
                qty: baseItem.vol // fallback
            };
            break;
        case 'invoice': {
            // Support multi-billed invoices via bills[] array
            let bills = getVal('bills');
            if (!bills || !Array.isArray(bills) || bills.length === 0) {
                // Backward compat: wrap single invoice into one bill
                const singleAmount = getVal('invoiceValue') || baseItem.total || 'Rp 0';
                const singleDue = getVal('invoiceDate') || 'TBD';
                bills = [{ id: 1, label: 'Tagihan 1', amount: singleAmount, due: singleDue, status: 'Unpaid' }];
            }
            // Derive aggregate status from bills
            const paidCount = bills.filter(b => b.status === 'Lunas').length;
            const aggStatus = paidCount === bills.length ? 'Lunas' : paidCount > 0 ? 'Dibayar Sebagian' : 'Unpaid';
            phaseProps = {
                bills,
                total: getVal('invoiceValue') || baseItem.total || 'Rp 0',
                status: aggStatus,
                due: bills[0]?.due || 'TBD'
            };
            break;
        }
        case 'do':
            phaseProps = {
                recv: getVal('recv') || getVal('receivedBy') || 'Menunggu',
                receivedDate: getVal('receivedDate') || null,
                notes: getVal('notes') || '',
                materialCondition: getVal('materialCondition') || {}
            };
            break;
        case 'evaluation':
            phaseProps = {
                statusLabel: getVal('rating') ? `Rating: ${getVal('rating')} Bintang` : 'Menunggu Evaluasi'
            };
            break;
        case 'report':
            phaseProps = {
                reportReceipt: getVal('reportReceipt') || '',
                reportTotal: getVal('reportTotal') || baseItem.total || 'Rp 0',
                reportNotes: getVal('reportNotes') || '',
                reportDate: getVal('reportDate') || null,
            };
            break;
        case 'asset_eval':
            phaseProps = {
                assetTag: getVal('assetTag') || '',
                assetCategory: getVal('assetCategory') || '',
                warranty: getVal('warranty') || '',
                assetLocation: getVal('assetLocation') || '',
                statusLabel: getVal('rating') ? `Rating: ${getVal('rating')} Bintang` : 'Menunggu Evaluasi Aset'
            };
            break;
        case 'done':
            phaseProps = {
                done: !!getVal('confirmComplete')
            };
            break;
        default:
            // PR and others: just restore basic est if we have it
            phaseProps = {
                est: item.est
            };
            break;
    }

    return { ...baseItem, ...phaseProps };
};

export default function Procurement() {
    const { currentUser, hasPermission } = useAuth();

    const [data, setData] = useState(initialData);
    const [projectsList, setProjectsList] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const [procData, projs] = await Promise.all([
                    api.procurement.list().catch(() => null),
                    api.projects.list().catch(() => []),
                ]);
                if (procData && procData.items) setData(procData);
                setProjectsList(projs || []);
            } catch (err) { console.error('Failed to load procurement:', err); }
        })();
    }, []);

    // Handle legacy LocalStorage migrations (cleanup old, inject new missing columns)
    useEffect(() => {
        let needsUpdate = false;

        setData(prev => {
            let newColumns = { ...prev.columns };
            let newOrder = [...prev.columnOrder];

            // 1. Cleanup legacy columns
            if (newColumns.rfq || newColumns.selection || newColumns.approval) {
                delete newColumns.rfq;
                delete newColumns.selection;
                delete newColumns.approval;
                newOrder = newOrder.filter(c => c !== 'rfq' && c !== 'selection' && c !== 'approval');

                // If any PRs were stuck in 'approval', move them back to 'pr'
                if (prev.columns.approval && prev.columns.approval.itemIds?.length > 0) {
                    if (newColumns.pr) {
                        newColumns.pr.itemIds = [...newColumns.pr.itemIds, ...prev.columns.approval.itemIds];
                    }
                }
                needsUpdate = true;
            }

            return needsUpdate ? { ...prev, columns: newColumns, columnOrder: newOrder } : prev;
        });
    }, []);

    const [selectedItem, setSelectedItem] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [filterProject, setFilterProject] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreatePROpen, setIsCreatePROpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null });
    const [pendingTransition, setPendingTransition] = useState(null); // { draggableId, source, destination }
    const [editingItem, setEditingItem] = useState(null); // the item currently being edited inline
    const [historyModalItem, setHistoryModalItem] = useState(null);
    const [approvalModalItem, setApprovalModalItem] = useState(null);

    // Extract unique projects
    const projects = ['All', ...new Set(Object.values(data.items).map(item => item.project).filter(Boolean))];

    const handleAddPR = (formData) => {
        const newItems = {};
        const newItemIds = [];

        if (formData.separateItems && formData.items.length > 1) {
            // Checkbox checked: create separate cards per item
            formData.items.forEach((item, index) => {
                const id = `pr-${Date.now()}-${index}`;
                newItemIds.push(id);
                newItems[id] = {
                    id: id,
                    code: `#PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    type: item.category,
                    project: formData.project,
                    title: item.name,
                    vol: `${item.qty} ${item.unit}`,
                    est: `Rp ${(item.price * item.qty).toLocaleString('id-ID')}`,
                    stage: 'pr',
                    created: new Date().toLocaleDateString('id-ID'),
                    createdBy: currentUser ? { name: currentUser.name, email: currentUser.email, role: currentUser.role } : { name: 'Sistem', role: '-' },
                    procurementType: formData.procurementType || 'major',
                    fastTrack: true
                };
            });
        } else if (formData.items.length > 0) {
            // Default: combine all items into one card
            const id = `pr-${Date.now()}`;
            newItemIds.push(id);

            const combinedTitle = formData.items.length === 1
                ? formData.items[0].name
                : `${formData.items[0].name} + ${formData.items.length - 1} item lainnya`;

            const totalEst = formData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

            newItems[id] = {
                id: id,
                code: `#PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                type: formData.items.length > 1 ? 'Gabungan' : (formData.items[0].category || 'Material'),
                project: formData.project,
                title: combinedTitle,
                vol: `${formData.items.length} Item`,
                est: `Rp ${totalEst.toLocaleString('id-ID')}`,
                stage: 'pr',
                created: new Date().toLocaleDateString('id-ID'),
                createdBy: currentUser ? { name: currentUser.name, email: currentUser.email, role: currentUser.role } : { name: 'Sistem', role: '-' },
                procurementType: formData.procurementType || 'major',
                rawItems: formData.items,
                fastTrack: true
            };
        }

        setData(prev => ({
            ...prev,
            items: { ...prev.items, ...newItems },
            columns: {
                ...prev.columns,
                pr: {
                    ...prev.columns.pr,
                    itemIds: [...prev.columns.pr.itemIds, ...newItemIds]
                }
            }
        }));
    };

    const handleApprovePR = (itemId, decision, notes) => {
        setData(prev => {
            const item = prev.items[itemId];
            if (!item) return prev;

            const decisionMap = {
                'Disetujui - Pengadaan Tim': 'major',
                'Disetujui - Pengadaan Mandiri (Kecil)': 'minor',
                'Disetujui - Pengadaan Aset': 'asset',
            };
            const newType = decisionMap[decision] || 'major';

            const updatedItem = {
                ...item,
                procurementType: newType,
                approvalStatus: decision,
                approvalNotes: notes,
                transitions: [
                    ...(item.transitions || []),
                    {
                        from: item.stage,
                        to: item.stage,
                        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                        movedBy: currentUser ? { name: currentUser.name, role: currentUser.role } : { name: 'Sistem', role: '-' },
                        action: 'Approval Decision',
                        data: { approvalDecision: decision, approvalNotes: notes }
                    }
                ]
            };

            return {
                ...prev,
                items: {
                    ...prev.items,
                    [itemId]: updatedItem
                }
            };
        });
        setApprovalModalItem(null);
    };

    const handleDeleteClick = (itemId) => {
        const item = data.items[itemId];
        if (!item) return;

        const canDeleteAll = hasPermission('delete_procurement');
        const canDeleteOwn = hasPermission('delete_own_procurement') && item.createdBy?.email === currentUser?.email;

        if (!canDeleteAll && !canDeleteOwn) {
            alert('Akses Ditolak: Anda tidak memiliki wewenang untuk menghapus pengadaan ini.');
            return;
        }

        setDeleteModal({ isOpen: true, itemId });
    };

    const confirmDelete = () => {
        if (!deleteModal.itemId) return;

        setData(prev => {
            const newItems = { ...prev.items };
            delete newItems[deleteModal.itemId];

            const newColumns = { ...prev.columns };
            Object.keys(newColumns).forEach(colId => {
                newColumns[colId].itemIds = newColumns[colId].itemIds.filter(id => id !== deleteModal.itemId);
            });

            return {
                ...prev,
                items: newItems,
                columns: newColumns
            };
        });
        setDeleteModal({ isOpen: false, itemId: null });
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!hasPermission('move_procurement')) {
            alert('Akses Ditolak: Anda tidak memiliki wewenang "Pindah Fase" (move_procurement).');
            return;
        }

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const start = data.columns[source.droppableId];
        const finish = data.columns[destination.droppableId];

        // Same column — reorder immediately, no popup needed
        if (start === finish) {
            const newItemIds = Array.from(start.itemIds);
            newItemIds.splice(source.index, 1);
            newItemIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...start, itemIds: newItemIds };
            setData(prev => ({
                ...prev,
                columns: { ...prev.columns, [newColumn.id]: newColumn },
            }));
            return;
        }

        // Fast Track logic: auto-jump RFQ/Selection to PO for all cards
        let destId = destination.droppableId;
        if (destId === 'rfq' || destId === 'selection') {
            destId = 'po';
        }

        // Flow-aware: map board column to the item's actual flow phase
        const draggedItem = data.items[draggableId];

        // Ensure PR items are approved before moving
        if (source.droppableId === 'pr' && destId !== 'pr' && !draggedItem?.approvalStatus) {
            alert('Item PR harus di-approve terlebih dahulu sebelum dipesankan (PO).');
            return;
        }

        const itemProcType = draggedItem?.procurementType || 'major';
        const actualDest = mapFromBoardColumn(destId, itemProcType);

        // Cross-column move — save as pending, show modal
        setPendingTransition({
            draggableId,
            source,
            destination: { ...destination, droppableId: actualDest }
        });
    };

    // Called when user confirms the phase-transition modal
    const handleConfirmTransition = (formValues) => {
        if (!pendingTransition) return;
        const { draggableId, source, destination } = pendingTransition;

        // The actual phase (may be report, asset_eval, etc.)
        const dest = destination.droppableId;

        // Map to the board column that actually exists in data.columns
        const boardColumnMap = { report: 'invoice', asset_eval: 'evaluation' };
        const sourceBoard = boardColumnMap[source.droppableId] || source.droppableId;
        const destBoard = boardColumnMap[dest] || dest;

        const start = data.columns[sourceBoard];
        const finish = data.columns[destBoard];

        if (!start || !finish) {
            setPendingTransition(null);
            return;
        }

        const startTaskIds = Array.from(start.itemIds);
        const realSourceIndex = startTaskIds.indexOf(draggableId);
        if (realSourceIndex !== -1) {
            startTaskIds.splice(realSourceIndex, 1);
        }
        const newStart = { ...start, itemIds: startTaskIds };

        const finishTaskIds = Array.from(finish.itemIds);
        finishTaskIds.push(draggableId);
        const newFinish = { ...finish, itemIds: finishTaskIds };

        const currentItem = data.items[draggableId];

        const COLUMN_ORDER = ['pr', 'rfq', 'selection', 'po', 'invoice', 'report', 'do', 'evaluation', 'asset_eval', 'done'];
        const isForward = COLUMN_ORDER.indexOf(dest) > COLUMN_ORDER.indexOf(source.droppableId);

        // Strip old phase UI properties and apply the new phase standard
        const standardizedItem = applyPhaseStandard(currentItem, dest, formValues, isForward);

        // Generate dynamic phase code
        const currentCode = currentItem.code || '';
        const dashIndex = currentCode.indexOf('-');
        const numericPart = dashIndex !== -1 ? currentCode.substring(dashIndex) : `-${Math.floor(Math.random() * 10000)}`;

        const prefixMap = {
            invoice: 'INV',
            evaluation: 'EVAL',
            selection: 'SEL',
            report: 'RPT',
            asset_eval: 'AST',
            approval: 'PR',
        };
        const destPrefix = prefixMap[dest] || dest.toUpperCase();
        const newCode = `#${destPrefix}${numericPart}`;

        // Merge form values + standardized props + update stage on the card
        const updatedItem = {
            ...standardizedItem,
            stage: dest,
            code: newCode,
            ...formValues,
            transitions: [
                ...(standardizedItem.transitions || []),
                {
                    from: source.droppableId,
                    to: dest,
                    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
                    movedBy: currentUser ? { name: currentUser.name, role: currentUser.role } : { name: 'Sistem', role: '-' },
                    data: formValues,
                }
            ]
        };

        // ─── Stamp procurementType from Approval Decision (PR → Approval) ──────
        if (dest === 'approval' && formValues.approvalDecision) {
            const decisionMap = {
                'Disetujui - Pengadaan Tim': 'major',
                'Disetujui - Pengadaan Mandiri (Kecil)': 'minor',
                'Disetujui - Pengadaan Aset': 'asset',
            };
            updatedItem.procurementType = decisionMap[formValues.approvalDecision] || 'major';
            updatedItem.approvalStatus = formValues.approvalDecision;
        }

        // ─── Auto-Transaction on Payment ──────────────────────────────────
        // When entering invoice phase or updating bills, auto-create transactions for "Lunas" bills
        if (formValues.bills && Array.isArray(formValues.bills)) {
            const oldBills = currentItem.bills || [];

            formValues.bills.forEach(async (bill, idx) => {
                const oldBill = oldBills[idx];
                const wasAlreadyPaid = oldBill?.status === 'Lunas';

                if (bill.status === 'Lunas' && !wasAlreadyPaid) {
                    const amountNum = parseInt((bill.amount || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
                    const match = projectsList.find(p => updatedItem.project && p.name === updatedItem.project);
                    const trx = {
                        id: `trx-auto-${draggableId}-bill${bill.id || idx}-${Date.now()}`,
                        type: 'out',
                        title: `Pembayaran ${updatedItem.code} - ${updatedItem.title || 'Material'}`,
                        amount: amountNum,
                        category: 'Pengadaan Material',
                        date: new Date().toLocaleDateString('id-ID'),
                        projectId: match?.id || 'all',
                        createdBy: 'Sistem (Auto-Procurement)',
                        notes: `Otomatis dari pengadaan ${updatedItem.code} - ${bill.label || 'Tagihan'}`,
                        procurementRef: draggableId,
                    };
                    try { await api.transactions.create(trx); } catch (e) { console.error(e); }
                }
            });
        }

        // Also auto-create transaction for Minor procurement report phase
        if (dest === 'report' && formValues.reportTotal) {
            const amountNum = parseInt((formValues.reportTotal || '0').toString().replace(/[^0-9]/g, ''), 10) || 0;
            if (amountNum > 0) {
                const match = projectsList.find(p => updatedItem.project && p.name === updatedItem.project);
                const trx = {
                    id: `trx-auto-${draggableId}-report-${Date.now()}`,
                    type: 'out',
                    title: `Pengadaan Kecil ${updatedItem.code} - ${updatedItem.title || 'Material'}`,
                    amount: amountNum,
                    category: 'Pengadaan Kecil',
                    date: formValues.reportDate || new Date().toLocaleDateString('id-ID'),
                    projectId: match?.id || 'all',
                    createdBy: 'Sistem (Auto-Procurement)',
                    notes: `Otomatis dari laporan pengadaan kecil ${updatedItem.code}`,
                    procurementRef: draggableId,
                };
                try { api.transactions.create(trx); } catch (e) { console.error(e); }
            }
        }

        setData(prev => ({
            ...prev,
            items: { ...prev.items, [draggableId]: updatedItem },
            columns: {
                ...prev.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        }));

        setPendingTransition(null);
    };

    const handleCancelTransition = () => {
        setPendingTransition(null);
    };

    // Called when the detail modal updates an item (e.g., toggling RFQ vendor replies)
    const handleUpdateItem = (updatedItem) => {
        setData(prev => ({
            ...prev,
            items: {
                ...prev.items,
                [updatedItem.id]: updatedItem
            }
        }));
        setSelectedItem(updatedItem); // keep modal in sync
    };

    const handleEditClick = (item) => {
        const canEditAll = hasPermission('edit_procurement');
        const canEditOwn = hasPermission('edit_own_procurement') && item.createdBy?.email === currentUser?.email;

        if (!canEditAll && !canEditOwn) {
            alert('Akses Ditolak: Anda tidak memiliki wewenang untuk mengedit pengadaan ini.');
            return;
        }

        setSelectedItem(null); // close detail modal
        setEditingItem(item);  // open edit modal
    };

    const handleConfirmEdit = (formValues) => {
        if (!editingItem) return;

        // Directly merge the explicitly mapped formValues into the item
        const updatedItem = {
            ...editingItem,
            ...formValues,
        };

        setData(prev => ({
            ...prev,
            items: {
                ...prev.items,
                [updatedItem.id]: updatedItem
            }
        }));
        setEditingItem(null);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white h-screen overflow-hidden flex">
            <Sidebar activePage="procurement" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />{/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">Papan Pengadaan</h1>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                        <div className="relative group">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            >
                                <span className="material-icons-round text-base text-slate-400">domain</span>
                                <span>{filterProject === 'All' ? 'Semua Proyek' : filterProject}</span>
                                <span className="material-icons-round text-base">expand_more</span>
                            </button>

                            {/* Project Dropdown */}
                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-border-dark py-1 z-20 max-h-64 overflow-y-auto custom-scrollbar">
                                        {projects.map(project => (
                                            <button
                                                key={project}
                                                onClick={() => {
                                                    setFilterProject(project);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-surface-dark-lighter transition-colors flex items-center justify-between ${project === filterProject ? 'text-primary font-medium bg-slate-50 dark:bg-surface-dark-lighter' : 'text-slate-600 dark:text-slate-300'}`}
                                            >
                                                <span className="truncate">{project === 'All' ? 'Semua Proyek' : project}</span>
                                                {project === filterProject && <span className="material-icons-round text-sm">check</span>}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-primary transition-colors">
                            <span className="material-icons-round text-slate-400 text-[20px]">search</span>
                            <input
                                className="bg-transparent border-none text-sm w-full focus:ring-0 text-slate-800 dark:text-white placeholder-slate-500 ml-2 outline-none"
                                placeholder="Cari material, ID..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm("Peringatan: Reset papan akan mengembalikan semua data ke versi bawaan demo (mock data) dan menghapus perubahan Anda. Lanjutkan?")) {
                                    setData(initialData);
                                }
                            }}
                            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-surface-dark-lighter dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            title="Reset Papan ke Data Awal"
                        >
                            <span className="material-icons-round text-[18px]">restore</span>
                            <span className="hidden sm:inline">Reset Papan</span>
                        </button>
                        <button className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-card-dark transition-colors relative" title="Notifikasi">
                            <span className="material-icons-round text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                        <button
                            onClick={() => setIsCreatePROpen(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
                        >
                            <span className="material-icons-round text-[18px]">add</span>
                            <span>Buat PR</span>
                        </button>
                    </div>
                </header>

                {/* Stats Bar */}
                <div className="bg-white dark:bg-background-dark border-b border-slate-200 dark:border-border-dark px-4 sm:px-6 py-2 flex items-center gap-6 overflow-x-auto">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Total Request: <span className="text-slate-900 dark:text-white ml-1">24 Item</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Pending PO: <span className="text-slate-900 dark:text-white ml-1">Rp 145.000.000</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Selesai Bulan Ini: <span className="text-slate-900 dark:text-white ml-1">8 Item</span>
                    </div>
                </div>

                {/* Kanban Board Container */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-background-light dark:bg-background-dark p-6 kanban-container">
                        <div className="flex h-full gap-4 min-w-max pb-2">
                            {data.columnOrder.map((columnId) => {
                                const column = data.columns[columnId];
                                const tasks = column.itemIds
                                    .map((taskId) => data.items[taskId])
                                    .filter(task => {
                                        // 1. Project filter
                                        if (filterProject !== 'All' && task.project !== filterProject) return false;

                                        // 2. Search query filter
                                        if (searchQuery.trim()) {
                                            const query = searchQuery.toLowerCase();
                                            const titleMatches = task.title && task.title.toLowerCase().includes(query);
                                            const codeMatches = task.code && task.code.toLowerCase().includes(query);
                                            const projectMatches = task.project && task.project.toLowerCase().includes(query);
                                            // Optional: check sub-items if it's a combined PR
                                            const rawItemsMatch = task.rawItems && task.rawItems.some(ri => ri.name && ri.name.toLowerCase().includes(query));

                                            if (!titleMatches && !codeMatches && !projectMatches && !rawItemsMatch) {
                                                return false;
                                            }
                                        }
                                        return true;
                                    });

                                return (
                                    <div key={column.id} className={`w-72 flex flex-col bg-slate-100 dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-border-dark h-full max-h-full ${column.id === 'done' ? 'opacity-70 hover:opacity-100 transition-opacity' : ''}`}>
                                        <div className={`p-3 flex items-center justify-between border-b border-slate-200 dark:border-border-dark ${column.id === 'po' ? 'bg-primary/10 rounded-t-xl' : ''} ${column.id === 'invoice' ? 'bg-orange-500/5 rounded-t-xl' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`}></span>
                                                <h3 className={`font-semibold text-sm ${column.id === 'po' ? 'text-primary' : (column.id === 'invoice' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-200')}`}>{column.title}</h3>
                                            </div>
                                            <span className={`${column.id === 'po' ? 'bg-primary/20 text-primary' : (column.id === 'invoice' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-slate-200 dark:bg-surface-dark-lighter text-slate-600 dark:text-slate-300')} text-xs font-medium px-2 py-0.5 rounded-full`}>{tasks.length}</span>
                                        </div>

                                        <Droppable droppableId={column.id}>
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar"
                                                >
                                                    {tasks.length === 0 && column.id === 'evaluation' && (
                                                        <div className="flex flex-col items-center justify-center text-slate-400 h-32">
                                                            <span className="material-icons-round text-4xl opacity-20">assignment_turned_in</span>
                                                            <span className="text-xs mt-2 opacity-50">Tidak ada item pending</span>
                                                        </div>
                                                    )}
                                                    {tasks.map((task, index) => (
                                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        opacity: 1,
                                                                        maxWidth: '18rem'
                                                                    }}
                                                                >
                                                                    <KanbanCard
                                                                        item={task}
                                                                        index={index}
                                                                        onClick={() => setSelectedItem(task)}
                                                                        onDelete={() => handleDeleteClick(task.id)}
                                                                        onViewHistory={() => setHistoryModalItem(task)}
                                                                        onApprove={hasPermission('approve_pr') ? () => setApprovalModalItem(task) : undefined}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                    {column.id === 'pr' && (
                                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-2">
                                                            <button
                                                                onClick={() => setIsCreatePROpen(true)}
                                                                className="w-full py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-slate-500 hover:text-primary hover:bg-slate-200 dark:hover:bg-surface-dark-lighter rounded transition-colors"
                                                            >
                                                                <span className="material-icons-round text-sm">add</span> Tambah Item
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DragDropContext>

                <ProcurementDetailModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    item={selectedItem}
                    onUpdateItem={handleUpdateItem}
                    onEditClick={handleEditClick}
                    onViewHistory={(item) => setHistoryModalItem(item)}
                />

                <CreatePRModal
                    isOpen={isCreatePROpen}
                    onClose={() => setIsCreatePROpen(false)}
                    projects={projects.filter(p => p !== 'All')}
                    onSubmit={handleAddPR}
                />

                <ConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
                    onConfirm={confirmDelete}
                    title="Hapus Item?"
                    message="Item yang dihapus tidak dapat dikembalikan. Lanjutkan?"
                    type="danger"
                />

                {/* Standard Phase Transition */}
                <PhaseTransitionModal
                    isOpen={!!pendingTransition}
                    onClose={handleCancelTransition}
                    onConfirm={handleConfirmTransition}
                    fromStage={pendingTransition?.source?.droppableId}
                    toStage={pendingTransition?.destination?.droppableId}
                    item={pendingTransition ? data.items[pendingTransition.draggableId] : null}
                />

                {/* Inline Editing */}
                <EditItemModal
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    item={editingItem}
                    onSubmit={handleConfirmEdit}
                />

                {/* History Modal */}
                <HistoryModal
                    isOpen={!!historyModalItem}
                    onClose={() => setHistoryModalItem(null)}
                    item={historyModalItem}
                />

                {/* Approval Modal */}
                {approvalModalItem && (
                    <div className="fixed inset-0 z-[60] flex justify-center bg-slate-900/50 backdrop-blur-sm p-4 pt-10 md:pt-20 overflow-y-auto">
                        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-xl w-full max-w-md h-fit my-auto">
                            <div className="p-4 md:p-5 border-b border-slate-100 dark:border-border-dark/50 flex justify-between items-center bg-slate-50/50 dark:bg-surface-dark-lighter rounded-t-xl">
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg flex items-center gap-2">
                                    <span className="material-icons-round text-primary text-xl">verified</span>
                                    Persetujuan PR
                                </h3>
                                <button onClick={() => setApprovalModalItem(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <span className="material-icons-round">close</span>
                                </button>
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const decision = formData.get('approvalDecision');
                                const notes = formData.get('approvalNotes');
                                handleApprovePR(approvalModalItem.id, decision, notes);
                            }} className="p-4 md:p-5 space-y-4">
                                <div className="mb-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-xs text-slate-500 mb-1">Item PR</p>
                                    <p className="text-sm font-semibold">{approvalModalItem.title}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Keputusan Approval PR <span className="text-red-500">*</span></label>
                                    <select name="approvalDecision" required className="w-full text-sm rounded-lg border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark focus:border-primary focus:ring-primary h-10 px-3">
                                        <option value="">Pilih Keputusan...</option>
                                        <option value="Disetujui - Pengadaan Tim">Disetujui - Pengadaan Tim (Besar)</option>
                                        <option value="Disetujui - Pengadaan Mandiri (Kecil)">Disetujui - Pengadaan Mandiri (Kecil)</option>
                                        <option value="Disetujui - Pengadaan Aset">Disetujui - Pengadaan Aset</option>
                                        <option value="Perlu Prasyarat">Perlu Prasyarat (Hold)</option>
                                        <option value="Ditolak">Ditolak</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catatan Approval</label>
                                    <textarea name="approvalNotes" rows="3" placeholder="Catatan opsional..." className="w-full text-sm rounded-lg border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark focus:border-primary focus:ring-primary p-3 resize-none"></textarea>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-border-dark/50 mt-6 md:mt-8">
                                    <button type="button" onClick={() => setApprovalModalItem(null)} className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Batal</button>
                                    <button type="submit" className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors flex items-center gap-1.5"><span className="material-icons-round text-[16px]">check_circle</span> Simpan Keputusan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
