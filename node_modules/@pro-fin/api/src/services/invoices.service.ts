import { db } from '../db/index.js';
import { clients, billingSteps, paymentLogs } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const invoicesService = {
    // ── Clients ──
    async findAllClients() {
        return db.select().from(clients);
    },

    async createClient(data: typeof clients.$inferInsert) {
        const [created] = await db.insert(clients).values(data).returning();
        return created;
    },

    async updateClient(id: string, data: Partial<typeof clients.$inferInsert>) {
        const [updated] = await db.update(clients).set(data).where(eq(clients.id, id)).returning();
        return updated;
    },

    async removeClient(id: string) {
        const [deleted] = await db.delete(clients).where(eq(clients.id, id)).returning();
        return deleted;
    },

    // ── Billing Steps (Termin) ──
    async findBillingByProject(projectId: string) {
        const steps = await db.query.billingSteps.findMany({
            where: eq(billingSteps.projectId, projectId),
            with: { paymentLogs: true },
        });
        return steps;
    },

    async createBillingStep(data: typeof billingSteps.$inferInsert) {
        const [created] = await db.insert(billingSteps).values(data).returning();
        return created;
    },

    async updateBillingStep(id: string, data: Partial<typeof billingSteps.$inferInsert>) {
        const [updated] = await db.update(billingSteps).set(data).where(eq(billingSteps.id, id)).returning();
        return updated;
    },

    async removeBillingStep(id: string) {
        const [deleted] = await db.delete(billingSteps).where(eq(billingSteps.id, id)).returning();
        return deleted;
    },

    // ── Payment Logs ──
    async createPaymentLog(data: typeof paymentLogs.$inferInsert) {
        const [created] = await db.insert(paymentLogs).values(data).returning();
        return created;
    },

    async updatePaymentLog(id: string, data: Partial<typeof paymentLogs.$inferInsert>) {
        const [updated] = await db.update(paymentLogs).set(data).where(eq(paymentLogs.id, id)).returning();
        return updated;
    },

    async removePaymentLog(id: string) {
        const [deleted] = await db.delete(paymentLogs).where(eq(paymentLogs.id, id)).returning();
        return deleted;
    },
};
