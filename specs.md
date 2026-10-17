# Fuse (Google Keep Reverse-Engineered) — Product & Technical Specification (`specs.md`)

## 1. Overview & Core Engineering Principles
**Fuse** is a fast, lightweight, offline-first note-taking web application and proactive Chrome Extension modeled after Google Keep, stripped of calendar/reminder bloat and engineered for zero-friction capture and contextual resurfacing.

### 1.1 Reverse-Engineered Google Keep Principles (Mandatory for Coding Agent)
1. **Zero-Friction Implicit Save (No "Save" Button)**: Users never click a "Save" button. Clicking outside the Quick Capture bar, pressing `Esc`, or closing an expanded note modal immediately commits the mutation to IndexedDB and queues background sync. Empty notes are automatically discarded.
2. **No-Title, Body-First Architecture**: Notes have **no title column or field**—only a body (plain text or interactive checklist items). Capture starts on the very first keystroke.
3. **Calm, Content-Forward Surface**: Action toolbars on cards are invisible at rest (`opacity: 0`) and only fade in on hover/focus (`150ms cubic-bezier`), keeping the viewport calm and free of visual noise.
4. **Spatial Memory & Simultaneous Visual Scanning**: Notes are rendered as compact rectangular cards (`~240px` width) in a tight Masonry bin-packing layout so the human eye can scan dozens of color-coded thoughts in parallel across a 2D plane.
5. **Sub-5ms Local-First Speed**: Every read and write happens against client-side storage (IndexedDB / `chrome.storage.local`) first. Network latency is never visible to the user.
6. **Excluded Features**: Strictly **no reminders, no calendar integration, no Google Calendar sync, and no Google Tasks integration**.

---

## 2. Feature Specifications

### 2.1 Core Note Capabilities (Including All Essential Google Keep Mechanics)
- **Body-Only Notes & Seamless Text <-> Checklist Conversion**:
  - Every note is either freeform body text or an interactive checklist.
  - One-click *"Show checkboxes"* toggle converts newline-separated text lines into interactive checklist items (and vice-versa) without losing content.
  - Checklists support drag-and-drop vertical reordering, automatic indentation (sub-items), and an collapsible *"X Checked items"* footer section at the bottom of the note.
- **Priority-First 12-Color System**:
  - Uses Google Keep's 12 curated pastel/dark-adapted background colors (`Chalk/Default`, `Coral`, `Storm`, `Peach`, `Sand`, `Mint`, `Sage`, `Fog`, `Dusk`, `Blossom`, `Clay`), ordered with **Red (`Coral`), Blue (`Storm`), and Black/Charcoal (`Clay`/`Chalk`) first** as primary semantic state indicators (see Feature Slot 2).
- **Labels (Tagging)**:
  - Create, rename, and delete labels globally from the sidebar.
  - Attach multiple labels to a note via the card popover menu or inline `#label` autocomplete typing inside the note body.
  - Filter main feed by clicking any label in the sidebar.
- **Note Lifecycle, Multi-Select & Organization**:
  - **Pinning**: Pin critical notes to a dedicated "Pinned" top section above "Others".
  - **High-Density Rectangular Masonry View (Simultaneous Visual Scanning)**:
    - Engineered specifically so you can **view dozens of notes simultaneously at a glance** rather than reading a linear document list.
    - Notes render as compact **rectangular cards** (`240px` fixed width in multi-column layout) that dynamically adjust their vertical height (`min-height: 60px` to `max-height: 380px` clamp) strictly proportional to the character/line count of the body.
    - **Typography Scaling**: Short notes (`< 60` chars) automatically render with larger font sizes (`18px–22px`) for instant visual recognition, while longer notes scale down (`14px–16px`) and truncate cleanly after ~12–15 lines.
    - **Bin-Packing Layout Algorithm**: Cards pack tightly into columns with `16px` gaps and minimal vertical dead space so your eye can scan color-coded rectangular blocks across the entire screen in parallel.
    - Toggle between **Multi-Column Rectangular Grid** and single-column **List View** (`600px` centered cards).
  - **Multi-Select Batch Operations**: Top-left checkmark badge appears on card hover (or `Shift+Click`), selecting multiple cards and revealing a floating top batch action bar (Batch Color Change, Batch Label, Batch Pin, Batch Archive, Batch Delete).
  - **Duplicate & Copy**: *"Make a copy"* action in the card menu (`...`) clones the note body, color, and labels immediately; one-click copy-to-clipboard.
  - **Version Undo/Redo Stack**: In-editor character/checklist undo & redo (`Ctrl+Z` / `Ctrl+Y`), plus a 5-second bottom-left **Undo Toastbar** whenever a note is archived, trashed, or batch-modified.
  - **Global Keyboard Shortcuts**:
    - `c`: Focus Quick Capture bar to create a new note.
    - `/`: Focus global search bar.
    - `j` / `k`: Move focus ring to next / previous note card in the grid.
    - `e`: Archive focused/selected note(s).
    - `#` or `Delete`: Move focused/selected note(s) to Trash.
    - `p`: Toggle Pin on focused/selected note(s).
    - `?`: Open keyboard shortcuts cheat-sheet modal.
  - **Archive & Trash**: One-click archive removes notes from the main stream while keeping them searchable; Trash soft-deletes notes (auto-purged after 30 days or emptied manually).
