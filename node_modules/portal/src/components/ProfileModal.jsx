import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
    const { currentUser, checkSession } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        image: ''
    });
    const [isVisible, setIsVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: currentUser?.name || '',
                image: currentUser?.image || currentUser?.avatar || '' // Using image/avatar URL
            });
            setIsVisible(true);
            setError(null);
            const timer = setTimeout(() => setAnimateIn(true), 10);
            return () => clearTimeout(timer);
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.users.updateProfile(formData);
            await checkSession(); // Refresh currentUser in AuthContext
            onClose();
        } catch (err) {
            setError(err.message || 'Gagal memperbarui profil');
            console.error('Profile update error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${animateIn ? 'visible opacity-100' : 'invisible opacity-0'}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className={`bg-white dark:bg-card-dark rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-border-dark flex flex-col relative z-10 transition-all duration-300 transform ${animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>

                <div className="p-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-primary">account_circle</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profil</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                            <span className="material-icons-round text-[18px]">error_outline</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <img
                                    src={formData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random`}
                                    alt="Preview"
                                    className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover shadow-sm bg-white"
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=random`; }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Tampilan</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Nama Anda"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">URL Foto Profil</label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="https://example.com/photo.jpg"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">Kosongkan untuk menggunakan inisial nama.</p>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-slate-200 dark:border-border-dark flex justify-end gap-3 bg-slate-50/50 dark:bg-card-dark rounded-b-2xl">
                    <button
                        onClick={onClose}
                        type="button"
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="profile-form"
                        disabled={isLoading || !formData.name.trim()}
                        className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm shadow-primary/20 flex items-center gap-1.5"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <span className="material-icons-round text-[18px]">save</span>
                        )}
                        Simpan Profil
                    </button>
                </div>
            </div>
        </div>
    );
}
