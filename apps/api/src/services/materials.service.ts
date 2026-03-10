import { db } from '../db/index.js';
import { materials } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const materialsService = {
    async findAll() {
        return db.select().from(materials);
    },

    async findById(id: string) {
        const [found] = await db.select().from(materials).where(eq(materials.id, id));
        return found || null;
    },

    async create(data: typeof materials.$inferInsert) {
        const [created] = await db.insert(materials).values(data).returning();
        return created;
    },

    async update(id: string, data: Partial<typeof materials.$inferInsert>) {
        const [updated] = await db
            .update(materials)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(materials.id, id))
            .returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(materials).where(eq(materials.id, id)).returning();
        return deleted;
    },

    async bulkImport(items: (typeof materials.$inferInsert)[]) {
        return db.insert(materials).values(items).onConflictDoNothing().returning();
    },
};
