import { db } from '../db/index.js';
import {
    subcontractors,
    subcontractorMaterials,
    subcontractorHistory,
    subcontractorManagers,
} from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const subcontractorsService = {
    async findAll() {
        return db.select().from(subcontractors);
    },

    async findById(id: string) {
        return db.query.subcontractors.findFirst({
            where: eq(subcontractors.id, id),
            with: {
                suppliedMaterials: true,
                history: true,
                managers: true,
            },
        });
    },

    async create(data: typeof subcontractors.$inferInsert) {
        const [created] = await db.insert(subcontractors).values(data).returning();
        return created;
    },

    async update(id: string, data: Partial<typeof subcontractors.$inferInsert>) {
        const [updated] = await db.update(subcontractors).set(data).where(eq(subcontractors.id, id)).returning();
        return updated;
    },

    async updateStatus(id: string, status: string) {
        const [updated] = await db.update(subcontractors).set({ status }).where(eq(subcontractors.id, id)).returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(subcontractors).where(eq(subcontractors.id, id)).returning();
        return deleted;
    },

    // ── Supplied Materials ──
    async addMaterial(data: typeof subcontractorMaterials.$inferInsert) {
        const [created] = await db.insert(subcontractorMaterials).values(data).returning();
        return created;
    },

    async updateMaterial(id: string, data: Partial<typeof subcontractorMaterials.$inferInsert>) {
        const [updated] = await db.update(subcontractorMaterials).set(data).where(eq(subcontractorMaterials.id, id)).returning();
        return updated;
    },

    async removeMaterial(id: string) {
        const [deleted] = await db.delete(subcontractorMaterials).where(eq(subcontractorMaterials.id, id)).returning();
        return deleted;
    },
};
