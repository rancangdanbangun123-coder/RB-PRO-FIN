import React, { useState, useEffect } from 'react';
import CategorySelect from "../components/CategorySelect";
import SearchableSelect from '../components/SearchableSelect';
import { api } from '../lib/api';
import { LOCATION_DATABASE } from '../data/locationData';

export default function CreateProjectModal({ isOpen, onClose }) {
    const [projectCode, setProjectCode] = useState("");
    const [projectName, setProjectName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [pic, setPic] = useState("");
    const [client, setClient] = useState("");
    const [pms, setPms] = useState([]);
    const [clients, setClients] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    // Hierarchical Location State
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

    // Computed Options
    const provinceOptions = LOCATION_DATABASE.map(p => ({ value: p.province, label: p.province }));

    const cityOptions = selectedProvince
        ? LOCATION_DATABASE.find(p => p.province === selectedProvince)?.cities.map(c => ({ value: c.name, label: c.name })) || []
        : [];

    const districtOptions = selectedCity && selectedProvince
        ? LOCATION_DATABASE.find(p => p.province === selectedProvince)
            ?.cities.find(c => c.name === selectedCity)
            ?.districts.map(d => ({ value: d, label: d })) || []
        : [];

    // Reset children when parent changes
    const handleProvinceChange = (val) => {
        setSelectedProvince(val);
        setSelectedCity("");
        setSelectedDistrict("");
    };

    const handleCityChange = (val) => {
        setSelectedCity(val);
        setSelectedDistrict("");
    };

    useEffect(() => {
        if (isOpen) {
            (async () => {
                try {
                    const [users, clientList] = await Promise.all([
                        api.users.list(),
                        api.invoices.listClients(),
                    ]);
                    const projectManagers = (users || []).filter(u =>
                        u.role?.trim().toLowerCase() === 'project manager' && u.status === 'Active'
                    );
                    setPms(projectManagers);
                    setClients(clientList || []);
                } catch (err) {
                    console.error('Failed to load modal data:', err);
                }
            })();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!/^\d{3}$/.test(projectCode)) {
            setErrorMessage("Kode Proyek harus terdiri dari tepat 3 digit angka (misal: 001).");
            return;
        }

        const newProject = {
            id: projectCode,
            name: `${projectCode} - ${projectName}`,
            categoryId: Number(categoryId),
            location: [selectedDistrict, selectedCity, selectedProvince].filter(Boolean).join(', ') || 'Lokasi Belum Ditentukan',
            client: client || 'Internal',
            pm: pic || 'TBD',
            status: 'Ongoing',
            progress: 0,
            value: 0,
            cost: 0,
            margin: 0,
            health: 'Good'
        };

        try {
            await api.projects.create(newProject);
            window.dispatchEvent(new Event('projectsUpdated'));
            setProjectCode("");
            setProjectName("");
            setErrorMessage("");
            onClose();
        } catch (err) {
            setErrorMessage(err.message || 'Gagal membuat proyek.');
        }
    };


    return (
        <>
            {/* Background Dashboard Simulation (Blurred) - Optional / Contextual */}
            {/* We use a fixed backdrop instead of the simulated background image since we are already inside the app */}

            {/* Modal Backdrop */}
            <div
                aria-hidden="true"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="relative w-full max-w-2xl bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh] overflow-hidden transform transition-all pointer-events-auto">

                    {/* Modal Header */}
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-surface-dark sticky top-0">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-icons-round text-primary text-2xl">add_business</span>
                                Buat Proyek Baru
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Masukkan detail awal untuk memulai proyek konstruksi baru.</p>
                        </div>
                        <button
                            onClick={() => {
                                setErrorMessage("");
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
                        >
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>

                    {/* Error Alert */}
                    {errorMessage && (
                        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 m-6 mb-0 rounded-r-lg">
                            <div className="flex items-center">
                                <span className="material-icons-round text-red-500 mr-2">error_outline</span>
                                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Modal Body (Scrollable) */}
                    <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 flex-1">

                            {/* Section: Informasi Utama */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="h-6 w-1 bg-primary rounded-full"></span>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Informasi Utama</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Kode Proyek */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="project_code">Kode Proyek <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <span className="material-icons-round text-lg">tag</span>
                                            </span>
                                            <input
                                                className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-surface-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 transition-shadow"
                                                id="project_code"
                                                name="project_code"
                                                placeholder="001"
                                                type="text"
                                                maxLength={3}
                                                value={projectCode}
                                                onChange={(e) => setProjectCode(e.target.value.replace(/\D/g, ''))} // strictly numbers
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Nama Proyek */}
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="project_name">Nama Proyek <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <span className="material-icons-round text-lg">edit</span>
                                            </span>
                                            <input
                                                className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-surface-dark-lighter text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 transition-shadow"
                                                id="project_name"
                                                name="project_name"
                                                placeholder="Contoh: Renovasi Kantor Pusat PT. Maju Jaya"
                                                type="text"
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Provinsi */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Provinsi <span className="text-red-500">*</span></label>
                                        <SearchableSelect
                                            value={selectedProvince}
                                            onChange={handleProvinceChange}
                                            placeholder="Pilih Provinsi..."
                                            options={provinceOptions}
                                        />
                                    </div>

                                    {/* Kota/Kabupaten */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kota / Kabupaten <span className="text-red-500">*</span></label>
                                        <SearchableSelect
                                            value={selectedCity}
                                            onChange={handleCityChange}
                                            placeholder="Pilih Kota..."
                                            options={cityOptions}
                                            disabled={!selectedProvince}
                                        />
                                    </div>

                                    {/* Kecamatan */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kecamatan <span className="text-red-500">*</span></label>
                                        <SearchableSelect
                                            value={selectedDistrict}
                                            onChange={(val) => setSelectedDistrict(val)}
                                            placeholder="Pilih Kecamatan..."
                                            options={districtOptions}
                                            disabled={!selectedCity}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Separator */}
                            <hr className="border-gray-100 dark:border-gray-700" />

                            {/* Section: Tanggung Jawab & Relasi */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="h-6 w-1 bg-primary rounded-full"></span>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nama Klien</h3>
                                </div>

                                {/* Cari Klien */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Klien <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded ml-2">Opsional</span>
                                    </label>
                                    <SearchableSelect
                                        value={client}
                                        onChange={(val) => setClient(val)}
                                        placeholder="Pilih Klien..."
                                        options={clients.map(c => ({ value: c.name, label: c.name }))}
                                        menuPlacement="top"
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Klien belum terdaftar? <a className="text-primary hover:underline" href="#">Tambah Klien Baru</a></p>
                                </div>

                                {/* Project Manager Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Manager (PIC) <span className="text-red-500">*</span></label>
                                    <SearchableSelect
                                        value={pic}
                                        onChange={(val) => setPic(val)}
                                        placeholder="Pilih Penanggung Jawab..."
                                        options={pms.map(pm => ({ value: pm.name, label: pm.name }))}
                                        menuPlacement="top"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 dark:bg-surface-dark-lighter/50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => {
                                    setErrorMessage("");
                                    onClose();
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900 transition-colors"
                                type="button"
                            >
                                Batal
                            </button>
                            <button
                                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-transparent text-sm font-medium text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900 transition-all flex items-center justify-center gap-2"
                                type="submit"
                            >
                                <span className="material-icons-round text-sm">save</span>
                                Buat Proyek
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
