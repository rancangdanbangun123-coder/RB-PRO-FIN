import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_USERS } from '../data/userData';
import UserModal from '../components/UserModal';
import RoleManagement from '../components/RoleManagement';
import Sidebar from '../components/Sidebar';

export default function UserManagement() {
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : DEFAULT_USERS;
    });

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
        window.dispatchEvent(new Event('storage'));
    }, [users]);

    // Listen for external user data changes (e.g. from RoleManagement reassignment)
    useEffect(() => {
        const handler = () => {
            const saved = localStorage.getItem('users');
            if (saved) setUsers(JSON.parse(saved));
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const handleAddClick = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = (userId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
        const updatedList = users.filter(u => u.id !== userId);
        setUsers(updatedList);
    };

    const handleSaveUser = (userData) => {
        if (editingUser) {
            const updatedUsers = users.map(u => u.id === userData.id ? { ...u, ...userData } : u);
            setUsers(updatedUsers);
        } else {
            const currentYear = new Date().getFullYear();
            const sequenceStr = String(users.length + 1).padStart(3, '0');
            const newId = `USR-${currentYear}-${sequenceStr}`;

            const newUser = {
                ...userData,
                id: newId,
                status: 'Active',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`
            };
            setUsers([...users, newUser]);
        }
    };

    const tabs = [
        { key: 'users', label: 'Daftar Pengguna', icon: 'people' },
        { key: 'roles', label: 'Pengaturan Role', icon: 'admin_panel_settings' },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-display antialiased h-screen flex overflow-hidden">
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUser}
                initialData={editingUser}
            />

            <Sidebar activePage="users" isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-slate-500 hover:text-primary" onClick={() => setIsMobileMenuOpen(true)}>
                            <span className="material-icons-round">menu</span>
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Manajemen Pengguna</h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-scroll p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Tab Bar */}
                        <div className="flex bg-white dark:bg-card-dark p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.key
                                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-icons-round text-[18px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'users' && (
                            <>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daftar Pengguna</h1>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data login, email, dan wewenang staff.</p>
                                    </div>
                                    <button onClick={handleAddClick} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm shadow-primary/20 hover:shadow-primary/30 active:scale-95">
                                        <span className="material-icons-round text-[20px]">person_add</span>
                                        Tambah Pengguna
                                    </button>
                                </div>

                                {/* Users Table */}
                                <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Nama Pengguna</th>
                                                    <th className="px-6 py-4 font-medium">Wewenang (Role)</th>
                                                    <th className="px-6 py-4 font-medium">Email / Kontak</th>
                                                    <th className="px-6 py-4 font-medium">Password</th>
                                                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                                {users.map(user => (
                                                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
                                                                <div>
                                                                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                                        {user.name}
                                                                        {user.status === 'Active' ? (
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Active"></span>
                                                                        ) : (
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" title="Inactive"></span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' :
                                                                user.role === 'Project Manager' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                                    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-700/50'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                            {user.email}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-slate-400 tracking-[0.2em] select-none text-xs">••••••••</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEditClick(user)}
                                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                                    title="Edit Pengguna"
                                                                >
                                                                    <span className="material-icons-round text-[20px]">edit</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                                    title="Hapus Pengguna"
                                                                >
                                                                    <span className="material-icons-round text-[20px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {users.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-12 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                                                                    <span className="material-icons-round text-3xl">people_outline</span>
                                                                </div>
                                                                <div className="text-slate-500 dark:text-slate-400 text-sm">Belum ada data pengguna</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'roles' && (
                            <RoleManagement />
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}

