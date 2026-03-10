import { db } from '../db/index.js';
import { budgetItems } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const budgetsService = {
    async findByProject(projectId: string) {
        return db.select().from(budgetItems).where(eq(budgetItems.projectId, projectId));
    },

    async create(data: typeof budgetItems.$inferInsert) {
        const [created] = await db.insert(budgetItems).values(data).returning();
        return created;
    },

    async bulkCreate(items: (typeof budgetItems.$inferInsert)[]) {
        return db.insert(budgetItems).values(items).returning();
    },

    async update(id: string, data: Partial<typeof budgetItems.$inferInsert>) {
        const [updated] = await db.update(budgetItems).set(data).where(eq(budgetItems.id, id)).returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(budgetItems).where(eq(budgetItems.id, id)).returning();
        return deleted;
    },
};
