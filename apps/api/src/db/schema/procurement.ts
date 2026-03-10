import { pgTable, text, uuid, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { projects } from './projects';

// ── Procurement Items ──
export const procurementItems = pgTable('procurement_items', {
    id: text('id').primaryKey(),
    code: text('code'), // Display code e.g. #PR-1024
    type: text('type'), // 'Material', 'Gabungan', etc.
    procurementType: text('procurement_type').notNull().default('major'), // 'major' | 'minor' | 'asset'
    project: text('project'), // Project name (display)
    projectId: text('project_id').references(() => projects.id),
    title: text('title').notNull(),
    stage: text('stage').notNull().default('pr'), // pr, po, invoice, do, evaluation, report, asset_eval, done
    vol: text('vol'),
    est: text('est'),
    urgent: boolean('urgent').default(false),
    fastTrack: boolean('fast_track').default(false),
    created: text('created'), // Created date string
    createdBy: text('created_by').references(() => user.id), // For own-item permission checks
    data: jsonb('data').$type<Record<string, unknown>>().default({}),
    rawItems: jsonb('raw_items').$type<unknown[]>().default([]),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ── Procurement Transitions (phase history) ──
export const procurementTransitions = pgTable('procurement_transitions', {
    id: uuid('id').primaryKey().defaultRandom(),
    itemId: text('item_id')
        .notNull()
        .references(() => procurementItems.id, { onDelete: 'cascade' }),
    fromStage: text('from_stage'),
    toStage: text('to_stage'),
    date: text('date'),
    formData: jsonb('form_data').$type<Record<string, unknown>>().default({}),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Relations ──
export const procurementItemsRelations = relations(procurementItems, ({ one, many }) => ({
    projectRecord: one(projects, {
        fields: [procurementItems.projectId],
        references: [projects.id],
    }),
    creator: one(user, {
        fields: [procurementItems.createdBy],
        references: [user.id],
    }),
    transitions: many(procurementTransitions),
}));

export const procurementTransitionsRelations = relations(procurementTransitions, ({ one }) => ({
    item: one(procurementItems, {
        fields: [procurementTransitions.itemId],
        references: [procurementItems.id],
    }),
    actor: one(user, {
        fields: [procurementTransitions.createdBy],
        references: [user.id],
    }),
}));
