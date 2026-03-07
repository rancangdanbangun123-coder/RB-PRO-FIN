import React, { useState, useEffect } from 'react';
import { ALL_PERMISSIONS, getRolePermissions, saveRolePermissions } from '../context/AuthContext';
import { DEFAULT_USERS } from '../data/userData';

export default function RoleManagement() {
    const [rolePerms, setRolePerms] = useState(() => getRolePermissions());
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [expandedRole, setExpandedRole] = useState(null);
    const [toast, setToast] = useState(null);

    // Listen for external changes
    useEffect(() => {
        const handler = () => setRolePerms(getRolePermissions());
        window.addEventListener('rolePermissionsUpdated', handler);
        return () => window.removeEventListener('rolePermissionsUpdated', handler);
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const roleNames = Object.keys(rolePerms);

    // Count users per role
    const getUserCount = (roleName) => {
        const saved = localStorage.getItem('users');
        const users = saved ? JSON.parse(saved) : DEFAULT_USERS;
        return users.filter(u => u.role === roleName).length;
    };

    const togglePermission = (roleName, permKey) => {
        // Prevent removing any permission from Admin
        if (roleName === 'Admin') {
            showToast('Role Admin tidak dapat diubah', 'error');
            return;
        }
        const current = rolePerms[roleName] || [];
        const updated = current.includes(permKey)
            ? current.filter(p => p !== permKey)
            : [...current, permKey];
        const newPerms = { ...rolePerms, [roleName]: updated };
        setRolePerms(newPerms);
        saveRolePermissions(newPerms);
    };

    const handleAddRole = () => {
        const trimmed = newRoleName.trim();
        if (!trimmed) return;
        if (roleNames.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
            showToast('Role sudah ada', 'error');
            return;
        }
        const newPerms = { ...rolePerms, [trimmed]: ['view_proyek'] };
        setRolePerms(newPerms);
        saveRolePermissions(newPerms);
        setNewRoleName('');
        setIsAddingRole(false);
        setExpandedRole(trimmed);
        showToast(`Role "${trimmed}" berhasil dibuat`);
    };

    const handleDeleteRole = (roleName) => {
        if (roleName === 'Admin') {
            showToast('Role Admin tidak dapat dihapus', 'error');
            return;
        }
        const userCount = getUserCount(roleName);
        const confirmMsg = userCount > 0
            ? `Hapus role "${roleName}"? ${userCount} pengguna akan dipindahkan ke "Project Manager".`
            : `Hapus role "${roleName}"?`;
        if (!window.confirm(confirmMsg)) return;

        // Reassign users to Project Manager
        if (userCount > 0) {
            const saved = localStorage.getItem('users');
            const users = saved ? JSON.parse(saved) : [];
            const updated = users.map(u => u.role === roleName ? { ...u, role: 'Project Manager' } : u);
            localStorage.setItem('users', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
        }

        // Remove from customRoles too (for UserModal backward compat)
        const customRoles = JSON.parse(localStorage.getItem('customRoles') || '[]');
        localStorage.setItem('customRoles', JSON.stringify(customRoles.filter(r => r !== roleName)));

        const { [roleName]: _, ...rest } = rolePerms;
        setRolePerms(rest);
        saveRolePermissions(rest);
        if (expandedRole === roleName) setExpandedRole(null);
        showToast(`Role "${roleName}" berhasil dihapus`);
    };

    const isSystemRole = (name) => ['Admin', 'Project Manager', 'Finance', 'Site Manager'].includes(name);

    const getRoleColor = (name) => {
        const colors = {
            'Admin': { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20', accent: 'bg-purple-500' },
            'Project Manager': { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20', accent: 'bg-blue-500' },
            'Finance': { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', accent: 'bg-emerald-500' },
            'Site Manager': { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20', accent: 'bg-amber-500' },
        };
        return colors[name] || { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', accent: 'bg-indigo-500' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Role</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Kelola wewenang akses setiap role dalam sistem.
                    </p>
                </div>
                {isAddingRole ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddRole();
                                if (e.key === 'Escape') { setIsAddingRole(false); setNewRoleName(''); }
                            }}
                            autoFocus
                            className="px-4 py-2 bg-white dark:bg-background-dark border border-primary/50 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            placeholder="Nama role baru..."
                        />
                        <button
                            onClick={handleAddRole}
                            disabled={!newRoleName.trim()}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            Simpan
                        </button>
                        <button
                            onClick={() => { setIsAddingRole(false); setNewRoleName(''); }}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
                        >
                            Batal
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingRole(true)}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm shadow-primary/20 hover:shadow-primary/30 active:scale-95 text-sm"
                    >
                        <span className="material-icons-round text-[20px]">add</span>
                        Role Baru
                    </button>
                )}
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 gap-4">
                {roleNames.map(roleName => {
                    const perms = rolePerms[roleName] || [];
                    const userCount = getUserCount(roleName);
                    const isExpanded = expandedRole === roleName;
                    const color = getRoleColor(roleName);
                    const isAdmin = roleName === 'Admin';

                    return (
                        <div
                            key={roleName}
                            className={`bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/30' : ''}`}
                        >
                            {/* Role Header */}
                            <div
                                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                onClick={() => setExpandedRole(isExpanded ? null : roleName)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${color.accent}`}></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{roleName}</h3>
                                            {isSystemRole(roleName) && (
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium rounded-full uppercase tracking-wider">
                                                    Sistem
                                                </span>
                                            )}
                                            {isAdmin && (
                                                <span className="material-icons-round text-amber-500 text-[16px]" title="Protected">lock</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">people</span>
                                                {userCount} pengguna
                                            </span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">verified_user</span>
                                                {perms.length} / {ALL_PERMISSIONS.length} akses
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Permission preview badges */}
                                    <div className="hidden md:flex items-center gap-1.5 mr-4">
                                        {ALL_PERMISSIONS.slice(0, 4).map(p => (
                                            <span
                                                key={p.key}
                                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${perms.includes(p.key)
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                                    }`}
                                                title={p.label}
                                            >
                                                <span className="material-icons-round text-[14px]">{p.icon}</span>
                                            </span>
                                        ))}
                                        {ALL_PERMISSIONS.length > 4 && (
                                            <span className="text-xs text-slate-400">+{ALL_PERMISSIONS.length - 4}</span>
                                        )}
                                    </div>
                                    {!isAdmin && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRole(roleName); }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Hapus Role"
                                        >
                                            <span className="material-icons-round text-[18px]">delete</span>
                                        </button>
                                    )}
                                    <span className={`material-icons-round text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </div>
                            </div>

                            {/* Permission Grid (Expandable) */}
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="pt-4 space-y-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hak Akses</p>
                                            {isAdmin && (
                                                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <span className="material-icons-round text-[14px]">info</span>
                                                    Admin memiliki akses penuh
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {ALL_PERMISSIONS.map(perm => {
                                                const isEnabled = perms.includes(perm.key);
                                                return (
                                                    <button
                                                        key={perm.key}
                                                        onClick={() => togglePermission(roleName, perm.key)}
                                                        disabled={isAdmin}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${isEnabled
                                                                ? 'border-primary/30 bg-primary/5 dark:bg-primary/10'
                                                                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                                                            } ${isAdmin ? 'cursor-not-allowed' : 'hover:shadow-sm active:scale-[0.99]'}`}
                                                    >
                                                        {/* Toggle */}
                                                        <div className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${isEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                                            } ${isAdmin ? 'opacity-70' : ''}`}>
                                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mx-1 ${isEnabled ? 'translate-x-4' : 'translate-x-0'
                                                                }`}></div>
                                                        </div>
                                                        {/* Icon + Label */}
                                                        <span className={`material-icons-round text-[20px] ${isEnabled ? 'text-primary' : 'text-slate-400'}`}>
                                                            {perm.icon}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-sm font-medium ${isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                {perm.label}
                                                            </div>
                                                            <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                                                {perm.description}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* Delete button inside expanded view */}
                                    {!isAdmin && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                            <button
                                                onClick={() => handleDeleteRole(roleName)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <span className="material-icons-round text-[16px]">delete</span>
                                                Hapus Role
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-4 transition-all ${toast.type === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    }`}>
                    <span className="material-icons-round text-[18px]">
                        {toast.type === 'error' ? 'error' : 'check_circle'}
                    </span>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
