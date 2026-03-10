import { pgTable, text, uuid, bigint, date, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects';
import { user } from './auth';

// ── Transactions ──
export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: text('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'in' | 'out'
    title: text('title').notNull(),
    amount: bigint('amount', { mode: 'number' }).notNull().default(0),
    date: date('date').notNull(),
    category: text('category'),
    subCategory: text('sub_category'),
    account: text('account'),
    payee: text('payee'),
    notes: text('notes'),
    attachmentUrl: text('attachment_url'),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Transaction Items ──
export const transactionItems = pgTable('transaction_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    transactionId: uuid('transaction_id')
        .notNull()
        .references(() => transactions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    qty: text('qty'),
    unit: text('unit'),
    price: bigint('price', { mode: 'number' }).default(0),
    total: bigint('total', { mode: 'number' }).default(0),
});

// ── Relations ──
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
    project: one(projects, {
        fields: [transactions.projectId],
        references: [projects.id],
    }),
    creator: one(user, {
        fields: [transactions.createdBy],
        references: [user.id],
    }),
    items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
    transaction: one(transactions, {
        fields: [transactionItems.transactionId],
        references: [transactions.id],
    }),
}));