- **Search & Multi-Facet Filtering**:
  - Instant client-side search across note body text, checklist items, labels, and source URLs with matched-term text highlighting.
  - Clicking the search bar before typing displays instant filter grids by **Color** (with Priority State colors first), **Label**, **Note Type** (Lists, Images, Links), and **Website Domain**.
- **Media & Rich Capture (Minimal)**:
  - Image attachments (drag-and-drop or paste from clipboard) rendered in a clean edge-to-edge top grid above the note body, plus OCR/alt-text indexing if available.
  - Automatic URL link preview chips at the bottom of the note card with domain favicon and page title.

### 2.2 Chrome Extension (Web Clipper & Proactive Overlay)
- **One-Click Popup & Context Menu**:
  - Clicking the extension icon opens a compact floating modal right on the active webpage.
  - Automatically captures the **Source Page URL** and **Normalized Domain/Hostname** (e.g., `github.com`) along with the favicon.
  - Highlighting text on any webpage -> Right-click *"Save selection to Fuse"* immediately appends/creates a note with the selected quote + page URL.
- **Inline Controls in Extension**:
  - Add/edit note body text immediately while browsing.
  - Apply **Priority State Color (Red / Blue / Black first)** and **Labels** directly inside the extension popup before closing.
- **Offline Extension Queue**:
  - Uses `chrome.storage.local` + background Service Worker (`manifest_version: 3`) to save clips and query domain matches offline, syncing to the backend when connectivity returns.

### 2.3 Custom / Future Features (User Expansion Space)
> [!NOTE]
> **Custom features engineered for Fuse & expansion slots:**

- [x] **Feature Slot 1 — Proactive Contextual Notes ("Notes Find You")**:
  - **Problem**: Traditional Google Keep is passive ("dead")—it waits for you to remember to visit the app and search for what you wrote.
  - **Solution**: When you write a note or clip an idea while on a site (e.g., `github.com`), the note binds to that **domain (`source_domain`) and/or URL pattern**. The next time you visit `github.com`, the Chrome Extension automatically detects matching notes in local cache and **pops up a non-intrusive floating note widget (Shadow DOM overlay)** in the corner of the page showing the exact rectangular color-coded note(s) you wrote there previously.
  - **Interactions**: Edit the note inline right on the website, add new thoughts, snooze/dismiss for the current session, or toggle between **Domain Match** (`*.github.com`) and **Exact URL/Repo Match** (`github.com/org/repo`).
