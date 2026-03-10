import { pgTable, text, uuid, integer, boolean, date, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';

// ── Assets ──
export const assets = pgTable('assets', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    image: text('image'),
    detailImage: text('detail_image'),
    category: text('category'),
    subCategory: text('sub_category'),
    brand: text('brand'),
    status: text('status').notNull().default('Tersedia'), // Digunakan, Tersedia, Maintenance, Rusak
    location: text('location'),
    qty: integer('qty').default(0),
    serialNumber: text('serial_number'),
    purchaseYear: text('purchase_year'),
    condition: text('condition'),
    pic: text('pic'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Asset Stock Breakdown ──
export const assetStockBreakdown = pgTable('asset_stock_breakdown', {
    id: uuid('id').primaryKey().defaultRandom(),
    assetId: text('asset_id')
        .notNull()
        .references(() => assets.id, { onDelete: 'cascade' }),
    status: text('status'),
    condition: text('condition'),
    location: text('location'),
    qty: integer('qty').default(0),
});

// ── Asset History ──
export const assetHistory = pgTable('asset_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    assetId: text('asset_id')
        .notNull()
        .references(() => assets.id, { onDelete: 'cascade' }),
    date: text('date'),
    event: text('event'),
    sub: text('sub'),
    active: boolean('active').default(false),
});

// ── Asset Requests ──
export const assetRequests = pgTable('asset_requests', {
    id: text('id').primaryKey(),
    assetId: text('asset_id')
        .references(() => assets.id, { onDelete: 'set null' }),
    assetName: text('asset_name'),
    projectId: text('project_id')
        .references(() => projects.id, { onDelete: 'set null' }),
    projectName: text('project_name'),
    requester: text('requester'),
    requestDate: date('request_date'),
    status: text('status').notNull().default('Pending'), // Pending, Approved, In Transit, Deployed, Completed, Rejected
    qty: integer('qty').default(1),
    notes: text('notes'),
});

// ── Asset Request History ──
export const assetRequestHistory = pgTable('asset_request_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: text('request_id')
        .notNull()
        .references(() => assetRequests.id, { onDelete: 'cascade' }),
    status: text('status'),
    date: text('date'),
    actor: text('actor'),
    note: text('note'),
});

// ── Relations ──
export const assetsRelations = relations(assets, ({ many }) => ({
    stockBreakdown: many(assetStockBreakdown),
    history: many(assetHistory),
    requests: many(assetRequests),
}));

export const assetStockBreakdownRelations = relations(assetStockBreakdown, ({ one }) => ({
    asset: one(assets, { fields: [assetStockBreakdown.assetId], references: [assets.id] }),
}));

export const assetHistoryRelations = relations(assetHistory, ({ one }) => ({
    asset: one(assets, { fields: [assetHistory.assetId], references: [assets.id] }),
}));

export const assetRequestsRelations = relations(assetRequests, ({ one, many }) => ({
    asset: one(assets, { fields: [assetRequests.assetId], references: [assets.id] }),
    project: one(projects, { fields: [assetRequests.projectId], references: [projects.id] }),
    history: many(assetRequestHistory),
}));

export const assetRequestHistoryRelations = relations(assetRequestHistory, ({ one }) => ({
    request: one(assetRequests, { fields: [assetRequestHistory.requestId], references: [assetRequests.id] }),
}));
