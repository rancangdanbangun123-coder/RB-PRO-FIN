import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserActivateModal({ isOpen, onClose, onConfirm, user }) {
    const { livePermissions } = useAuth();
    const [selectedRole, setSelectedRole] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Get all available roles from the dynamic rolePermissions store
    const allRoles = Object.keys(livePermissions || {});

    useEffect(() => {
        if (isOpen) {
            setSelectedRole(user?.role || (allRoles.includes('Project Manager') ? 'Project Manager' : allRoles[0] || ''));
            setIsVisible(true);
            const timer = setTimeout(() => setAnimateIn(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, user, allRoles]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(user.id, selectedRole);
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${animateIn ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-border-dark flex flex-col relative z-10 transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>

                <div className="p-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-amber-50 dark:bg-amber-900/10 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-amber-500">how_to_reg</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Aktivasi Pengguna</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Tentukan role untuk <strong className="text-slate-900 dark:text-white">{user?.name}</strong> ({user?.email}) sebelum akun diaktifkan.
                    </p>

                    <form id="activate-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Pilih Role</label>
                            <div className="relative">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                                >
                                    <option value="" disabled>-- Pilih Role --</option>
                                    {allRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-round text-slate-400 text-xl">admin_panel_settings</span>
                                </div>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <span className="material-icons-round text-slate-400">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-slate-200 dark:border-border-dark flex justify-end gap-3 bg-slate-50/50 dark:bg-card-dark rounded-b-2xl">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="activate-form"
                        disabled={!selectedRole}
                        className="px-4 py-2 text-sm font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm shadow-green-500/20 flex items-center gap-1.5"
                    >
                        <span className="material-icons-round text-[18px]">check_circle</span>
                        Aktifkan
                    </button>
                </div>
            </div>
        </div>
    );
}
