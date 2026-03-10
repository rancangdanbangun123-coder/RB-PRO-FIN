import { db } from '../db/index.js';
import { provinsi, kabupaten, kecamatan } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const locationsService = {
    async findAllProvinsi() {
        return db.select().from(provinsi);
    },

    async findKabupatenByProvinsi(provinsiId: string) {
        return db.select().from(kabupaten).where(eq(kabupaten.provinsiId, provinsiId));
    },

    async findKecamatanByKabupaten(kabupatenId: string) {
        return db.select().from(kecamatan).where(eq(kecamatan.kabupatenId, kabupatenId));
    },
};
