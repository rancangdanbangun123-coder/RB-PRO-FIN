import { pgTable, text, uuid, integer, bigint, date, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';

// ── Clients ──
export const clients = pgTable('clients', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type'), // 'Perorangan', 'Perusahaan'
    contact: text('contact'),
    email: text('email'),
    address: text('address'),
    npwp: text('npwp'),
    initial: text('initial'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Billing Steps (termin) ──
export const billingSteps = pgTable('billing_steps', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: text('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    stepNumber: integer('step_number').notNull(),
    label: text('label'),
    percent: text('percent'), // percentage string
    amount: bigint('amount', { mode: 'number' }).default(0),
    status: text('status').notNull().default('pending'), // pending, invoiced, paid
    dueDate: date('due_date'),
    paidDate: date('paid_date'),
    sortOrder: integer('sort_order').default(0),
});

// ── Payment Logs ──
export const paymentLogs = pgTable('payment_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: text('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    billingStepId: uuid('billing_step_id')
        .references(() => billingSteps.id, { onDelete: 'set null' }),
    date: date('date'),
    description: text('description'),
    amount: bigint('amount', { mode: 'number' }).default(0),
    method: text('method'),
    reference: text('reference'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Relations ──
export const clientsRelations = relations(clients, ({ many }) => ({
    projects: many(projects),
}));

export const billingStepsRelations = relations(billingSteps, ({ one, many }) => ({
    project: one(projects, {
        fields: [billingSteps.projectId],
        references: [projects.id],
    }),
    paymentLogs: many(paymentLogs),
}));

export const paymentLogsRelations = relations(paymentLogs, ({ one }) => ({
    project: one(projects, {
        fields: [paymentLogs.projectId],
        references: [projects.id],
    }),
    billingStep: one(billingSteps, {
        fields: [paymentLogs.billingStepId],
        references: [billingSteps.id],
    }),
}));
