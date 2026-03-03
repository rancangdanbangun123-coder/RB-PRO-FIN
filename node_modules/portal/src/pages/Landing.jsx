export default function Landing() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 text-white font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white relative">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="hero-pattern absolute inset-0"></div>
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]"></div>
            </div>

            <header className="relative z-50 w-full pt-6 px-6 lg:px-12">
                <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-xl px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-icons-round text-white text-2xl">apartment</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-bold text-xl tracking-tight text-white">RB PRO-FIN</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Internal Portal</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                        <a href="#" className="hover:text-primary transition-colors">Dokumentasi</a>
                        <a href="#" className="hover:text-primary transition-colors">Jadwal</a>
                        <a href="#" className="hover:text-primary transition-colors">Kontak IT</a>
                    </div>
                    <a href="#" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group">
                        <span className="material-icons-round text-lg group-hover:text-primary transition-colors">lock</span>
                        <span className="hidden sm:inline">Akses Terbatas</span>
                    </a>
                </nav>
            </header>

            <main className="relative z-10 flex-grow flex items-center">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

                        {/* Left Column: Text Content */}
                        <div className="space-y-8 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Sistem Operasional
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-white text-glow">
                                Portal Manajemen Internal <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">Rancangbangun123</span>
                            </h1>
                            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                                Akses terpusat untuk manajemen proyek, keuangan, dan sumber daya perusahaan. Silakan masuk menggunakan kredensial karyawan Anda.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <a href="/login" className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-dark shadow-lg shadow-primary/30 hover:shadow-primary/50">
                                    Masuk Ke Akun
                                    <span className="material-icons-round ml-2 group-hover:translate-x-1 transition-transform">login</span>
                                </a>
                                <a href="#" className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-transparent border border-slate-600 rounded-lg hover:bg-slate-800 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-background-dark">
                                    Lupa Password?
                                    <span className="material-icons-round ml-2 text-slate-400 group-hover:text-white transition-colors">help_outline</span>
                                </a>
                            </div>

                            <div className="flex items-center gap-6 pt-8 border-t border-slate-800/50">
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Divisi Keuangan</p>
                                    <p className="text-xs text-slate-500">Finance & Accounting</p>
                                </div>
                                <div className="w-px h-8 bg-slate-800/50"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-300">Divisi Operasional</p>
                                    <p className="text-xs text-slate-500">Project Management</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: 3D Visualization */}
                        <div className="relative lg:h-auto flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl opacity-40 rounded-full transform translate-x-12 translate-y-12"></div>
                            <div className="relative w-full max-w-lg perspective-1000 transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
                                <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">

                                    {/* Browser Toolbar */}
                                    <div className="h-8 bg-background-dark-lighter border-b border-slate-700/50 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                        <div className="ml-4 text-[10px] text-slate-500 font-mono">internal.profin-erp.com</div>
                                    </div>

                                    {/* Dashboard Image */}
                                    <div className="relative aspect-[4/3] bg-background-dark">
                                        <img
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZLqfJFYKLqTwDa_CPH-D-_pva6Gowv739AZubdQzFcWZH4UwUE5MvoRCgL0RD5ixw-SAgQ1y0HAkKrIqezYkZHUFc7qkDVTvuVMIfd3_WhIGn6Pw8Z7g3hL21KhHPKOkFy1OuxFWuEd2hgdjyAlE7n1R3dQhjdBpavURHK2fW5qky-RWmPQcYHRt7giApDrEtjqyCj6jxnv4qNCB_zlwEDCduVNQLtUrsH7S6LDXdoyzbXD7c7tM52eghTRbByUeKk5C2Yvx0MyQF"
                                            alt="Financial dashboard analytics interface showing growth charts and data tables on a dark theme"
                                            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                                        />

                                        {/* Floating Annotations */}
                                        <div className="absolute top-6 left-6 right-6 bottom-6 flex flex-col gap-4 pointer-events-none">

                                            {/* Annotation 1 */}
                                            <div className="bg-background-dark-lighter/90 backdrop-blur border border-slate-700 rounded-lg p-4 shadow-xl w-2/3 self-end animate-float">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-slate-400 font-medium">Budget Dept. Q3</span>
                                                    <span className="text-xs text-green-400 font-bold flex items-center">
                                                        <span className="material-icons-round text-sm mr-1">check_circle</span> Approved
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary w-3/4"></div>
                                                </div>
                                            </div>

                                            {/* Annotation 2 */}
                                            <div className="bg-background-dark-lighter/90 backdrop-blur border border-slate-700 rounded-lg p-4 shadow-xl w-3/5 self-start mt-auto animate-float-reverse">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                        <span className="material-icons-round">badge</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">Employee Login</p>
                                                        <p className="text-xs text-slate-400">Secure Gateway</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-primary/30 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 py-8 border-t border-slate-800/50 bg-background-dark/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        © 2026 PT Rancangbangun Arsitama Buana - Internal System. Restricted Access.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">Kebijakan Privasi Internal</a>
                        <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">SOP Perusahaan</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
