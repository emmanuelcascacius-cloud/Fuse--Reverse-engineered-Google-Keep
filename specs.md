# Google Keep Clone — Product & Technical Specification (`specs.md`)

## 1. Overview & Core Philosophy
A fast, lightweight, offline-first note-taking web application and Chrome Extension modeled after Google Keep, stripped of bloat and focused on speed and capture friction-reduction.

- **No-Title Design**: Notes have **no title field**—only a body (plain text or checklist items).
- **Excluded Features**: No reminders, no calendar integration, no Google Calendar sync.
- **Included Core Features**: Quick capture, color coding, labels/tags, pinning, archive/trash, instant search, Chrome Extension clipper, and full offline cache/sync.

---

## 2. Feature Specifications

### 2.1 Core Note Capabilities
- **Body-Only Notes**: Every note consists strictly of body content—either freeform text or an interactive checklist (with drag-to-reorder and auto-move checked items to bottom).
- **Color Coding**: Palette of ~12 curated background colors (Default, Coral, Peach, Sand, Mint, Sage, Fog, Storm, Dusk, Blossom, Clay, Chalk) with automatic dark/light mode contrast adaptation.
- **Labels (Tagging)**:
  - Create, rename, and delete labels globally from the sidebar.
  - Attach multiple labels to a note via a popover menu or inline `#label` typing.
  - Filter main feed by clicking any label in the sidebar.
- **Note Lifecycle & Organization**:
  - **Pinning**: Pin critical notes to a dedicated "Pinned" top section.
  - **High-Density Rectangular Masonry View (Simultaneous Visual Scanning)**:
    - Engineered specifically so you can **view dozens of notes simultaneously at a glance** rather than reading a linear document list.
    - Notes render as compact **rectangular cards** (`~240px` fixed width in multi-column layout) that dynamically adjust their vertical height (`min-height` to `max-height` clamp) strictly proportional to the character count/line count of the body.
    - **Typography Scaling**: Short notes automatically render with slightly larger font sizes for instant visual recognition, while longer notes scale down and truncate cleanly after ~12–15 lines, preventing any single note from dominating the viewport.
    - **Bin-Packing Layout Algorithm**: Cards pack tightly into columns with minimal vertical dead space (Masonry layout) so your eye can scan color-coded rectangular blocks across the entire screen in parallel.
    - Includes a toggle to switch between the **Multi-Column Rectangular Grid** and a single-column **List View**.
  - **Archive**: One-click archive to remove from the main stream without deleting; accessible in the Archive view.
  - **Trash**: Soft-delete notes to Trash (auto-purged after 7 or 30 days, or empty manually).
- **Search & Filtering**:
  - Instant client-side search across note body text, checklist items, and labels.
  - Quick filter chips by **Color**, **Label**, and **Domain/Website**.
- **Media & Rich Capture (Minimal)**:
  - Image attachments (drag-and-drop or paste from clipboard) rendered in a clean top-grid above the note body.
  - Automatic URL link previews at the bottom of the note card.

### 2.2 Chrome Extension (Web Clipper & Proactive Overlay)
- **One-Click Popup & Context Menu**:
  - Clicking the extension icon opens a compact floating modal right on the active webpage.
  - Automatically captures the **Source Page URL** and **Normalized Domain/Hostname** (e.g., `github.com`) along with the favicon.
  - Highlighting text on any webpage -> Right-click *"Save selection to Keep"* immediately appends/creates a note with the selected quote + page URL.
- **Inline Controls in Extension**:
  - Add/edit note body text immediately while browsing.
  - Apply **Color** and **Labels** directly inside the extension popup before saving.
- **Offline Extension Queue**:
  - Uses `chrome.storage.local` + background Service Worker (`manifest_version: 3`) to save clips and query domain matches offline, syncing to the backend when connectivity returns.

### 2.3 Custom / Future Features (User Expansion Space)
> [!NOTE]
> **Add your custom features, workflows, or AI/automation ideas below:**

