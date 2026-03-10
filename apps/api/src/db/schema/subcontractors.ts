import { pgTable, text, uuid, integer, bigint, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { materials } from './materials';

// ── Subcontractors ──
export const subcontractors = pgTable('subcontractors', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    type: text('type'), // 'Supplier Material', 'Struktural', 'MEP', etc.
    rating: text('rating').default('0'),
    status: text('status').notNull().default('Pending'), // Active, Pending, Pending L1, Blacklist
    logo: text('logo'),
    pic: text('pic'),
    phone: text('phone'),
    email: text('email'),
    totalSpend: bigint('total_spend', { mode: 'number' }).default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Subcontractor Materials (which materials they supply) ──
export const subcontractorMaterials = pgTable('subcontractor_materials', {
    id: uuid('id').primaryKey().defaultRandom(),
    subcontractorId: text('subcontractor_id')
        .notNull()
        .references(() => subcontractors.id, { onDelete: 'cascade' }),
    materialId: text('material_id')
        .notNull()
        .references(() => materials.id, { onDelete: 'cascade' }),
    price: bigint('price', { mode: 'number' }).default(0),
    date: text('date'),
});

// ── Subcontractor History (PO/project history) ──
export const subcontractorHistory = pgTable('subcontractor_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    subcontractorId: text('subcontractor_id')
        .notNull()
        .references(() => subcontractors.id, { onDelete: 'cascade' }),
    projectName: text('project_name'),
    poNumber: text('po_number'),
    date: text('date'),
    status: text('status'), // 'Lunas', 'Selesai', 'Bermasalah'
    description: text('description'),
    amount: text('amount'),
});

// ── Subcontractor Managers (PM volume breakdown) ──
export const subcontractorManagers = pgTable('subcontractor_managers', {
    id: uuid('id').primaryKey().defaultRandom(),
    subcontractorId: text('subcontractor_id')
        .notNull()
        .references(() => subcontractors.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    volume: text('volume'),
    percent: integer('percent').default(0),
});

// ── Relations ──
export const subcontractorsRelations = relations(subcontractors, ({ many }) => ({
    suppliedMaterials: many(subcontractorMaterials),
    history: many(subcontractorHistory),
    managers: many(subcontractorManagers),
}));

export const subcontractorMaterialsRelations = relations(subcontractorMaterials, ({ one }) => ({
    subcontractor: one(subcontractors, {
        fields: [subcontractorMaterials.subcontractorId],
        references: [subcontractors.id],
    }),
    material: one(materials, {
        fields: [subcontractorMaterials.materialId],
        references: [materials.id],
    }),
}));

export const subcontractorHistoryRelations = relations(subcontractorHistory, ({ one }) => ({
    subcontractor: one(subcontractors, {
        fields: [subcontractorHistory.subcontractorId],
        references: [subcontractors.id],
    }),
}));

export const subcontractorManagersRelations = relations(subcontractorManagers, ({ one }) => ({
    subcontractor: one(subcontractors, {
        fields: [subcontractorManagers.subcontractorId],
        references: [subcontractors.id],
    }),
}));
