import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate brief loading for UX
        setTimeout(() => {
            const result = login(email, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
                setLoading(false);
            }
        }, 400);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 selection:bg-primary/30 selection:text-white">
            {/* Background Pattern/Gradient for subtle depth */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-40"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(19, 127, 236, 0.15) 0%, rgba(16, 25, 34, 0) 50%)" }}
            >
            </div>

            {/* Main Login Card */}
            <div className="relative z-10 w-full max-w-md bg-white dark:bg-card-dark rounded-xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden">
                {/* Top decorative line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
                <div className="p-8 sm:p-10">

                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 ring-1 ring-primary/20">
                            <span className="material-icons-round text-white text-2xl">apartment</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">RB PRO-FIN</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Masuk untuk mengelola proyek Anda</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm animate-in slide-in-from-top-2">
                            <span className="material-icons-round text-lg">error_outline</span>
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-round text-slate-400 group-focus-within:text-primary transition-colors text-xl">email</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-300 dark:border-border-dark rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                                    id="email"
                                    name="email"
                                    placeholder="nama@profin.com"
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Kata Sandi</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-icons-round text-slate-400 group-focus-within:text-primary transition-colors text-xl">lock</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-background-dark border border-slate-300 dark:border-border-dark rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    required
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-slate-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-icons-round text-slate-400 hover:text-slate-300 text-xl select-none">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input
                                    className="h-4 w-4 text-primary bg-slate-100 dark:bg-background-dark border-slate-300 dark:border-slate-600 rounded focus:ring-primary focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                />
                                <label className="ml-2 block text-slate-600 dark:text-slate-400 cursor-pointer select-none" htmlFor="remember-me">
                                    Ingat Saya
                                </label>
                            </div>
                            <div className="text-sm">
                                <a className="font-medium text-primary hover:text-primary-hover hover:underline transition-all" href="#">
                                    Lupa Kata Sandi?
                                </a>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-card-dark transition-all duration-200 transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </span>
                                ) : 'Masuk'}
                            </button>
                        </div>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-border-dark/50">
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Belum punya akun kontraktor?
                            <Link className="font-medium text-primary hover:text-primary-hover hover:underline ml-1" to="/signup">
                                Daftar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-background-dark to-transparent opacity-90 pointer-events-none"></div>
        </div>
    )
}
