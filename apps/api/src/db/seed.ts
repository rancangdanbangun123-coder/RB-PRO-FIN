import 'dotenv/config';
import { db } from './index.js';
import {
    roles, rolePermissions,
    projects, clients, materials, categories, subCategories,
    subcontractors, subcontractorMaterials, subcontractorHistory, subcontractorManagers,
    assets, assetStockBreakdown, assetHistory,
} from './schema/index.js';
import { DEFAULT_ROLE_PERMISSIONS, ALL_PERMISSION_KEYS } from '../constants/permissions.js';

async function seed() {
    console.log('🌱 Seeding database...');

    // ── 1. Roles & Permissions ──
    console.log('  → Roles & Permissions');
    const roleEntries = [
        { id: 'admin', name: 'Admin' },
        { id: 'project_manager', name: 'Project Manager' },
        { id: 'finance', name: 'Finance' },
        { id: 'site_manager', name: 'Site Manager' },
    ];

    for (const role of roleEntries) {
        await db.insert(roles).values(role).onConflictDoNothing();
        const perms = DEFAULT_ROLE_PERMISSIONS[role.id] || [];
        for (const key of perms) {
            await db.insert(rolePermissions).values({ roleId: role.id, permissionKey: key }).onConflictDoNothing();
        }
    }

    // ── 2. Clients ──
    console.log('  → Clients');
    const clientData = [
        { id: '1', name: 'Bapak Budi Santoso', type: 'Perorangan', contact: '0812-3456-7890', email: 'budi.s@gmail.com', address: 'Jl. Merpati No. 12, Jakarta Selatan', initial: 'BS' },
        { id: '2', name: 'Ibu Ratna Dewi', type: 'Perorangan', contact: '0811-9876-5432', email: 'ratna.dewi88@yahoo.com', address: 'Apartemen Taman Rasuna, Jakarta', initial: 'RD' },
        { id: '3', name: 'Bapak Hendra Wijaya', type: 'Perorangan', contact: '0813-5555-1234', email: 'hendra.w@gmail.com', address: 'Cluster Anggrek Blok C, Tangerang', initial: 'HW' },
    ];
    for (const c of clientData) {
        await db.insert(clients).values(c).onConflictDoNothing();
    }

    // ── 3. Projects ──
    console.log('  → Projects');
    const projectData = [
        { id: '113', name: '113 - Ciwaruga', location: 'Bandung', client: 'Bpk. Heryanto', clientId: '4', pm: 'Aldo', status: 'Ongoing', progress: 75, value: 1500000000, cost: 1125000000, margin: 25, health: 'Good' },
        { id: '115', name: '115 - Bojongkoneng', location: 'Bandung', client: 'Ibu Sarah W.', clientId: '5', pm: 'Rai', status: 'Ongoing', progress: 80, value: 2200000000, cost: 1650000000, margin: 25, health: 'Excellent' },
        { id: '116', name: '116 - Pesona Bali', location: 'Jakarta', client: 'Bpk. Adi H.', clientId: '6', pm: 'Grandis', status: 'BAST-1', progress: 90, value: 3500000000, cost: 100000000, margin: 0, health: 'Warning' },
        { id: '117', name: '117 - Dago Pakar', location: 'Bandung', client: 'Bpk. Budi S.', clientId: '1', pm: 'Pram', status: 'Ongoing', progress: 45, value: 4100000000, cost: 1845000000, margin: 55, health: 'Good' },
        { id: '118', name: '118 - Setiabudi Regency', location: 'Bandung', client: 'Ibu Ratna D.', clientId: '2', pm: 'Aldo', status: 'Ongoing', progress: 10, value: 1200000000, cost: 50000000, margin: 95, health: 'Good' },
        { id: '119', name: '119 - Kota Baru Parahyangan', location: 'Bandung', client: 'Bpk. Hendra W.', clientId: '3', pm: 'Rai', status: 'Maintenance', progress: 100, value: 2800000000, cost: 2100000000, margin: 25, health: 'Excellent' },
        { id: '120', name: '120 - Graha Santosa', location: 'Jakarta', client: 'Bpk. Budi S.', clientId: '1', pm: 'Grandis', status: 'Completed', progress: 100, value: 4500000000, cost: 3150000000, margin: 30, health: 'Excellent' },
    ];
    for (const p of projectData) {
        await db.insert(projects).values(p).onConflictDoNothing();
    }

    // ── 4. Materials ──
    console.log('  → Materials');
    const materialData = [
        { id: 'MAT-BES-001', name: 'Besi Ulir 13 Grade Full', category: 'Material', subCategory: 'Besi & Baja', price: 125000, ahsPrice: 120000, unit: 'Batang', status: 'Active', lastUpdate: '24 Okt 2023', trend: 'down', trendVal: '2.5%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-SEM-001', name: 'Semen Portland 50kg', category: 'Material', subCategory: 'Semen', price: 65000, ahsPrice: 70000, unit: 'Sak', status: 'Active', lastUpdate: '23 Okt 2023', trend: 'up', trendVal: '5.0%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-DIN-001', name: 'Bata Merah Jumbo', category: 'Material', subCategory: 'Dinding', price: 850, ahsPrice: 850, unit: 'Pcs', status: 'Active', lastUpdate: '20 Okt 2023', trend: 'flat', trendVal: '0.0%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-BES-002', name: 'Besi Ulir 10 Grade Full', category: 'Material', subCategory: 'Besi & Baja', price: 85000, ahsPrice: 82000, unit: 'Batang', status: 'Active', lastUpdate: '25 Okt 2023', trend: 'up', trendVal: '1.2%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-CAT-001', name: 'Cat Tembok Putih 25kg', category: 'Material', subCategory: 'Cat & Coating', price: 1250000, ahsPrice: 1300000, unit: 'Pail', status: 'Active', lastUpdate: '18 Okt 2023', trend: 'flat', trendVal: '0.0%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-LAN-001', name: 'Keramik Lantai 60x60', category: 'Material', subCategory: 'Lantai', price: 150000, ahsPrice: 145000, unit: 'Dos', status: 'Active', lastUpdate: '19 Okt 2023', trend: 'up', trendVal: '3.1%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-ELE-001', name: 'Kabel NYM 3x2.5mm', category: 'Material', subCategory: 'Elektrikal', price: 15000, ahsPrice: 14000, unit: 'Meter', status: 'Active', lastUpdate: '21 Okt 2023', trend: 'up', trendVal: '8.5%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-PLU-001', name: 'Pipa PVC AW 4"', category: 'Material', subCategory: 'Plumbing', price: 85000, ahsPrice: 90000, unit: 'Batang', status: 'Active', lastUpdate: '20 Okt 2023', trend: 'down', trendVal: '1.5%', plan: 'Rencana Perusahaan' },
        { id: 'MAT-AGR-001', name: 'Pasir Beton Lumajang', category: 'Material', subCategory: 'Agregat', price: 280000, ahsPrice: 275000, unit: 'M3', status: 'Active', lastUpdate: '24 Okt 2023', trend: 'up', trendVal: '2.0%', plan: 'Rencana Perusahaan' },
    ];
    for (const m of materialData) {
        await db.insert(materials).values(m).onConflictDoNothing();
    }

    // ── 5. Subcontractors ──
    console.log('  → Subcontractors');
    const subconData = [
        { id: 'SUB-2023-089', name: 'PT Semen Nusantara', address: 'Jl. Raya Industri No. 45, Gresik', type: 'Supplier Material', rating: '4.8', status: 'Active', pic: 'Bpk. Hartono', phone: '+62 812-3456-7890', email: 'sales@semennusantara.co.id', totalSpend: 14500000000 },
        { id: 'SUB-2024-001', name: 'PT Beton Jaya Abadi', address: 'Jl. Lingkar Luar Barat No. 88, Jakarta Barat', type: 'Supplier Beton', rating: '4.2', status: 'Active', pic: 'Bpk. Joko', phone: '+62 813-5555-9999', email: 'marketing@betonjaya.co.id', totalSpend: 5100000000 },
        { id: 'SUB-2023-156', name: 'CV Elektrikal Prima', address: 'Ruko Glodok Plaza Blok F, Jakarta Barat', type: 'MEP (Mekanikal)', rating: '4.0', status: 'Active', pic: 'Bpk. Dani', phone: '+62 856-7777-8888', email: 'info@elektrikalprima.com', totalSpend: 1200000000 },
        { id: 'SUB-2026-001', name: 'PT Cahaya Baru', address: 'Jl. Surya Kencana No. 10, Bogor', type: 'Arsitektur Lansekap', rating: '0', status: 'Pending L1', pic: 'Ibu Siska', phone: '+62 812-9988-7766', email: 'info@cahayabaru.com', totalSpend: 0 },
    ];
    for (const s of subconData) {
        await db.insert(subcontractors).values(s).onConflictDoNothing();
    }

    // ── 6. Assets ──
    console.log('  → Assets');
    const assetData = [
        { id: 'AST-2023-001', name: 'Concrete Mixer 500L', category: 'Aset', subCategory: 'Alat Berat', brand: 'Hercules Heavy', status: 'Digunakan', location: '116 - Pesona Bali', qty: 2, serialNumber: '882910-X', purchaseYear: '2021', condition: 'Baik (Servis: 2 Bulan lalu)', pic: 'Bpk. Hartono' },
        { id: 'AST-2023-042', name: 'Bor Listrik Impact', category: 'Aset', subCategory: 'Perkakas Listrik', brand: 'Bosch Professional', status: 'Tersedia', location: 'Gudang Utama (Rak B2)', qty: 5, serialNumber: 'BS-229-L', purchaseYear: '2023', condition: 'Sangat Baik', pic: '-' },
        { id: 'AST-2022-105', name: 'Genset Diesel 5000W', category: 'Aset', subCategory: 'Listrik & Power', brand: 'Yamaha', status: 'Maintenance', location: 'Bengkel Pusat', qty: 1, serialNumber: 'YMH-GEN-5K', purchaseYear: '2022', condition: 'Perlu Servis Ringan', pic: 'Teknisi A' },
        { id: 'AST-2021-012', name: 'Scaffolding Set', category: 'Aset', subCategory: 'Konstruksi', brand: 'Local', status: 'Digunakan', location: '117 - Dago Pakar', qty: 50, serialNumber: 'SCF-001-50', purchaseYear: '2021', condition: 'Beragam (Lihat Detail)', pic: 'Mandor Asep' },
    ];
    for (const a of assetData) {
        await db.insert(assets).values(a).onConflictDoNothing();
    }

    // Scaffolding stock breakdown
    await db.insert(assetStockBreakdown).values([
        { assetId: 'AST-2021-012', status: 'Digunakan', condition: 'Baik', location: '117 - Dago Pakar', qty: 30 },
        { assetId: 'AST-2021-012', status: 'Tersedia', condition: 'Baik', location: 'Gudang Utama', qty: 15 },
        { assetId: 'AST-2021-012', status: 'Rusak', condition: 'Perlu Perbaikan', location: 'Gudang Utama', qty: 5 },
    ]).onConflictDoNothing();

    console.log('✅ Seed completed!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
