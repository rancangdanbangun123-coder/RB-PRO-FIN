import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_USERS } from '../data/userData';

const AuthContext = createContext(null);

// Permission map per role
// Admin: full access
// Project Manager: everything except user management and full keuangan, only own projects
// Finance: everything except user management
// Site Manager: Dashboard, Proyek (own), Kategori, Logistik. No full Keuangan, no Manajemen Pengguna.
const ROLE_PERMISSIONS = {
    'Admin': ['view_users', 'view_proyek', 'view_category', 'view_logistik', 'view_keuangan', 'view_akuntansi', 'view_all_projects'],
    'Project Manager': ['view_proyek', 'view_category', 'view_logistik', 'view_akuntansi'],
    'Finance': ['view_proyek', 'view_category', 'view_logistik', 'view_keuangan', 'view_akuntansi', 'view_all_projects'],
    'Site Manager': ['view_proyek', 'view_category', 'view_logistik', 'view_akuntansi'],
};

function getUsers() {
    const saved = localStorage.getItem('users');
    if (saved) return JSON.parse(saved);
    // Seed default users on first load
    localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = sessionStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    // Sync to sessionStorage whenever currentUser changes
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
        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Email sudah terdaftar' };
        }

        const newUser = {
            id: `USR-${Date.now()}`,
            name,
            email,
            password,
            role: 'Project Manager', // Default role for new signups
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
        const perms = ROLE_PERMISSIONS[role];
        if (!perms) {
            // Unknown/custom role — give basic access (like PM but no user management, no full keuangan)
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
