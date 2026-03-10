import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Provinsi (Province) ──
export const provinsi = pgTable('provinsi', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
});

// ── Kabupaten (Regency/City) ──
export const kabupaten = pgTable('kabupaten', {
    id: text('id').primaryKey(),
    provinsiId: text('provinsi_id')
        .notNull()
        .references(() => provinsi.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
});

// ── Kecamatan (District) ──
export const kecamatan = pgTable('kecamatan', {
    id: text('id').primaryKey(),
    kabupatenId: text('kabupaten_id')
        .notNull()
        .references(() => kabupaten.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
});

// ── Relations ──
export const provinsiRelations = relations(provinsi, ({ many }) => ({
    kabupatens: many(kabupaten),
}));

export const kabupatenRelations = relations(kabupaten, ({ one, many }) => ({
    provinsi: one(provinsi, {
        fields: [kabupaten.provinsiId],
        references: [provinsi.id],
    }),
    kecamatans: many(kecamatan),
}));

export const kecamatanRelations = relations(kecamatan, ({ one }) => ({
    kabupaten: one(kabupaten, {
        fields: [kecamatan.kabupatenId],
        references: [kabupaten.id],
    }),
}));
