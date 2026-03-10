import { db } from '../db/index.js';
import { projects, budgetItems } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const projectsService = {
    async findAll(userId: string, canViewAll: boolean) {
        if (canViewAll) {
            return db.select().from(projects);
        }
        return db.select().from(projects).where(eq(projects.pmUserId, userId));
    },

    async findById(id: string) {
        return db.query.projects.findFirst({
            where: eq(projects.id, id),
            with: { budgets: true },
        });
    },

    async create(data: typeof projects.$inferInsert) {
        const [created] = await db.insert(projects).values(data).returning();
        return created;
    },

    async update(id: string, data: Partial<typeof projects.$inferInsert>) {
        const [updated] = await db
            .update(projects)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(projects.id, id))
            .returning();
        return updated;
    },

    async updateProgress(id: string, progress: number) {
        const [updated] = await db
            .update(projects)
            .set({ progress, updatedAt: new Date() })
            .where(eq(projects.id, id))
            .returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();
        return deleted;
    },
};