- [x] **Feature Slot 1 — Proactive Contextual Notes ("Notes Find You")**:
  - **Problem**: Traditional Google Keep is passive ("dead")—it waits for you to remember to visit the app and search for what you wrote.
  - **Solution**: When you write a note or clip an idea while on a site (e.g., `github.com`), the note binds to that **domain (`source_domain`) and/or URL pattern**. The next time you visit `github.com`, the Chrome Extension automatically detects matching notes in local cache and **pops up a non-intrusive floating note widget (Shadow DOM overlay)** in the corner of the page showing the exact rectangular color-coded note(s) you wrote there previously.
  - **Interactions**: Edit the note inline right on the website, add new thoughts, snooze/dismiss for the current session, or toggle between **Domain Match** (`*.github.com`) and **Exact URL/Repo Match** (`github.com/org/repo`).
- [ ] **Feature Slot 2**: _[Describe feature here...]_
- [ ] **Feature Slot 3**: _[Describe feature here...]_
- [x] **Custom Extension Behavior — Active URL Listener & Shadow DOM Injection**:
  - Background Service Worker listens to `chrome.tabs.onUpdated` / `webNavigation.onCommitted`.
  - Queries local IndexedDB/`chrome.storage.local` index by `source_domain` in `< 2ms`.
  - If matching notes exist (and aren't archived/trashed), injects an isolated Shadow DOM `<ContextualNoteToast />` `.tsx` component directly onto the host page.

---

## 3. Frontend Architecture (React + TypeScript `.tsx`)

### 3.1 Tech Stack & Structure
- **Framework**: React 18+ with TypeScript (`.tsx`), Vite (shared component library between Web App and Chrome Extension Content Script).
- **Styling**: Tailwind CSS + CSS Variables for dynamic note color theming (light/dark palette mapping).
- **State & Local Cache**:
  - **IndexedDB** (via `Dexie.js` or `idb`) as the **primary source of truth** for both the Web App and Extension.
  - **Zustand** or **TanStack Query** synced with IndexedDB for zero-latency optimistic UI updates.
- **Key `.tsx` Components**:
  - `<QuickCaptureBar />`: Auto-expanding top input box; clicking outside auto-saves the note if non-empty.
  - `<MasonryGrid />`: High-density rectangular bin-packing layout (`~240px` column width, dynamic card heights) supporting drag-and-drop reordering and Pinned/Others sections.
  - `<NoteCard />`: Rectangular card with dynamic typography scaling (larger text for short notes, clamped lines for long notes), image thumbnails, label pills, source domain chip, and hover action toolbar.
  - `<NoteModal />`: Expanded focus view when clicking a card, with seamless URL/history state.
  - `<SidebarNav />`: Collapsible drawer for *Notes*, *Labels* (dynamic list + edit modal), *Archive*, and *Trash*.
  - `<ContextualNoteOverlay />` *(Extension Content Script)*: Floating Shadow-DOM rectangular note widget that pops up automatically when visiting a website with existing bound notes.

### 3.2 Offline-First & Local Caching Strategy
1. **Service Worker (PWA & MV3)**: Caches static assets (`.js`, `.css`, fonts, icons) via Workbox so the app loads instantaneously with zero network.
2. **IndexedDB Stores**:
   - `notes_store`: Full local replica of active, archived, and trashed notes, indexed by `source_domain` and `source_url` for instant extension lookup.
   - `labels_store`: Full local replica of user labels.
   - `sync_outbox`: Ordered queue of offline mutations (`CREATE`, `UPDATE`, `DELETE`) with client-generated UUIDs and timestamps.
3. **Sync Loop**:
   - All reads come directly from IndexedDB (`< 5ms` render).
   - Writes mutate IndexedDB immediately and enqueue an operation in `sync_outbox`.
   - When online, a background worker flushes `sync_outbox` to `POST /api/v1/sync` and pulls delta updates since `last_synced_at`.

### 3.3 Custom Frontend Notes (User Expansion Space)
- **Additional UI Components / Views**: _[Add your custom components or UI tweaks here...]_

---

## 4. Backend Architecture

### 4.1 Tech Stack & Responsibilities
- **Runtime**: Node.js (Fastify or Express with TypeScript) or Bun/Hono.
- **ORM / Query Builder**: Drizzle ORM or Prisma with PostgreSQL.
- **Auth**: JWT / Session cookies (shared with Chrome Extension via secure token exchange).
- **Core Responsibilities**:
  - Delta synchronization endpoint (`/api/v1/sync`) using Last-Write-Wins (LWW) per-field or `updated_at` HLC (Hybrid Logical Clock) resolution.
  - Fast domain/URL lookup endpoint (`/api/v1/notes/context?domain=github.com`) as a fallback when extension cache is cold.
  - REST endpoints for standard CRUD fallback and media upload presigned URLs (S3/R2/local).
  - Scheduled background job to hard-delete notes in Trash where `trashed_at < NOW() - INTERVAL '30 days'`.

### 4.2 API Endpoints
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/v1/sync` | Push local `sync_outbox` mutations & pull server changes since `last_synced_at` |
| `GET` | `/api/v1/notes` | Paginated/filtered list of notes (fallback / initial hydration) |
| `GET` | `/api/v1/notes/context` | Query active notes matching `domain` or `url` for proactive extension popup |
| `POST` | `/api/v1/notes` | Direct note creation (used by Web Clipper or API) |
| `PATCH` | `/api/v1/notes/:id` | Partial update (body, color, pin, archive, trash, sort_order, match_scope) |
| `GET/POST/DELETE` | `/api/v1/labels` | Manage labels and note-label associations |

### 4.3 Custom Backend Notes (User Expansion Space)
- **Additional Endpoints / Workers / Integrations**: _[Add your custom backend services here...]_

---

## 5. Database Schema (PostgreSQL)

Designed for UUID client-side generation, fast full-text search, domain-based contextual triggers, and incremental delta sync (`updated_at` indexing).

```sql
-- Enable UUID and Trigram extensions for fast search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Notes Table (No title column — body-only design)
CREATE TABLE notes (
    id UUID PRIMARY KEY, -- Client-generated UUIDv4/v7 for offline creation
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL DEFAULT '',
    is_checklist BOOLEAN NOT NULL DEFAULT FALSE,
    checklist_items JSONB DEFAULT '[]'::jsonb, -- [{ "id": "uuid", "text": "...", "checked": false, "position": 1000 }]
    color VARCHAR(32) NOT NULL DEFAULT 'default',
    source_url TEXT, -- Full URL captured when created via Chrome Extension (e.g., https://github.com/org/repo)
    source_domain VARCHAR(255), -- Normalized hostname for proactive resurfacing (e.g., github.com)
    url_match_scope VARCHAR(16) NOT NULL DEFAULT 'domain', -- 'domain' | 'exact_url' | 'disabled'
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_trashed BOOLEAN NOT NULL DEFAULT FALSE,
    position DOUBLE PRECISION NOT NULL DEFAULT 0, -- LexoRank / float for manual grid drag-and-drop
    trashed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft-delete tombstone for offline delta sync
);

-- 3. Labels Table
CREATE TABLE labels (
    id UUID PRIMARY KEY, -- Client-generated UUID
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, name)
);

-- 4. Note <-> Labels Junction Table
CREATE TABLE note_labels (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Tombstone for unlinking during offline sync
    PRIMARY KEY (note_id, label_id)
);

-- 5. Attachments Table (Images / Media)
CREATE TABLE note_attachments (
    id UUID PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Offline Delta Sync, Proactive Domain Lookup & Instant Search
CREATE INDEX idx_notes_user_updated ON notes (user_id, updated_at);
CREATE INDEX idx_notes_user_domain ON notes (user_id, source_domain) WHERE is_archived = FALSE AND is_trashed = FALSE AND deleted_at IS NULL;
CREATE INDEX idx_labels_user_updated ON labels (user_id, updated_at);
CREATE INDEX idx_notes_body_trgm ON notes USING GIN (body gin_trgm_ops);
```

### 5.1 Custom Database Tables / Columns (User Expansion Space)
```sql
-- Add your custom tables, columns, or indexes below:

```

