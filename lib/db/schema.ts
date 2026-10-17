import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  varchar,
  doublePrecision,
  timestamp,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  position: number;
}

// 1. Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Notes Table (Strictly NO title column — body-only design)
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey(), // Client-generated UUIDv4/v7 for offline creation
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').default('').notNull(),
    is_checklist: boolean('is_checklist').default(false).notNull(),
    checklist_items: jsonb('checklist_items').$type<ChecklistItem[]>().default([]),
    // 12 Google Keep colors with Primary State Colors first: 'coral', 'storm', 'clay'
    color: varchar('color', { length: 32 }).default('chalk').notNull(),
    source_url: text('source_url'),
    source_domain: varchar('source_domain', { length: 255 }),
    url_match_scope: varchar('url_match_scope', { length: 16 }).default('domain').notNull(),
    is_pinned: boolean('is_pinned').default(false).notNull(),
    is_archived: boolean('is_archived').default(false).notNull(),
    is_trashed: boolean('is_trashed').default(false).notNull(),
    position: doublePrecision('position').default(0).notNull(),
    trashed_at: timestamp('trashed_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }), // Soft-delete tombstone
  },
  (table) => [
    index('idx_notes_user_updated').on(table.user_id, table.updated_at),
    index('idx_notes_user_domain')
      .on(table.user_id, table.source_domain)
      .where(sql`is_archived = FALSE AND is_trashed = FALSE AND deleted_at IS NULL`),
    index('idx_notes_user_color')
      .on(table.user_id, table.color)
      .where(sql`is_trashed = FALSE AND deleted_at IS NULL`),
    index('idx_notes_body_trgm').using('gin', sql`${table.body} gin_trgm_ops`),
  ]
);

// 3. Labels Table
export const labels = pgTable(
  'labels',
  {
    id: uuid('id').primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 64 }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    unique('idx_labels_user_name').on(table.user_id, table.name),
    index('idx_labels_user_updated').on(table.user_id, table.updated_at),
  ]
);

// 4. Note <-> Labels Junction Table
export const note_labels = pgTable(
  'note_labels',
  {
    note_id: uuid('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    label_id: uuid('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.note_id, table.label_id] }),
  ]
);

// 5. Attachments Table
export const note_attachments = pgTable('note_attachments', {
  id: uuid('id').primaryKey(),
  note_id: uuid('note_id')
    .notNull()
    .references(() => notes.id, { onDelete: 'cascade' }),
  file_url: text('file_url').notNull(),
  mime_type: varchar('mime_type', { length: 64 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export type NoteLabel = typeof note_labels.$inferSelect;
export type NoteAttachment = typeof note_attachments.$inferSelect;
