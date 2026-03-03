export const SUBCON_DATABASE = [
    {
        id: 'SUB-2023-089',
        name: 'PT Semen Nusantara',
        address: 'Jl. Raya Industri No. 45, Gresik, Jawa Timur',
        type: 'Supplier Material',
        rating: 4.8,
        status: 'Active',
        logo: 'https://ui-avatars.com/api/?name=PT+Semen+Nusantara&background=random',
        pic: 'Bpk. Hartono',
        phone: '+62 812-3456-7890',
        email: 'sales@semennusantara.co.id',
        totalSpend: 'Rp 14.500.000.000',
        managers: [
            { name: 'Aldo', volume: 'Rp 8.200.000.000', percent: 65, color: 'primary', isTop: true },
            { name: 'Pram', volume: 'Rp 4.100.000.000', percent: 32, color: 'blue-400' },
            { name: 'Rai', volume: 'Rp 2.200.000.000', percent: 15, color: 'indigo-400' }
        ],
        history: [
            { name: '113 - Ciwaruga', po: 'PO-2025-004', date: '12 Jan 2025', status: 'Lunas', statusColor: 'green', desc: 'Supply 5000 sak Semen Portland, 200m3 Pasir', amount: 'Rp 1.200.000.000' },
            { name: 'Renovasi Kantor', po: 'PO-2024-118', date: '15 Nov 2024', status: 'Selesai', statusColor: 'slate', desc: 'Supply Material Lantai Beton', amount: 'Rp 450.000.000' }
        ],
        suppliedMaterials: [
            { materialId: 'MAT-SPL-0042', price: 64000, date: '2024-01-10' }, // Semen Portland (lower than avg)
            { materialId: 'MAT-SPL-0045', price: 275000, date: '2024-01-12' }  // Pasir Beton
        ]
    },
    {
        id: 'SUB-2022-112',
        name: 'CV Baja Makmur',
        address: 'Kawasan Industri Candi Blok C-12, Semarang',
        type: 'Struktural',
        rating: 3.5,
        status: 'Pending',
        logo: 'https://ui-avatars.com/api/?name=CV+Baja+Makmur&background=random',
        pic: 'Ibu Ratna',
        phone: '+62 811-9876-5432',
        email: 'admin@bajamakmur.com',
        totalSpend: 'Rp 0',
        managers: [],
        history: [],
        suppliedMaterials: [
            { materialId: 'MAT-STR-0013', price: 123000, date: '2024-02-01' }, // Besi Ulir 13
            { materialId: 'MAT-STR-0014', price: 84000, date: '2024-02-01' },  // Besi Ulir 10
            { materialId: 'MAT-STR-0020', price: 645000, date: '2024-01-15' }  // Wiremesh
        ]
    },
    {
        id: 'SUB-2024-001',
        name: 'PT Beton Jaya Abadi',
        address: 'Jl. Lingkar Luar Barat No. 88, Jakarta Barat',
        type: 'Supplier Beton',
        rating: 4.2,
        status: 'Active',
        logo: 'https://ui-avatars.com/api/?name=PT+Beton+Jaya+Abadi&background=random',
        pic: 'Bpk. Joko',
        phone: '+62 813-5555-9999',
        email: 'marketing@betonjaya.co.id',
        totalSpend: 'Rp 5.100.000.000',
        managers: [
            { name: 'Rai', volume: 'Rp 5.100.000.000', percent: 100, color: 'primary', isTop: true }
        ],
        history: [
            { name: '115 - Bojongkoneng', po: 'PO-2025-001', date: '05 Jan 2025', status: 'Lunas', statusColor: 'green', desc: 'Readymix K-350 500m3', amount: 'Rp 450.000.000' }
        ],
        suppliedMaterials: [] // No material catalog match yet
    },
    {
        id: 'SUB-2021-044',
        name: 'UD Maju Jalan',
        address: 'Jl. Kampung Melayu No. 12, Jakarta Timur',
        type: 'Logistik Umum',
        rating: 1.2,
        status: 'Blacklist',
        logo: 'https://ui-avatars.com/api/?name=UD+Maju+Jalan&background=random',
        pic: 'Bpk. Rahmat',
        phone: '+62 878-1234-5678',
        email: 'ud.majujalan@gmail.com',
        totalSpend: 'Rp 150.000.000',
        managers: [],
        history: [
            { name: 'Pengiriman Material', po: 'PO-2021-005', date: '10 Mar 2021', status: 'Bermasalah', statusColor: 'red', desc: 'Keterlambatan pengiriman 2 minggu', amount: 'Rp 15.000.000' }
        ],
        suppliedMaterials: [
            { materialId: 'MAT-SPL-0042', price: 68000, date: '2024-01-05' } // Semen Portland (higher price)
        ]
    },
    {
        id: 'SUB-2023-156',
        name: 'CV Elektrikal Prima',
        address: 'Ruko Glodok Plaza Blok F, Jakarta Barat',
        type: 'MEP (Mekanikal)',
        rating: 4.0,
        status: 'Active',
        logo: 'https://ui-avatars.com/api/?name=CV+Elektrikal+Prima&background=random',
        pic: 'Bpk. Dani',
        phone: '+62 856-7777-8888',
        email: 'info@elektrikalprima.com',
        totalSpend: 'Rp 1.200.000.000',
        managers: [
            { name: 'Pram', volume: 'Rp 800.000.000', percent: 70, color: 'primary', isTop: true },
            { name: 'Rai', volume: 'Rp 400.000.000', percent: 30, color: 'blue-400' }
        ],
        history: [
            { name: 'Instalasi Listrik Kantor', po: 'PO-2024-055', date: '12 Aug 2024', status: 'Selesai', statusColor: 'slate', desc: 'Pemasangan Panel & Kabel Tray', amount: 'Rp 350.000.000' }
        ],
        suppliedMaterials: [
            { materialId: 'MAT-MEP-0301', price: 14800, date: '2024-01-20' }, // Kabel NYM
            { materialId: 'MAT-MEP-0310', price: 24500, date: '2024-01-20' } // Saklar
        ]
    },
    {
        id: 'SUB-2026-001',
        name: 'PT Cahaya Baru',
        address: 'Jl. Surya Kencana No. 10, Bogor',
        type: 'Arsitektur Lansekap',
        rating: 0,
        status: 'Pending L1', // For testing approval flow
        logo: 'https://ui-avatars.com/api/?name=PT+Cahaya+Baru&background=random',
        pic: 'Ibu Siska',
        phone: '+62 812-9988-7766',
        email: 'info@cahayabaru.com',
        totalSpend: 'Rp 0',
        managers: [],
        history: [],
        suppliedMaterials: []
    }
];
