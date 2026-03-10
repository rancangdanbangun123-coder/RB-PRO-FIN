import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '../lib/auth-client';
import { api } from '../lib/api';

const AuthContext = createContext(null);

// All available permission keys with Indonesian labels, grouped by module
export const ALL_PERMISSIONS = [
    // ── Pengguna ──
    { key: 'view_users', label: 'Lihat Pengguna', icon: 'visibility', description: 'Akses halaman manajemen pengguna', group: 'Pengguna' },
    { key: 'create_user', label: 'Tambah Pengguna', icon: 'person_add', description: 'Buat akun pengguna baru', group: 'Pengguna' },
    { key: 'edit_user', label: 'Edit Pengguna', icon: 'edit', description: 'Ubah data pengguna', group: 'Pengguna' },
    { key: 'delete_user', label: 'Hapus Pengguna', icon: 'person_remove', description: 'Hapus akun pengguna', group: 'Pengguna' },
    { key: 'approve_user', label: 'Persetujuan Pengguna', icon: 'how_to_reg', description: 'Mengaktifkan pengguna baru & mengatur role', group: 'Pengguna' },
    { key: 'manage_roles', label: 'Kelola Role', icon: 'admin_panel_settings', description: 'Buat, edit, hapus role & wewenang', group: 'Pengguna' },
    // ── Proyek ──
    { key: 'view_proyek', label: 'Lihat Proyek', icon: 'visibility', description: 'Akses halaman proyek', group: 'Proyek' },
    { key: 'create_proyek', label: 'Buat Proyek', icon: 'add_circle', description: 'Buat proyek baru', group: 'Proyek' },
    { key: 'edit_proyek', label: 'Edit Proyek', icon: 'edit', description: 'Ubah data proyek', group: 'Proyek' },
    { key: 'delete_proyek', label: 'Hapus Proyek', icon: 'delete', description: 'Hapus proyek', group: 'Proyek' },
    { key: 'view_all_projects', label: 'Lihat Semua Proyek', icon: 'public', description: 'Lihat proyek seluruh organisasi', group: 'Proyek' },
    // ── Kategori ──
    { key: 'view_category', label: 'Lihat Kategori', icon: 'visibility', description: 'Akses halaman kategori', group: 'Kategori' },
    { key: 'create_category', label: 'Buat Kategori', icon: 'create_new_folder', description: 'Tambah kategori & sub-kategori', group: 'Kategori' },
    { key: 'delete_category', label: 'Hapus Kategori', icon: 'folder_delete', description: 'Hapus kategori & sub-kategori', group: 'Kategori' },
    { key: 'import_category', label: 'Import Kategori', icon: 'upload_file', description: 'Import data kategori dari file', group: 'Kategori' },
    // ── Material ──
    { key: 'view_logistik', label: 'Lihat Material', icon: 'visibility', description: 'Akses halaman material & logistik', group: 'Material' },
    { key: 'create_material', label: 'Tambah Material', icon: 'add_box', description: 'Tambah material baru', group: 'Material' },
    { key: 'edit_material', label: 'Edit Material', icon: 'edit', description: 'Ubah data material', group: 'Material' },
    { key: 'delete_material', label: 'Hapus Material', icon: 'delete', description: 'Hapus material', group: 'Material' },
    { key: 'import_material', label: 'Import Material', icon: 'upload_file', description: 'Import data material dari file', group: 'Material' },
    // ── Pengadaan ──
    { key: 'create_procurement', label: 'Buat PR', icon: 'add_shopping_cart', description: 'Buat permintaan pengadaan baru', group: 'Pengadaan' },
    { key: 'approve_pr', label: 'Persetujuan PR', icon: 'check_circle', description: 'Menyetujui PR & menentukan tipe pengadaan', group: 'Pengadaan' },
    { key: 'edit_procurement', label: 'Edit Pengadaan', icon: 'edit', description: 'Ubah item pengadaan (Semua)', group: 'Pengadaan' },
    { key: 'edit_own_procurement', label: 'Edit Pengadaan Sendiri', icon: 'edit_note', description: 'Ubah item pengadaan yang dibuat sendiri', group: 'Pengadaan', parent: 'edit_procurement' },
    { key: 'delete_procurement', label: 'Hapus Pengadaan', icon: 'delete', description: 'Hapus item pengadaan (Semua)', group: 'Pengadaan' },
    { key: 'delete_own_procurement', label: 'Hapus Pengadaan Sendiri', icon: 'delete_sweep', description: 'Hapus item pengadaan yang dibuat sendiri', group: 'Pengadaan', parent: 'delete_procurement' },
    { key: 'move_procurement', label: 'Pindah Fase', icon: 'swap_horiz', description: 'Pindahkan item antar fase pengadaan', group: 'Pengadaan' },
    // ── Aset ──
    { key: 'create_asset', label: 'Tambah Aset', icon: 'add_box', description: 'Tambah aset baru', group: 'Aset' },
    { key: 'edit_asset', label: 'Edit Aset', icon: 'edit', description: 'Ubah data aset', group: 'Aset' },
    { key: 'delete_asset', label: 'Hapus Aset', icon: 'delete', description: 'Hapus aset', group: 'Aset' },
    // ── Subkontraktor ──
    { key: 'create_subcon', label: 'Tambah Subkon', icon: 'group_add', description: 'Tambah subkontraktor baru', group: 'Subkontraktor' },
    { key: 'edit_subcon', label: 'Edit Subkon', icon: 'edit', description: 'Ubah data subkontraktor', group: 'Subkontraktor' },
    { key: 'delete_subcon', label: 'Hapus Subkon', icon: 'group_remove', description: 'Hapus subkontraktor', group: 'Subkontraktor' },
    // ── Keuangan ──
    { key: 'view_keuangan', label: 'Lihat Keuangan', icon: 'visibility', description: 'Akses halaman keuangan', group: 'Keuangan' },
    { key: 'create_invoice', label: 'Buat Invoice', icon: 'receipt_long', description: 'Buat invoice & termin baru', group: 'Keuangan' },
    { key: 'edit_invoice', label: 'Edit Invoice', icon: 'edit', description: 'Ubah data invoice', group: 'Keuangan' },
    { key: 'delete_invoice', label: 'Hapus Invoice', icon: 'delete', description: 'Hapus invoice & log pembayaran', group: 'Keuangan' },
    // ── Akuntansi ──
    { key: 'view_akuntansi', label: 'Lihat Akuntansi', icon: 'account_balance_wallet', description: 'Akses modul akuntansi', group: 'Akuntansi' },
];

