import { pgTable, text, bigint, timestamp } from 'drizzle-orm/pg-core';
import { categories, subCategories } from './categories';

// ── Materials ──
export const materials = pgTable('materials', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    category: text('category'),
    categoryId: text('category_id').references(() => categories.id),
    subCategory: text('sub_category'),
    subCategoryId: text('sub_category_id').references(() => subCategories.id),
    price: bigint('price', { mode: 'number' }).default(0),
    ahsPrice: bigint('ahs_price', { mode: 'number' }).default(0),
    unit: text('unit'),
    status: text('status').notNull().default('Active'),
    lastUpdate: text('last_update'),
    trend: text('trend'), // 'up' | 'down' | 'flat'
    trendVal: text('trend_val'),
    plan: text('plan'),
    baseUnit: text('base_unit'),
    conversionFactor: text('conversion_factor'),
    standardUnit: text('standard_unit'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
