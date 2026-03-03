
export const ASSET_REQUESTS = [
    {
        id: 'REQ-2023-001',
        assetId: 'AST-2021-012',
        assetName: 'Scaffolding Set',
        projectId: '116',
        projectName: '116 - Pesona Bali',
        requester: 'Pak Budi (PM)',
        requestDate: '2023-10-15',
        status: 'Pending',
        qty: 10,
        notes: 'Butuh tambahan untuk lantai 2',
        history: [
            { status: 'Pending', date: '2023-10-15 09:00', actor: 'Pak Budi', note: 'Pengajuan dibuat' }
        ]
    },
    {
        id: 'REQ-2023-002',
        assetId: 'AST-2022-005',
        assetName: 'Genset 5000W',
        projectId: '115',
        projectName: '115 - Bojongkoneng',
        requester: 'Bu Siti (Logistik)',
        requestDate: '2023-10-10',
        status: 'In Transit',
        qty: 1,
        notes: 'Pengganti unit rusak',
        history: [
            { status: 'Pending', date: '2023-10-10 10:00', actor: 'Bu Siti', note: 'Pengajuan dibuat' },
            { status: 'Approved', date: '2023-10-11 14:00', actor: 'Pak Joko (Gudang)', note: 'Disetujui' },
            { status: 'In Transit', date: '2023-10-12 08:30', actor: 'Kurir JNE', note: 'Barang dikirim' }
        ]
    },
    {
        id: 'REQ-2023-003',
        assetId: 'AST-2023-001',
        assetName: 'Bor Listrik Heavy Duty',
        projectId: '117',
        projectName: '117 - Dago Pakar',
        requester: 'Mandor Asep',
        requestDate: '2023-10-01',
        status: 'Completed',
        qty: 2,
        notes: 'Pekerjaan instalasi listrik',
        history: [
            { status: 'Pending', date: '2023-10-01 08:00', actor: 'Mandor Asep', note: 'Pengajuan dibuat' },
            { status: 'Approved', date: '2023-10-01 09:30', actor: 'Pak Joko', note: 'Disetujui' },
            { status: 'In Transit', date: '2023-10-02 10:00', actor: 'Driver Kantor', note: 'Dikirim' },
            { status: 'Deployed', date: '2023-10-02 13:00', actor: 'Admin Proyek', note: 'Diterima di lokasi' },
            { status: 'Completed', date: '2023-10-14 16:00', actor: 'Admin Proyek', note: 'Dikembalikan ke gudang' }
        ]
    }
];
