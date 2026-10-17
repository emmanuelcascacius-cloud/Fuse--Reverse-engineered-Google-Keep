# Issue 04: IndexedDB Local-First Engine (`Dexie.js`) & Offline `sync_outbox` Mutation Store

## Spec & Design References
- **`specs.md`**: Section 1.1 (Principle 5: Sub-5ms Local-First Speed), Section 3.2 (Offline-First & Local Caching Strategy: `notes_store`, `labels_store`, `sync_outbox`), Section 4.1.
- **`AGENTS.md`**: Section 1 (Local-First Offline Cache: hits IndexedDB in < 5ms first, queuing mutations in `sync_outbox`), Section 4.2.

## Implementation Scope
1. **Dexie.js Database Instance**:
   - `lib/db/indexeddb.ts`: Initializing Fuse local database with versioned schema:
     - `notes`: indexed by `id`, `source_domain`, `source_url`, `color`, `is_pinned`, `is_archived`, `is_trashed`, `updated_at`, `deleted_at`.
     - `labels`: indexed by `id`, `name`, `updated_at`, `deleted_at`.
     - `sync_outbox`: indexed by `++id`, `entity_type`, `entity_id`, `operation`, `created_at`.
2. **Local Repository & Optimistic CRUD Actions**:
   - `lib/db/notes-repo.ts`:
     - `createNoteLocal(input)`: Generates client UUIDv4, persists to `notes` in `< 5ms`, enqueues `CREATE` mutation to `sync_outbox`.
     - `updateNoteLocal(id, patch)`: Optimistically applies update with updated timestamp, enqueues `UPDATE` mutation to `sync_outbox`.
     - `softDeleteNoteLocal(id)`: Sets `deleted_at = now()`, marks note, enqueues `DELETE` mutation to `sync_outbox`.
     - `trashNoteLocal(id)`: Sets `is_trashed = true`, `trashed_at = now()`, enqueues `UPDATE`.
     - `getNotesByDomainLocal(domain)`: Indexed sub-millisecond query for contextual extension and active site views.
3. **Reactive State Synchronizer (Zustand)**:
   - `lib/store/useNotesStore.ts`: Reactive state hook feeding UI directly from IndexedDB with optimistic updates.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/indexeddb-repo.test.ts` (using `fake-indexeddb` to test sub-5ms write/read, UUID generation, outbox queueing, and domain querying).
  - `tests/unit/sync-outbox.test.ts` (tests FIFO order of outbox mutations and replay readiness).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/indexeddb-repo.test.ts tests/unit/sync-outbox.test.ts` -> All pass.

