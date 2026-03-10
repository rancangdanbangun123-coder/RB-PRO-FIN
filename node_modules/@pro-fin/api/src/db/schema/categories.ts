import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Categories ──
export const categories = pgTable('categories', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    icon: text('icon'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Sub Categories ──
export const subCategories = pgTable('sub_categories', {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
        .notNull()
        .references(() => categories.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    code: text('code'),
});

// ── Relations ──
export const categoriesRelations = relations(categories, ({ many }) => ({
    subCategories: many(subCategories),
}));

export const subCategoriesRelations = relations(subCategories, ({ one }) => ({
    category: one(categories, {
        fields: [subCategories.categoryId],
        references: [categories.id],
    }),
}));
