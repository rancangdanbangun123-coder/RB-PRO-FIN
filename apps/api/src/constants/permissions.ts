// All permission keys — mirrors frontend AuthContext.jsx
export const ALL_PERMISSION_KEYS = [
    // ── Pengguna ──
    { key: 'view_users', label: 'Lihat Pengguna', group: 'Pengguna' },
    { key: 'create_user', label: 'Tambah Pengguna', group: 'Pengguna' },
    { key: 'edit_user', label: 'Edit Pengguna', group: 'Pengguna' },
    { key: 'delete_user', label: 'Hapus Pengguna', group: 'Pengguna' },
    { key: 'manage_roles', label: 'Kelola Role', group: 'Pengguna' },
    // ── Proyek ──
    { key: 'view_proyek', label: 'Lihat Proyek', group: 'Proyek' },
    { key: 'create_proyek', label: 'Buat Proyek', group: 'Proyek' },
    { key: 'edit_proyek', label: 'Edit Proyek', group: 'Proyek' },
    { key: 'delete_proyek', label: 'Hapus Proyek', group: 'Proyek' },
    { key: 'view_all_projects', label: 'Lihat Semua Proyek', group: 'Proyek' },
    // ── Kategori ──
    { key: 'view_category', label: 'Lihat Kategori', group: 'Kategori' },
    { key: 'create_category', label: 'Buat Kategori', group: 'Kategori' },
    { key: 'delete_category', label: 'Hapus Kategori', group: 'Kategori' },
    { key: 'import_category', label: 'Import Kategori', group: 'Kategori' },
    // ── Material ──
    { key: 'view_logistik', label: 'Lihat Material', group: 'Material' },
    { key: 'create_material', label: 'Tambah Material', group: 'Material' },
    { key: 'edit_material', label: 'Edit Material', group: 'Material' },
    { key: 'delete_material', label: 'Hapus Material', group: 'Material' },
    { key: 'import_material', label: 'Import Material', group: 'Material' },
    // ── Pengadaan ──
    { key: 'create_procurement', label: 'Buat PR', group: 'Pengadaan' },
    { key: 'approve_pr', label: 'Persetujuan PR', group: 'Pengadaan' },
    { key: 'edit_procurement', label: 'Edit Pengadaan', group: 'Pengadaan' },
    { key: 'edit_own_procurement', label: 'Edit Pengadaan Sendiri', group: 'Pengadaan', parent: 'edit_procurement' },
    { key: 'delete_procurement', label: 'Hapus Pengadaan', group: 'Pengadaan' },
    { key: 'delete_own_procurement', label: 'Hapus Pengadaan Sendiri', group: 'Pengadaan', parent: 'delete_procurement' },
    { key: 'move_procurement', label: 'Pindah Fase', group: 'Pengadaan' },
    // ── Aset ──
    { key: 'create_asset', label: 'Tambah Aset', group: 'Aset' },
    { key: 'edit_asset', label: 'Edit Aset', group: 'Aset' },
    { key: 'delete_asset', label: 'Hapus Aset', group: 'Aset' },
    // ── Subkontraktor ──
    { key: 'create_subcon', label: 'Tambah Subkon', group: 'Subkontraktor' },
    { key: 'edit_subcon', label: 'Edit Subkon', group: 'Subkontraktor' },
    { key: 'delete_subcon', label: 'Hapus Subkon', group: 'Subkontraktor' },
    // ── Keuangan ──
    { key: 'view_keuangan', label: 'Lihat Keuangan', group: 'Keuangan' },
    { key: 'create_invoice', label: 'Buat Invoice', group: 'Keuangan' },
    { key: 'edit_invoice', label: 'Edit Invoice', group: 'Keuangan' },
    { key: 'delete_invoice', label: 'Hapus Invoice', group: 'Keuangan' },
    // ── Akuntansi ──
    { key: 'view_akuntansi', label: 'Lihat Akuntansi', group: 'Akuntansi' },
] as const;

// Default role-permission mappings (used by seed)
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: ALL_PERMISSION_KEYS.map((p) => p.key),
    project_manager: [
        'view_proyek', 'create_proyek', 'edit_proyek',
        'view_category', 'create_category',
        'view_logistik', 'create_material', 'edit_material', 'import_material',
        'create_procurement', 'approve_pr', 'edit_procurement', 'edit_own_procurement', 'delete_own_procurement', 'move_procurement',
        'create_asset', 'edit_asset',
        'create_subcon', 'edit_subcon',
        'view_akuntansi',
    ],
    finance: [
        'view_proyek', 'view_all_projects',
        'view_category',
        'view_logistik',
        'view_keuangan', 'create_invoice', 'edit_invoice', 'delete_invoice',
        'view_akuntansi',
    ],
    site_manager: [
        'view_proyek',
        'view_category', 'create_category',
        'view_logistik', 'create_material', 'edit_material',
        'create_procurement', 'edit_own_procurement', 'delete_own_procurement', 'move_procurement',
        'create_asset', 'edit_asset',
        'create_subcon', 'edit_subcon',
        'view_akuntansi',
    ],
};
