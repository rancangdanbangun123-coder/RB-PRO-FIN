import { pgTable, text, integer, bigint, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { clients } from './invoices';

// ── Projects ──
export const projects = pgTable('projects', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    location: text('location'),
    provinsiId: text('provinsi_id'),
    kabupatenId: text('kabupaten_id'),
    kecamatanId: text('kecamatan_id'),
    client: text('client'),
    clientId: text('client_id'),
    pm: text('pm'),
    pmUserId: text('pm_user_id'),
    status: text('status').notNull().default('Ongoing'),
    progress: integer('progress').notNull().default(0),
    value: bigint('value', { mode: 'number' }).default(0),
    cost: bigint('cost', { mode: 'number' }).default(0),
    margin: integer('margin').default(0),
    health: text('health').default('Good'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ── Budget Items ──
export const budgetItems = pgTable('budget_items', {
    id: text('id').primaryKey().default(crypto.randomUUID()),
    projectId: text('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    category: text('category'),
    subCategory: text('sub_category'),
    description: text('description'),
    volume: text('volume'),
    unit: text('unit'),
    unitPrice: bigint('unit_price', { mode: 'number' }).default(0),
    totalBudget: bigint('total_budget', { mode: 'number' }).default(0),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Relations ──
export const projectsRelations = relations(projects, ({ one, many }) => ({
    pmUser: one(user, {
        fields: [projects.pmUserId],
        references: [user.id],
    }),
    clientRecord: one(clients, {
        fields: [projects.clientId],
        references: [clients.id],
    }),
    budgets: many(budgetItems),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
    project: one(projects, {
        fields: [budgetItems.projectId],
        references: [projects.id],
    }),
}));
