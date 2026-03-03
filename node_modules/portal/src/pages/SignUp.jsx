import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!fullname.trim()) {
            setError('Nama lengkap harus diisi');
            return;
        }
        if (password.length < 8) {
            setError('Kata sandi minimal 8 karakter');
            return;
        }
        if (password !== confirmPassword) {
            setError('Kata sandi dan konfirmasi tidak cocok');
            return;
        }
        if (!termsAccepted) {
            setError('Anda harus menyetujui Syarat dan Ketentuan');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const result = signup(fullname.trim(), email, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
                setLoading(false);
            }
        }, 400);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white dark:bg-[#15202b] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px] border border-gray-200 dark:border-gray-800">

                {/* Left Side: Branding / Marketing */}
                <div className="relative w-full md:w-5/12 lg:w-1/2 hidden md:flex flex-col justify-between p-12 bg-gray-900">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Modern architecture construction site blueprint"
                            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYsKbLDuxsNy7DeY7B6uds3Kp6cvnX12m6nwJsTlydn1pCifcO-UJMG_WxpmZadbJ6zxDEVcR-NsdtkvT9gnWo3l0PFx8wiCK1kjfi5guzpF69jdzu771MjSsfYBZW3KP9f1ANeTKGYz6gqC214W6y-p3PuJHavOJZ4r6BR1ggJLKdMaTA7guHQv2ZOGT1CUj92tBU4wpACeRS8kHoW9PbmZoAnRCzHu0JqeNGzXb0WBaKz_Qef3ZYCseBktYfcSEStL3rlanygkFm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-blue-900/80 opacity-90"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold text-xl">
                                    <span className="material-icons-round">apartment</span>
                                </div>
                                <span className="text-2xl font-bold text-white tracking-tight">RB PRO-FIN</span>
                            </div>
                            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                                Bangun Masa Depan Bisnis Konstruksi Anda
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed max-w-sm">
                                Bergabunglah dengan ribuan kontraktor yang telah mengoptimalkan manajemen proyek dan keuangan mereka dengan RB PRO-FIN.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-blue-50">
                                <span className="material-icons-round text-white bg-white/20 p-2 rounded-full text-sm">check</span>
                                <span className="font-medium">Manajemen RAB Real-time</span>
                            </div>
                            <div className="flex items-center gap-4 text-blue-50">
                                <span className="material-icons-round text-white bg-white/20 p-2 rounded-full text-sm">check</span>
                                <span className="font-medium">Pelacakan Progress Proyek</span>
                            </div>
                            <div className="flex items-center gap-4 text-blue-50">
                                <span className="material-icons-round text-white bg-white/20 p-2 rounded-full text-sm">check</span>
                                <span className="font-medium">Laporan Keuangan Otomatis</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center">
                                    <span className="material-icons-round text-white text-2xl">person</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">"Efisiensi meningkat 40% sejak pakai RB PRO-FIN."</p>
                                    <p className="text-xs text-blue-200">Sri Lestari, CEO Jatuh Bangun Aku</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Signup Form */}
                <div className="w-full md:w-7/12 lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
                    <div className="w-full max-w-md mx-auto">
                        <div className="md:hidden flex items-center gap-2 mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                                <span className="material-icons-round text-sm">architecture</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">PRO-FIN</span>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Buat Akun Baru</h1>
                            <p className="text-gray-500 dark:text-gray-400">Lengkapi data di bawah ini untuk memulai.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                                <span className="material-icons-round text-lg">error_outline</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Nama Lengkap */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="fullname">Nama Lengkap</label>
                                <div className="relative">
                                    <input
                                        className="block w-full px-4 py-3 pl-11 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                                        id="fullname"
                                        name="fullname"
                                        placeholder="Masukkan nama lengkap Anda"
                                        type="text"
                                        required
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-icons-round text-gray-400 text-xl">person_outline</span>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="email">Alamat Email</label>
                                <div className="relative">
                                    <input
                                        className="block w-full px-4 py-3 pl-11 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                                        id="email"
                                        name="email"
                                        placeholder="nama@perusahaan.com"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-icons-round text-gray-400 text-xl">mail_outline</span>
                                    </div>
                                </div>
                            </div>

                            {/* Password Group */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Kata Sandi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="password">Kata Sandi</label>
                                    <div className="relative group">
                                        <input
                                            className="block w-full px-4 py-3 pl-11 pr-10 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                                            id="password"
                                            name="password"
                                            placeholder="Min. 8 karakter"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-icons-round text-gray-400 text-xl">lock_outline</span>
                                        </div>
                                        <div
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-icons-round text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Konfirmasi Kata Sandi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="confirm_password">Konfirmasi</label>
                                    <div className="relative">
                                        <input
                                            className="block w-full px-4 py-3 pl-11 pr-10 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                                            id="confirm_password"
                                            name="confirm_password"
                                            placeholder="Ulangi kata sandi"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-icons-round text-gray-400 text-xl">lock_outline</span>
                                        </div>
                                        <div
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <span className="material-icons-round text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password Requirements Hint */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-3 mt-1">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span> 8+ Karakter</span>
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span> Huruf Besar</span>
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span> Angka</span>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start pt-2">
                                <div className="flex items-center h-5">
                                    <input
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-gray-50 dark:bg-gray-800 dark:border-gray-600"
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label className="font-medium text-gray-700 dark:text-gray-300" htmlFor="terms">Saya menyetujui</label>
                                    <a className="font-semibold text-primary hover:text-blue-500 ml-1" href="#">Syarat dan Ketentuan</a>
                                    <span className="text-gray-500 dark:text-gray-400"> serta </span>
                                    <a className="font-semibold text-primary hover:text-blue-500" href="#">Kebijakan Privasi</a>
                                    <span className="text-gray-500 dark:text-gray-400"> PRO-FIN.</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Membuat akun...
                                    </span>
                                ) : 'Buat Akun'}
                            </button>

                            {/* Login Link */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sudah punya akun?
                                    <Link className="font-medium text-primary hover:text-blue-500 transition-colors" to="/login"> Masuk di sini</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