const ALL_PERM_KEYS = ALL_PERMISSIONS.map(p => p.key);

// Default role-permission mapping (used as fallback)
const DEFAULT_ROLE_PERMISSIONS = {
    'Admin': [...ALL_PERM_KEYS],
    'Project Manager': [
        'view_proyek', 'create_proyek', 'edit_proyek',
        'view_category', 'create_category',
        'view_logistik', 'create_material', 'edit_material', 'import_material',
        'create_procurement', 'approve_pr', 'edit_procurement', 'edit_own_procurement', 'delete_own_procurement', 'move_procurement',
        'create_asset', 'edit_asset',
        'create_subcon', 'edit_subcon',
        'view_akuntansi',
    ],
    'Finance': [
        'view_proyek', 'view_all_projects',
        'view_category',
        'view_logistik',
        'view_keuangan', 'create_invoice', 'edit_invoice', 'delete_invoice',
        'view_akuntansi',
    ],
    'Site Manager': [
        'view_proyek',
        'view_category', 'create_category',
        'view_logistik', 'create_material', 'edit_material',
        'create_procurement', 'edit_own_procurement', 'delete_own_procurement', 'move_procurement',
        'create_asset', 'edit_asset',
        'create_subcon', 'edit_subcon',
        'view_akuntansi',
    ],
};

// Get role permissions — try API first, fall back to defaults
export function getRolePermissions() {
    // Return current cached permissions synchronously (for backwards compat)
    const saved = localStorage.getItem('rolePermissions');
    if (saved) return JSON.parse(saved);
    return { ...DEFAULT_ROLE_PERMISSIONS };
}

export function saveRolePermissions(rolePerms) {
    localStorage.setItem('rolePermissions', JSON.stringify(rolePerms));
    window.dispatchEvent(new Event('rolePermissionsUpdated'));
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [livePermissions, setLivePermissions] = useState(() => getRolePermissions());

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    async function checkSession() {
        try {
            const { data } = await authClient.getSession();
            if (data?.user) {
                setCurrentUser(data.user);
                // Only load permissions for active users
                if (data.user.status === 'Active') {
                    await loadPermissions();
                }
                return data.user;
            }
        } catch (err) {
            console.log('No active session');
        } finally {
            setLoading(false);
        }
        return null;
    }

    async function loadPermissions() {
        try {
            const roles = await api.permissions.listRoles();
            const rolePerms = {};
            for (const role of roles) {
                rolePerms[role.name] = (role.permissions || []).map(p => p.permissionKey);
            }
            setLivePermissions(rolePerms);
            localStorage.setItem('rolePermissions', JSON.stringify(rolePerms));
        } catch (err) {
            console.warn('Failed to load permissions from API, using defaults');
            setLivePermissions(DEFAULT_ROLE_PERMISSIONS);
        }
    }

    // Listen for local permission updates (from RoleManagement)
    useEffect(() => {
        const handler = () => {
            setLivePermissions(getRolePermissions());
        };
        window.addEventListener('rolePermissionsUpdated', handler);
        return () => window.removeEventListener('rolePermissionsUpdated', handler);
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const { data, error } = await authClient.signIn.email({ email, password });
            if (error) {
                return { success: false, error: error.message || 'Email atau password salah' };
            }
            setCurrentUser(data.user);
            if (data.user.status === 'Active') {
                await loadPermissions();
            }
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, error: err.message || 'Login gagal' };
        }
    }, []);

    const signup = useCallback(async (name, email, password) => {
        try {
            const { data, error } = await authClient.signUp.email({
                name,
                email,
                password,
            });
            if (error) {
                return { success: false, error: error.message || 'Pendaftaran gagal' };
            }
            // Re-fetch session to get the latest user data (auto-admin may have updated it)
            const sessionResult = await authClient.getSession();
            const freshUser = sessionResult?.data?.user || data.user;
            setCurrentUser(freshUser);
            if (freshUser.status === 'Active') {
                await loadPermissions();
            }
            return { success: true, user: freshUser };
        } catch (err) {
            return { success: false, error: err.message || 'Pendaftaran gagal' };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authClient.signOut();
        } catch (err) {
            console.error('Logout error:', err);
        }
        setCurrentUser(null);
    }, []);

    const hasPermission = useCallback((permission) => {
        if (!currentUser) return false;
        const role = currentUser.role;
        const perms = livePermissions[role];
        if (!perms) {
            return permission !== 'view_users' && permission !== 'view_all_projects' && permission !== 'view_keuangan';
        }
        return perms.includes(permission);
    }, [currentUser, livePermissions]);

    const isPending = currentUser && currentUser.status !== 'Active';

    const value = {
        currentUser,
        login,
        signup,
        logout,
        hasPermission,
        checkSession,
        isAuthenticated: !!currentUser,
        isPending,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
