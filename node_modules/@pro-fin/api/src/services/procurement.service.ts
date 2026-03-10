import { db } from '../db/index.js';
import { procurementItems, procurementTransitions } from '../db/schema/index.js';
import { eq, asc } from 'drizzle-orm';

export const procurementService = {
    async findAll() {
        return db.select().from(procurementItems).orderBy(asc(procurementItems.sortOrder));
    },

    async findById(id: string) {
        return db.query.procurementItems.findFirst({
            where: eq(procurementItems.id, id),
            with: { transitions: true },
        });
    },

    async create(data: typeof procurementItems.$inferInsert) {
        const [created] = await db.insert(procurementItems).values(data).returning();
        return created;
    },

    async update(id: string, data: Partial<typeof procurementItems.$inferInsert>) {
        const [updated] = await db
            .update(procurementItems)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(procurementItems.id, id))
            .returning();
        return updated;
    },

    async transition(
        id: string,
        fromStage: string,
        toStage: string,
        formData: Record<string, unknown>,
        userId: string
    ) {
        // Update the item's stage
        const [updated] = await db
            .update(procurementItems)
            .set({ stage: toStage, updatedAt: new Date() })
            .where(eq(procurementItems.id, id))
            .returning();

        // Record the transition
        await db.insert(procurementTransitions).values({
            itemId: id,
            fromStage,
            toStage,
            date: new Date().toISOString(),
            formData,
            createdBy: userId,
        });

        return updated;
    },

    async reorder(id: string, sortOrder: number) {
        const [updated] = await db
            .update(procurementItems)
            .set({ sortOrder })
            .where(eq(procurementItems.id, id))
            .returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(procurementItems).where(eq(procurementItems.id, id)).returning();
        return deleted;
    },

    // Check ownership
    async isOwnedBy(itemId: string, userId: string): Promise<boolean> {
        const item = await db.query.procurementItems.findFirst({
            where: eq(procurementItems.id, itemId),
            columns: { createdBy: true },
        });
        return item?.createdBy === userId;
    },
};
