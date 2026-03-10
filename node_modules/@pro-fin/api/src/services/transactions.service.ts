import { db } from '../db/index.js';
import { transactions, transactionItems } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const transactionsService = {
    async findAll(projectId?: string) {
        if (projectId) {
            return db.select().from(transactions).where(eq(transactions.projectId, projectId));
        }
        return db.select().from(transactions);
    },

    async findById(id: string) {
        return db.query.transactions.findFirst({
            where: eq(transactions.id, id),
            with: { items: true },
        });
    },

    async create(data: typeof transactions.$inferInsert, items?: (typeof transactionItems.$inferInsert)[]) {
        const [created] = await db.insert(transactions).values(data).returning();

        if (items && items.length > 0) {
            await db.insert(transactionItems).values(
                items.map((item) => ({ ...item, transactionId: created.id }))
            );
        }

        return this.findById(created.id);
    },

    async update(id: string, data: Partial<typeof transactions.$inferInsert>) {
        const [updated] = await db.update(transactions).set(data).where(eq(transactions.id, id)).returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(transactions).where(eq(transactions.id, id)).returning();
        return deleted;
    },
};
