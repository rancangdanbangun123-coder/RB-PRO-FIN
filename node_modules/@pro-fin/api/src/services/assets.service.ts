import { db } from '../db/index.js';
import { assets, assetStockBreakdown, assetHistory, assetRequests, assetRequestHistory } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const assetsService = {
    async findAll() {
        return db.select().from(assets);
    },

    async findById(id: string) {
        return db.query.assets.findFirst({
            where: eq(assets.id, id),
            with: {
                stockBreakdown: true,
                history: true,
            },
        });
    },

    async create(data: typeof assets.$inferInsert) {
        const [created] = await db.insert(assets).values(data).returning();
        return created;
    },

    async update(id: string, data: Partial<typeof assets.$inferInsert>) {
        const [updated] = await db.update(assets).set(data).where(eq(assets.id, id)).returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(assets).where(eq(assets.id, id)).returning();
        return deleted;
    },

    // ── Requests ──
    async findAllRequests() {
        return db.query.assetRequests.findMany({
            with: { history: true },
        });
    },

    async createRequest(data: typeof assetRequests.$inferInsert) {
        const [created] = await db.insert(assetRequests).values(data).returning();
        return created;
    },

    async updateRequestStatus(requestId: string, status: string, actor: string, note?: string) {
        const [updated] = await db
            .update(assetRequests)
            .set({ status })
            .where(eq(assetRequests.id, requestId))
            .returning();

        // Log the status change
        await db.insert(assetRequestHistory).values({
            requestId,
            status,
            date: new Date().toISOString(),
            actor,
            note: note || null,
        });

        return updated;
    },
};
