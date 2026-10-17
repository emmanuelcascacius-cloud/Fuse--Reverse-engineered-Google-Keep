# Issue 12: Backend Delta Sync (`/api/v1/sync` LWW) & Domain Context REST API

## Spec & Design References
- **`specs.md`**: Section 4.1 (Backend Architecture & Responsibilities), Section 4.2 (API Endpoints: `POST /api/v1/sync`, `GET /api/v1/notes`, `GET /api/v1/notes/context?domain=...`, `PATCH /api/v1/notes/:id`, `GET/POST/DELETE /api/v1/labels`), Section 5 (Indexes for Delta Sync).
- **`AGENTS.md`**: Section 4.3 (Backend & Database Integration Tests: Verify `/api/v1/sync` Last-Write-Wins delta resolution, soft-delete tombstones `deleted_at`, trigram search, and context lookups).

## Implementation Scope
1. **Delta Sync Endpoint (`POST /api/v1/sync`)**:
   - `app/api/v1/sync/route.ts`:
     - Receives batch mutations from client `sync_outbox` (`mutations: []`, `last_synced_at`).
     - Applies Last-Write-Wins (LWW) conflict resolution using entity `updated_at`.
     - Handles soft-delete tombstones (`deleted_at`).
     - Returns server mutations since `last_synced_at` and new `server_synced_at` timestamp.
2. **Domain Context Endpoint (`GET /api/v1/notes/context`)**:
   - `app/api/v1/notes/context/route.ts`:
     - Accepts `?domain=github.com` or `?url=...`.
     - Queries active notes matching `source_domain` (where `is_archived = false AND is_trashed = false AND deleted_at IS NULL`).
     - Sorts **Red (`coral`)** notes first, followed by **Blue (`storm`)**, then **Black (`clay`)**.
3. **Core CRUD & Labels Endpoints**:
   - `app/api/v1/notes/route.ts` & `app/api/v1/notes/[id]/route.ts`: standard CRUD fallback with validation (verifies no title field).
   - `app/api/v1/labels/route.ts`: label management.

## Verification & Test Plan
- **Test Files**:
  - `tests/integration/sync-api.test.ts` (verifies: 1. Push local mutations; 2. LWW conflict resolution where later `updated_at` wins; 3. Soft-delete tombstone processing; 4. Pulling delta changes).
  - `tests/integration/context-api.test.ts` (verifies: 1. Domain lookup returns matching notes; 2. Non-matching notes excluded; 3. Priority sorting returns red notes first).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/integration/sync-api.test.ts tests/integration/context-api.test.ts` -> All pass.

