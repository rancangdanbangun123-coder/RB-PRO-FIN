import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_USERS } from '../data/userData';

const AuthContext = createContext(null);

// All available permission keys with Indonesian labels for the UI
export const ALL_PERMISSIONS = [
    { key: 'view_users', label: 'Manajemen Pengguna', icon: 'manage_accounts', description: 'Kelola data pengguna dan wewenang' },
    { key: 'view_proyek', label: 'Proyek', icon: 'assignment', description: 'Akses halaman proyek' },
    { key: 'view_category', label: 'Kategori', icon: 'category', description: 'Kelola kategori & sub-kategori' },
    { key: 'view_logistik', label: 'Logistik', icon: 'local_shipping', description: 'Material, Aset, Pengadaan, Subkontraktor' },
    { key: 'view_keuangan', label: 'Keuangan', icon: 'receipt', description: 'Invoice & Laporan' },
    { key: 'view_akuntansi', label: 'Akuntansi', icon: 'account_balance_wallet', description: 'Akses modul akuntansi' },
    { key: 'view_all_projects', label: 'Lihat Semua Proyek', icon: 'visibility', description: 'Lihat proyek seluruh organisasi' },
];

// Default role-permission mapping (seeded on first load)
const DEFAULT_ROLE_PERMISSIONS = {
    'Admin': ['view_users', 'view_proyek', 'view_category', 'view_logistik', 'view_keuangan', 'view_akuntansi', 'view_all_projects'],
    'Project Manager': ['view_proyek', 'view_category', 'view_logistik', 'view_akuntansi'],
    'Finance': ['view_proyek', 'view_category', 'view_logistik', 'view_keuangan', 'view_akuntansi', 'view_all_projects'],
    'Site Manager': ['view_proyek', 'view_category', 'view_logistik', 'view_akuntansi'],
};

// Read or seed role permissions from localStorage
export function getRolePermissions() {
    const saved = localStorage.getItem('rolePermissions');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('rolePermissions', JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
    return { ...DEFAULT_ROLE_PERMISSIONS };
}

export function saveRolePermissions(rolePerms) {
    localStorage.setItem('rolePermissions', JSON.stringify(rolePerms));
    window.dispatchEvent(new Event('rolePermissionsUpdated'));
}

function getUsers() {
    const saved = localStorage.getItem('users');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = sessionStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    // Force re-render when role permissions change
    const [, setPermTick] = useState(0);
    useEffect(() => {
        const handler = () => setPermTick(t => t + 1);
        window.addEventListener('rolePermissionsUpdated', handler);
        return () => window.removeEventListener('rolePermissionsUpdated', handler);
    }, []);

    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const login = useCallback((email, password) => {
        const users = getUsers();
        const user = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) {
            return { success: false, error: 'Email atau password salah' };
        }
        if (user.status && user.status !== 'Active') {
            return { success: false, error: 'Akun Anda tidak aktif. Hubungi admin.' };
        }
        setCurrentUser(user);
        return { success: true, user };
    }, []);

    const signup = useCallback((name, email, password) => {
        const users = getUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Email sudah terdaftar' };
        }

        const newUser = {
            id: `USR-${Date.now()}`,
            name,
            email,
            password,
            role: 'Project Manager',
            status: 'Active',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        window.dispatchEvent(new Event('storage'));
        setCurrentUser(newUser);
        return { success: true, user: newUser };
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    }, []);

    const hasPermission = useCallback((permission) => {
        if (!currentUser) return false;
        const role = currentUser.role;
        const rolePerms = getRolePermissions();
        const perms = rolePerms[role];
        if (!perms) {
            // Unknown role — basic access only
            return permission !== 'view_users' && permission !== 'view_all_projects' && permission !== 'view_keuangan';
        }
        return perms.includes(permission);
    }, [currentUser]);

    const value = {
        currentUser,
        login,
        signup,
        logout,
        hasPermission,
        isAuthenticated: !!currentUser,
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
