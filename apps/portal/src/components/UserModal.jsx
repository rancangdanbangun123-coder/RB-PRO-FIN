import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserModal({ isOpen, onClose, onSave, initialData }) {
    const { livePermissions } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Project Manager'
    });

    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    // Get all available roles from the dynamic rolePermissions store
    const allRoles = Object.keys(livePermissions || {});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    email: initialData.email,
                    password: initialData.password,
                    role: initialData.role
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'Project Manager'
                });
            }
            setIsVisible(true);
            const timer = setTimeout(() => setAnimateIn(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...initialData, ...formData });
        onClose();
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${animateIn ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-border-dark flex flex-col max-h-[90vh] relative z-10 transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>

                <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Budi Santoso"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="budi@pro-fin.id"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <input
                                type="text"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Password..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Wewenang / Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                {allRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-border-dark flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                type="button"
                                className="px-5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm shadow-primary/20"
                            >
                                Simpan Pengguna
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
