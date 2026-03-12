import React, { useState, useEffect, useMemo } from 'react';
import { ALL_PERMISSIONS, useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

// Group icon map
const GROUP_ICONS = {
    'Pengguna': 'manage_accounts',
    'Proyek': 'assignment',
    'Kategori': 'category',
    'Material': 'local_shipping',
    'Pengadaan': 'shopping_cart',
    'Aset': 'inventory_2',
    'Subkontraktor': 'engineering',
    'Keuangan': 'receipt',
    'Akuntansi': 'account_balance_wallet',
};

const GROUP_COLORS = {
    'Pengguna': 'purple',
    'Proyek': 'blue',
    'Kategori': 'teal',
    'Material': 'orange',
    'Pengadaan': 'pink',
    'Aset': 'cyan',
    'Subkontraktor': 'amber',
    'Keuangan': 'emerald',
    'Akuntansi': 'indigo',
};

export default function RoleManagement() {
    const { livePermissions: rolePerms, updatePermissions: saveRolePermissions } = useAuth();
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [expandedRole, setExpandedRole] = useState(null);
    const [toast, setToast] = useState(null);

    // Build grouped permission structure
    const permissionGroups = useMemo(() => {
        const groups = [];
        const seen = new Set();
        for (const perm of ALL_PERMISSIONS) {
            if (!seen.has(perm.group)) {
                seen.add(perm.group);
                groups.push({
                    name: perm.group,
                    icon: GROUP_ICONS[perm.group] || 'settings',
                    color: GROUP_COLORS[perm.group] || 'slate',
                    permissions: ALL_PERMISSIONS.filter(p => p.group === perm.group),
                });
            }
        }
        return groups;
    }, []);

    useEffect(() => {
        // No longer needed: AuthContext handles 'rolePermissionsUpdated' event synchronization
    }, []);

    const getRoleIdFromName = (name) => name.toLowerCase().replace(/\s+/g, '_');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const users = await api.users.list();
                setAllUsers(users || []);
            } catch (err) { console.error('Failed to load users:', err); }
        })();
    }, []);

    const getUserCount = (roleName) => {
        return allUsers.filter(u => u.role === roleName).length;
    };

    const roleNames = Object.keys(rolePerms || {});

    const togglePermission = async (roleName, permKey) => {
        if (roleName === 'Admin') {
            showToast('Role Admin tidak dapat diubah', 'error');
            return;
        }
        const current = rolePerms[roleName] || [];
        const updated = current.includes(permKey)
            ? current.filter(p => p !== permKey)
            : [...current, permKey];
        const newPerms = { ...rolePerms, [roleName]: updated };
        try {
            await api.permissions.updateRole(getRoleIdFromName(roleName), updated);
            await saveRolePermissions(newPerms);
        } catch (err) {
            showToast('Gagal menyimpan wewenang', 'error');
            console.error(err);
        }
    };

    const toggleGroup = async (roleName, groupName) => {
        if (roleName === 'Admin') {
            showToast('Role Admin tidak dapat diubah', 'error');
            return;
        }
        const groupKeys = ALL_PERMISSIONS.filter(p => p.group === groupName).map(p => p.key);
        const current = rolePerms[roleName] || [];
        const allEnabled = groupKeys.every(k => current.includes(k));
        let updated;
        if (allEnabled) {
            // Turn all off
            updated = current.filter(p => !groupKeys.includes(p));
        } else {
            // Turn all on
            const toAdd = groupKeys.filter(k => !current.includes(k));
            updated = [...current, ...toAdd];
        }
        const newPerms = { ...rolePerms, [roleName]: updated };
        try {
            await api.permissions.updateRole(getRoleIdFromName(roleName), updated);
            await saveRolePermissions(newPerms);
        } catch (err) {
            showToast('Gagal menyimpan wewenang', 'error');
            console.error(err);
        }
    };

    const handleAddRole = async () => {
        const trimmed = newRoleName.trim();
        if (!trimmed) return;
        if (roleNames.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
            showToast('Role sudah ada', 'error');
            return;
        }
        try {
            await api.permissions.createRole({ id: getRoleIdFromName(trimmed), name: trimmed, permissions: ['view_proyek'] });
            const newPerms = { ...rolePerms, [trimmed]: ['view_proyek'] };
            await saveRolePermissions(newPerms);
            setNewRoleName('');
            setIsAddingRole(false);
            setExpandedRole(trimmed);
            showToast(`Role "${trimmed}" berhasil dibuat`);
        } catch (err) {
            showToast('Gagal membuat role', 'error');
            console.error(err);
        }
    };

    const handleDeleteRole = async (roleName) => {
        if (roleName === 'Admin') {
            showToast('Role Admin tidak dapat dihapus', 'error');
            return;
        }
        const userCount = getUserCount(roleName);
        const confirmMsg = userCount > 0
            ? `Hapus role "${roleName}"? ${userCount} pengguna akan dipindahkan ke "Project Manager".`
            : `Hapus role "${roleName}"?`;
        if (!window.confirm(confirmMsg)) return;

        if (userCount > 0) {
            try {
                const users = await api.users.list();
                const toUpdate = users.filter(u => u.role === roleName);
                for (const u of toUpdate) {
                    await api.users.update(u.id, { ...u, role: 'Project Manager' });
                }
                setAllUsers(prev => prev.map(u => u.role === roleName ? { ...u, role: 'Project Manager' } : u));
            } catch (err) { console.error('Failed to reassign users:', err); }
        }

        // Remove custom role via API if applicable
        try { await api.permissions.deleteRole(getRoleIdFromName(roleName)); } catch (e) { console.error('Delete role err', e); }

        const { [roleName]: _, ...rest } = rolePerms;
        await saveRolePermissions(rest);
        if (expandedRole === roleName) setExpandedRole(null);
        showToast(`Role "${roleName}" berhasil dihapus`);
    };

    const isSystemRole = (name) => ['Admin', 'Project Manager', 'Finance', 'Site Manager'].includes(name);

    const getRoleAccentColor = (name) => {
        const map = { 'Admin': 'bg-purple-500', 'Project Manager': 'bg-blue-500', 'Finance': 'bg-emerald-500', 'Site Manager': 'bg-amber-500' };
        return map[name] || 'bg-indigo-500';
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
                        <button onClick={handleAddRole} disabled={!newRoleName.trim()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 text-sm font-medium">
                            Simpan
                        </button>
                        <button onClick={() => { setIsAddingRole(false); setNewRoleName(''); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                            Batal
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsAddingRole(true)} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm shadow-primary/20 hover:shadow-primary/30 active:scale-95 text-sm">
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
                    const isAdmin = roleName === 'Admin';
                    const totalPerms = ALL_PERMISSIONS.length;

                    return (
                        <div key={roleName} className={`bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary/30' : ''}`}>
                            {/* Role Header */}
                            <div
                                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                onClick={() => setExpandedRole(isExpanded ? null : roleName)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${getRoleAccentColor(roleName)}`}></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{roleName}</h3>
                                            {isSystemRole(roleName) && (
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium rounded-full uppercase tracking-wider">Sistem</span>
                                            )}
                                            {isAdmin && <span className="material-icons-round text-amber-500 text-[16px]" title="Protected">lock</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">people</span>
                                                {userCount} pengguna
                                            </span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <span className="material-icons-round text-[14px]">verified_user</span>
                                                {perms.length} / {totalPerms} akses
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isAdmin && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRole(roleName); }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
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

                            {/* Grouped Permissions (Expandable) */}
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800">
                                    {isAdmin && (
                                        <div className="mt-4 mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                                            <span className="material-icons-round text-[16px]">info</span>
                                            Admin memiliki seluruh akses dan tidak dapat diubah.
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-6">
                                        {permissionGroups.map(group => {
                                            const groupPerms = group.permissions;
                                            const enabledCount = groupPerms.filter(p => perms.includes(p.key)).length;
                                            const allEnabled = enabledCount === groupPerms.length;
                                            const someEnabled = enabledCount > 0 && !allEnabled;

                                            return (
                                                <div key={group.name} className="flex flex-col gap-3">
                                                    {/* Group Header */}
                                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-icons-round text-[20px] text-slate-400">
                                                                {group.icon}
                                                            </span>
                                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                                {group.name}
                                                            </span>
                                                            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                                {enabledCount}/{groupPerms.length}
                                                            </span>
                                                        </div>

                                                        {/* Group Toggle: Pilih Semua */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pilih Semua</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleGroup(roleName, group.name)}
                                                                disabled={isAdmin}
                                                                className={`w-9 h-5 rounded-full flex items-center transition-colors duration-200 ${allEnabled ? 'bg-primary' : someEnabled ? 'bg-primary/50' : 'bg-slate-300 dark:bg-slate-600'
                                                                    } ${isAdmin ? 'cursor-not-allowed opacity-70' : 'hover:opacity-90'}`}
                                                            >
                                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mx-0.5 ${allEnabled || someEnabled ? 'translate-x-[16px]' : 'translate-x-0'
                                                                    }`}></div>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Individual Permissions (Card Grid) */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                                        {groupPerms.map(perm => {
                                                            const isEnabled = perms.includes(perm.key);
                                                            const isChild = !!perm.parent;
                                                            const isParentEnabled = isChild && perms.includes(perm.parent);
                                                            const effectivelyEnabled = isEnabled || isParentEnabled;

                                                            return (
                                                                <button
                                                                    key={perm.key}
                                                                    onClick={(e) => {
                                                                        if (isParentEnabled) {
                                                                            e.preventDefault();
                                                                            return;
                                                                        }
                                                                        togglePermission(roleName, perm.key);
                                                                    }}
                                                                    disabled={isAdmin || isParentEnabled}
                                                                    className={`flex flex-row items-center justify-between group p-3 text-left rounded-lg transition-all border ${isChild ? 'ml-0 lg:ml-6 border-l-4 border-l-slate-300 dark:border-l-slate-600' : ''} ${effectivelyEnabled
                                                                        ? 'border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30'
                                                                        : 'border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20'
                                                                        } ${isAdmin || isParentEnabled ? '' : 'hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/20'} ${isChild && isParentEnabled ? 'opacity-60' : ''}`}
                                                                >
                                                                    <div className="flex flex-col gap-0.5 pr-4">
                                                                        <div className={`text-sm font-semibold transition-colors ${effectivelyEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                                                                            }`}>
                                                                            {isChild && <span className="text-slate-400 mr-2">↳</span>}
                                                                            {perm.label}
                                                                        </div>
                                                                        <div className={`text-xs transition-colors ${effectivelyEnabled ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
                                                                            }`}>
                                                                            {perm.description}
                                                                        </div>
                                                                    </div>

                                                                    {/* Individual Toggle */}
                                                                    <div className={`w-9 h-5 rounded-full flex items-center transition-colors duration-200 shrink-0 ${effectivelyEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                                                        } ${isAdmin || isParentEnabled ? 'opacity-70' : ''}`}>
                                                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 mx-0.5 ${effectivelyEnabled ? 'translate-x-[16px]' : 'translate-x-0'
                                                                            }`}></div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Delete inside expanded */}
                                    {!isAdmin && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                            <button onClick={() => handleDeleteRole(roleName)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
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
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    }`}>
                    <span className="material-icons-round text-[18px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
