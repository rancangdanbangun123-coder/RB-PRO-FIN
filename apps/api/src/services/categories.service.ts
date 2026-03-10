import { db } from '../db/index.js';
import { categories, subCategories } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

export const categoriesService = {
    async findAll() {
        return db.query.categories.findMany({
            with: { subCategories: true },
        });
    },

    async findById(id: string) {
        return db.query.categories.findFirst({
            where: eq(categories.id, id),
            with: { subCategories: true },
        });
    },

    async create(data: typeof categories.$inferInsert) {
        const [created] = await db.insert(categories).values(data).returning();
        return created;
    },

    async update(id: string, data: Partial<typeof categories.$inferInsert>) {
        const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
        return updated;
    },

    async remove(id: string) {
        const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
        return deleted;
    },

    // ── Sub Categories ──
    async createSubCategory(data: typeof subCategories.$inferInsert) {
        const [created] = await db.insert(subCategories).values(data).returning();
        return created;
    },

    async updateSubCategory(id: string, data: Partial<typeof subCategories.$inferInsert>) {
        const [updated] = await db.update(subCategories).set(data).where(eq(subCategories.id, id)).returning();
        return updated;
    },

    async removeSubCategory(id: string) {
        const [deleted] = await db.delete(subCategories).where(eq(subCategories.id, id)).returning();
        return deleted;
    },

    async bulkImport(items: { category: typeof categories.$inferInsert; subs: (typeof subCategories.$inferInsert)[] }[]) {
        const results = [];
        for (const item of items) {
            const [cat] = await db.insert(categories).values(item.category).onConflictDoNothing().returning();
            if (cat && item.subs.length > 0) {
                const subs = await db.insert(subCategories)
                    .values(item.subs.map((s) => ({ ...s, categoryId: cat.id })))
                    .returning();
                results.push({ ...cat, subCategories: subs });
            } else {
                results.push(cat);
            }
        }
        return results;
    },
};