- [x] **Feature Slot 2 — Priority State Color System (Red, Blue, Black Primary Ordering)**:
  - **Concept**: Uses Google Keep's 12 calm pastel/dark-adapted background colors, but elevates **Red (`Coral`), Blue (`Storm`), and Black/Charcoal (`Clay`/`Chalk`)** to the **first 3 primary positions** in every color picker, filter bar, and keyboard shortcut (`Alt+1` Red, `Alt+2` Blue, `Alt+3` Black) to represent note seriousness/state:
    1. **Red (`Coral` — Urgent / Serious / Action State)**: Critical bugs, blockers, high-priority ideas, or urgent warnings on a site.
    2. **Blue (`Storm` — Active / Deep Work / Reference State)**: Ongoing research, architecture notes, or active project context.
    3. **Black/Charcoal (`Clay` / `Chalk` — Standard / Neutral / Vault State)**: Baseline calm thoughts, logs, and general capture.
    4. **Remaining 9 Google Keep Colors (`Peach`, `Sand`, `Mint`, `Sage`, `Fog`, `Dusk`, `Blossom`, etc.)**: Follow immediately after the primary 3 in the palette for secondary thematic organization.
  - **Visual Treatment**: See [design.md](file:///workspaces/fuse/design.md) for the exact calm hex tokens, border accents, and dark/light mode adaptations so Red, Blue, and Black command semantic priority without causing eye strain.
- [ ] **Feature Slot 3**: _[Describe feature here...]_
- [x] **Custom Extension Behavior — Active URL Listener & Shadow DOM Injection**:
  - Background Service Worker listens to `chrome.tabs.onUpdated` / `webNavigation.onCommitted`.
  - Queries local IndexedDB/`chrome.storage.local` index by `source_domain` in `< 2ms`, sorting **Red (Serious/Urgent)** notes to the top of the overlay stack.
  - If matching notes exist (and aren't archived/trashed), injects an isolated Shadow DOM `<ContextualNoteOverlay />` `.tsx` component directly onto the host page.

---

## 3. Frontend Architecture (React + TypeScript `.tsx`)

### 3.1 Tech Stack & Structure
- **Framework**: React 18+ with TypeScript (`.tsx`), Vite (shared component library between Web App and Chrome Extension Content Script).
- **Styling**: Tailwind CSS + CSS Variables defined in [design.md](file:///workspaces/fuse/design.md) for calm dynamic note color theming.
- **State & Local Cache**:
  - **IndexedDB** (via `Dexie.js` or `idb`) as the **primary source of truth** for both the Web App and Extension.
  - **Zustand** or **TanStack Query** synced with IndexedDB for zero-latency optimistic UI updates.
- **Key `.tsx` Components**:
  - `<QuickCaptureBar />`: Auto-expanding top input box; clicking outside auto-saves the note if non-empty.
  - `<MasonryGrid />`: High-density rectangular bin-packing layout (`240px` column width, dynamic card heights) supporting drag-and-drop reordering and Pinned/Others sections.
  - `<NoteCard />`: Rectangular card with dynamic typography scaling, checklist interactivity, multi-select checkmark, image thumbnails, label pills, source domain chip, and hover-reveal action toolbar.
  - `<ColorStatePicker />`: Popover palette ordering **Red (`Coral`), Blue (`Storm`), Black (`Clay`/`Chalk`)** first with semantic state tooltips, followed by the remaining 9 Google Keep colors.
  - `<NoteModal />`: Spring-animated expanded focus view when clicking a card, with seamless URL/history state.
  - `<SidebarNav />`: Collapsible drawer for *Notes*, *Labels* (dynamic list + edit modal), *Archive*, and *Trash*.
  - `<ContextualNoteOverlay />` *(Extension Content Script)*: Floating Shadow-DOM rectangular note widget that pops up automatically when visiting a website with existing bound notes.

### 3.2 Offline-First & Local Caching Strategy
1. **Service Worker (PWA & MV3)**: Caches static assets (`.js`, `.css`, fonts, icons) via Workbox so the app loads instantaneously with zero network.
2. **IndexedDB Stores**:
   - `notes_store`: Full local replica of active, archived, and trashed notes, indexed by `source_domain`, `source_url`, `color`, and `updated_at`.
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
| `PATCH` | `/api/v1/notes/:id` | Partial update (body, color, priority_state, pin, archive, trash, position, match_scope) |
| `GET/POST/DELETE` | `/api/v1/labels` | Manage labels and note-label associations |

### 4.3 Custom Backend Notes (User Expansion Space)
- **Additional Endpoints / Workers / Integrations**: _[Add your custom backend services here...]_

---

## 5. Database Schema (PostgreSQL)

Designed for UUID client-side generation, fast full-text search, priority color states, domain-based contextual triggers, and incremental delta sync (`updated_at` indexing).

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
    -- 12 Google Keep colors, with Primary State Colors first:
    -- Primary: 'coral' (Red/Serious), 'storm' (Blue/Active), 'clay' / 'chalk' (Black/Neutral)
    -- Secondary: 'peach', 'sand', 'mint', 'sage', 'fog', 'dusk', 'blossom', 'default'
    color VARCHAR(32) NOT NULL DEFAULT 'chalk',
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
CREATE INDEX idx_notes_user_color ON notes (user_id, color) WHERE is_trashed = FALSE AND deleted_at IS NULL;
CREATE INDEX idx_labels_user_updated ON labels (user_id, updated_at);
CREATE INDEX idx_notes_body_trgm ON notes USING GIN (body gin_trgm_ops);
```

### 5.1 Custom Database Tables / Columns (User Expansion Space)
```sql
-- Add your custom tables, columns, or indexes below:

```

---

## 6. Hyper-Specific Directive for the Coding Agent (GitHub Issue Decomposition & Verification Mandate)

> [!IMPORTANT]
> **INSTRUCTIONS FOR THE AUTONOMOUS CODING AGENT READING `specs.md` AND `design.md`:**
> Do **NOT** rely on pre-written issues. Your primary initial task is to **read both `specs.md` and `design.md` in their entirety and decompose the full implementation of Fuse into small, atomic, dependency-ordered GitHub Issues yourself.**

### 6.1 Rules for Decomposing `specs.md` & `design.md` into Atomic GitHub Issues
1. **Self-Authored Atomic Scope**:
   - You (the coding agent) must author and create the GitHub Issues directly from this specification.
   - Each GitHub Issue must represent **one single, cohesive, independently verifiable unit of work** (e.g., a single database migration/model layer, a single API endpoint, the IndexedDB outbox store, the `<MasonryGrid />` bin-packing component, the `<ColorStatePicker />` with Red/Blue/Black priority ordering, or the Chrome Extension Shadow DOM `<ContextualNoteOverlay />`).
   - Do **not** bundle Frontend, Backend, and Extension tasks into monolithic issues.
2. **Design & Spec Traceability**:
   - Every GitHub Issue description must explicitly cite the exact section of `specs.md` (functional/architectural requirement) and `design.md` (exact hex colors, padding tokens, typography scale, border radii, transitions) that it implements.
3. **Mandatory Tests, Linters & Verification Per Issue (Non-Negotiable)**:
   - **Every single GitHub Issue you generate and implement MUST include its own dedicated automated tests, linter checks, and typechecks specific to that issue's scope.**
   - No issue may be marked complete or merged without passing:
     - **Strict TypeScript & Linting**: `tsc --noEmit` (zero `any` types, strict null checks) and ESLint/Biome rules verifying component/API contracts.
     - **Issue-Specific Automated Tests**:
       - *Database/Backend Issues*: Integration tests against PostgreSQL verifying constraints, UUID idempotency, trigram search, `source_domain` partial index queries, and LWW delta sync conflict resolution.
       - *Frontend `.tsx` & Design Issues*: Component tests (Vitest + React Testing Library / Playwright) asserting body-only capture (no title field), dynamic font-size scaling (`< 60` chars vs long notes), Red/Blue/Black priority ordering in the 12-color palette, computed CSS token compliance (`design.md`), and `< 5ms` IndexedDB optimistic mutations.
       - *Chrome Extension Issues*: Automated tests verifying `source_domain` extraction, offline `chrome.storage.local` queuing, and Shadow DOM injection of `<ContextualNoteOverlay />` when revisiting a bound domain like `github.com`.
   - Every GitHub Issue body you write **must contain a `"Verification & Test Plan"` section** listing the exact test file paths to create and the exact CLI test/linter commands that prove the issue is solved.

## 6. Hyper-Specific Directive for the Coding Agent (GitHub Issue Decomposition & Verification Mandate)

> [!IMPORTANT]
> **INSTRUCTIONS FOR THE AUTONOMOUS CODING AGENT READING `specs.md` AND `design.md`:**
> Do **NOT** rely on pre-written issues. Your primary initial task is to **read both `specs.md` and `design.md` in their entirety and decompose the full implementation of Fuse into small, atomic, dependency-ordered GitHub Issues yourself.**

### 6.1 Rules for Decomposing `specs.md` & `design.md` into Atomic GitHub Issues
1. **Self-Authored Atomic Scope**:
   - You (the coding agent) must author and create the GitHub Issues directly from this specification.
   - Each GitHub Issue must represent **one single, cohesive, independently verifiable unit of work** (e.g., a single database migration/model layer, a single API endpoint, the IndexedDB outbox store, the `<MasonryGrid />` bin-packing component, the `<ColorStatePicker />` with Red/Blue/Black priority ordering, or the Chrome Extension Shadow DOM `<ContextualNoteOverlay />`).
   - Do **not** bundle Frontend, Backend, and Extension tasks into monolithic issues.
2. **Design & Spec Traceability**:
   - Every GitHub Issue description must explicitly cite the exact section of `specs.md` (functional/architectural requirement) and `design.md` (exact hex colors, padding tokens, typography scale, border radii, transitions) that it implements.
3. **Mandatory Tests, Linters & Verification Per Issue (Non-Negotiable)**:
   - **Every single GitHub Issue you generate and implement MUST include its own dedicated automated tests, linter checks, and typechecks specific to that issue's scope.**
   - No issue may be marked complete or merged without passing:
     - **Strict TypeScript & Linting**: `tsc --noEmit` (zero `any` types, strict null checks) and ESLint/Biome rules verifying component/API contracts.
     - **Issue-Specific Automated Tests**:
       - *Database/Backend Issues*: Integration tests against PostgreSQL verifying constraints, UUID idempotency, trigram search, `source_domain` partial index queries, and LWW delta sync conflict resolution.
       - *Frontend `.tsx` & Design Issues*: Component tests (Vitest + React Testing Library / Playwright) asserting body-only capture (no title field), dynamic font-size scaling (`< 60` chars vs long notes), Red/Blue/Black priority ordering in the 12-color palette, computed CSS token compliance (`design.md`), and `< 5ms` IndexedDB optimistic mutations.
       - *Chrome Extension Issues*: Automated tests verifying `source_domain` extraction, offline `chrome.storage.local` queuing, and Shadow DOM injection of `<ContextualNoteOverlay />` when revisiting a bound domain like `github.com`.
   - Every GitHub Issue body you write **must contain a `"Verification & Test Plan"` section** listing the exact test file paths to create and the exact CLI test/linter commands that prove the issue is solved.

