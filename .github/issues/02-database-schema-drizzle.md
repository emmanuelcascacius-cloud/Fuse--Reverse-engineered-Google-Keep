# Issue 02: PostgreSQL Database Schema, Drizzle ORM Models & Trigram Indexes

## Spec & Design References
- **`specs.md`**: Section 5 (Database Schema PostgreSQL: `users`, `notes`, `labels`, `note_labels`, `note_attachments`), Section 1.1 (Principle 2: No-Title, Body-First Architecture), Section 2.3 (Feature Slot 1: `source_domain`, `source_url`, `url_match_scope`, Feature Slot 2: Priority color system `coral`, `storm`, `clay` first).
- **`AGENTS.md`**: Section 1 (Body-Only Notes: Never add a title column to PostgreSQL), Section 2 (PostgreSQL with `pgcrypto` and `pg_trgm`, Drizzle ORM matching exact schema), Section 4.3 (Backend & Database Integration Tests).

## Implementation Scope
1. **Drizzle ORM Models**:
   - `lib/db/schema.ts` defining:
     - `users`: `id` (UUID), `email`, `password_hash`, `created_at`
     - `notes`: `id` (UUID, client-generated), `user_id` (UUID ref), `body` (TEXT), `is_checklist` (BOOLEAN), `checklist_items` (JSONB), `color` (VARCHAR(32)), `source_url` (TEXT), `source_domain` (VARCHAR(255)), `url_match_scope` (VARCHAR(16)), `is_pinned` (BOOLEAN), `is_archived` (BOOLEAN), `is_trashed` (BOOLEAN), `position` (DOUBLE PRECISION), `trashed_at` (TIMESTAMPTZ), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ), `deleted_at` (TIMESTAMPTZ tombstone)
     - NO `title` COLUMN anywhere.
     - `labels`: `id`, `user_id`, `name`, `created_at`, `updated_at`, `deleted_at`
     - `note_labels`: junction table `(note_id, label_id)` with `deleted_at` tombstone
     - `note_attachments`: `id`, `note_id`, `file_url`, `mime_type`, `created_at`
2. **Migrations & Indexes**:
   - SQL migration files enabling `pgcrypto` and `pg_trgm`.
   - Index `idx_notes_user_updated` on `(user_id, updated_at)`.
   - Partial Index `idx_notes_user_domain` on `(user_id, source_domain)` WHERE `is_archived = FALSE AND is_trashed = FALSE AND deleted_at IS NULL`.
   - Partial Index `idx_notes_user_color` on `(user_id, color)` WHERE `is_trashed = FALSE AND deleted_at IS NULL`.
   - GIN Trigram Index `idx_notes_body_trgm` on `notes USING GIN (body gin_trgm_ops)`.
3. **Database Client**:
   - `lib/db/client.ts` with connection pooling and type-safe query helpers.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/db-schema.test.ts` (verifies schema objects have exact fields, validates no title field exists, type inference matches specification).
  - `tests/integration/db-indexes.test.ts` (verifies migration SQL contains correct partial indexes, trigram syntax, and constraints).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/db-schema.test.ts` -> All pass.

