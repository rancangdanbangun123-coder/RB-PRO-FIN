import { db } from '../db/index.js';
import { categories, subCategories, materials } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

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
        const [created] = await db.insert(categories).values({
            ...data,
            id: data.id || randomUUID(),
        }).returning();
        return created;
    },

    async update(id: string, data: Partial<typeof categories.$inferInsert>) {
        const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
        return updated;
    },

    async remove(id: string, migrateToId?: string) {
        if (migrateToId) {
            // Find the target category to get its name
            const targetCat = await this.findById(migrateToId);
            if (targetCat) {
                // Update all materials pointing to the old category
                // @ts-ignore - DB types might be strict, but we update both ID and name
                await db.update(materials)
                    .set({
                        categoryId: migrateToId,
                        category: targetCat.name,
                        subCategoryId: null, // Clear subcategory since they moved to a new parent
                        subCategory: null
                    })
                    .where(eq(materials.categoryId, id));
            }
        } else {
            // If no migration, we must clear the category fields for orphaned materials
            // @ts-ignore
            await db.update(materials)
                .set({
                    categoryId: null,
                    category: null,
                    subCategoryId: null,
                    subCategory: null
                })
                .where(eq(materials.categoryId, id));
        }

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

    async removeSubCategory(id: string, migrateToId?: string) {
        if (migrateToId) {
            const [targetSub] = await db.select().from(subCategories).where(eq(subCategories.id, migrateToId));
            if (targetSub) {
                // @ts-ignore
                await db.update(materials)
                    .set({
                        subCategoryId: migrateToId,
                        subCategory: targetSub.name
                    })
                    .where(eq(materials.subCategoryId, id));
            }
        } else {
            // @ts-ignore
            await db.update(materials)
                .set({ subCategoryId: null, subCategory: null })
                .where(eq(materials.subCategoryId, id));
        }

        const [deleted] = await db.delete(subCategories).where(eq(subCategories.id, id)).returning();
        return deleted;
    },

    async bulkImport(items: { category: typeof categories.$inferInsert; subs: (typeof subCategories.$inferInsert)[] }[]) {
        const results = [];
        for (const item of items) {
            let catRecord;
            
            // Check if category already exists by name
            const existingCatList = await db.select().from(categories).where(eq(categories.name, item.category.name as string));
            
            if (existingCatList.length > 0) {
                catRecord = existingCatList[0];
            } else {
                const [inserted] = await db.insert(categories).values({
                    ...item.category,
                    id: item.category.id || randomUUID()
                }).returning();
                catRecord = inserted;
            }

            if (catRecord && item.subs && item.subs.length > 0) {
                const subsAttached = [];
                for (const sub of item.subs) {
                    const existingSubList = await db.select().from(subCategories).where(
                        and(
                            eq(subCategories.name, sub.name as string),
                            eq(subCategories.categoryId, catRecord.id)
                        )
                    );
                    
                    if (existingSubList.length > 0) {
                        subsAttached.push(existingSubList[0]);
                    } else {
                        const [insertedSub] = await db.insert(subCategories).values({
                            ...sub,
                            categoryId: catRecord.id,
                            id: sub.id || randomUUID()
                        }).returning();
                        subsAttached.push(insertedSub);
                    }
                }
                results.push({ ...catRecord, subCategories: subsAttached });
            } else {
                results.push(catRecord);
            }
        }
        return results;
    },
};
