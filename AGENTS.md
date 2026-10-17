# Fuse — Autonomous Coding Agent Operating Manual (`AGENTS.md`)

> [!IMPORTANT]
> **MANDATORY DIRECTIVE FOR ALL AI CODING AGENTS:**
> You must strictly adhere to [`specs.md`](file:///workspaces/fuse/specs.md) for all product, database, backend, offline-sync, and Chrome Extension requirements, and strictly adhere to [`design.md`](file:///workspaces/fuse/design.md) for all Frontend UI/UX, color tokens, typography scaling, rectangular card geometry, and motion physics. **Zero deviations, zero unrequested bloat, and zero skipped tests.**

---

## 1. Source-of-Truth Hierarchy

Before writing any code or creating any GitHub Issue, you must read and cross-reference:

1. **[`specs.md`](file:///workspaces/fuse/specs.md) — Functional & System Architecture Source of Truth**:
   - **Body-Only Notes**: Never add a `title` column to PostgreSQL or a title input field in `.tsx`. Notes have **body content only** (freeform text or interactive checklists).
   - **Strictly Excluded Features**: Never implement reminders, calendar views, Google Calendar sync, or Google Tasks integration.
   - **Proactive Chrome Extension ("Notes Find You")**: Notes created/clipped on a domain (e.g., `github.com`) must bind to `source_domain` / `source_url` and proactively pop up via an isolated Shadow DOM `<ContextualNoteOverlay />` when the user revisits that website.
   - **Priority State 12-Color System**: Must implement all 12 Google Keep colors with **Red (`coral`), Blue (`storm`), and Black/Slate (`clay`/`chalk`) ordered first** as the primary state indicators.
   - **Local-First Offline Cache**: All reads and writes hit **IndexedDB** (Web App) or `chrome.storage.local` / IndexedDB (Extension) in `< 5ms` first, queuing mutations in `sync_outbox` for background delta synchronization with PostgreSQL.

2. **[`design.md`](file:///workspaces/fuse/design.md) — Frontend & Extension Visual Source of Truth**:
   - Every `.tsx` component and CSS variable must match the exact hex codes (Light & Dark mode), `240px` rectangular Masonry card dimensions, `8px` border radius, `12px 16px` padding, dynamic character-length font scaling (`22px` micro / `18px` short / `14px` standard), hover-only toolbar opacity transitions, and calm surface aesthetic defined in `design.md`.

---

## 2. Technology Stack & "Latest Packages" Mandate

You must initialize and build the project using **the latest stable versions** of all frameworks, runtimes, and packages:

- **Frontend Framework**: **Latest Next.js (App Router, React 19+ / latest stable `.tsx`)** with TypeScript in strict mode (`"strict": true`, zero `any` allowed).
- **Styling**: **Latest Tailwind CSS** configured with the exact CSS custom properties (`--bg-canvas`, `--text-primary`, and the 12 dual-theme note color tokens) from [`design.md`](file:///workspaces/fuse/design.md).
- **Offline Storage & State**: Latest **Dexie.js** (or `idb`) for IndexedDB + **Zustand** / **TanStack Query (latest)** for reactive optimistic UI updates.
- **Database & ORM**: **PostgreSQL (latest)** with `pgcrypto` and `pg_trgm` extensions, managed via **Drizzle ORM (latest)** or **Prisma (latest)** matching the exact schema in Section 5 of [`specs.md`](file:///workspaces/fuse/specs.md).
- **Chrome Extension**: **Manifest V3 (`manifest_version: 3`)** bundled with Vite/CRXJS or Next/tsup using shared `.tsx` components and Shadow DOM style isolation.
- **Package Hygiene Rule**:
  - Always install the latest stable versions (`npm install <pkg>@latest` or `pnpm add <pkg>@latest`).
  - Never use deprecated libraries, legacy React patterns (no class components, no legacy Next.js `pages/` router), or outdated linter configs.

---

## 3. GitHub Issue Decomposition Workflow (Agent Must Self-Author Issues)

Your first execution phase is to **break down [`specs.md`](file:///workspaces/fuse/specs.md) and [`design.md`](file:///workspaces/fuse/design.md) into small, atomic, sequential GitHub Issues yourself**.

1. **Atomic Granularity**:
   - Do not create broad, vague issues. Break the build into focused, independently testable issues (e.g., *Issue 1: Monorepo/Next.js + Postgres + Drizzle Setup*, *Issue 2: PostgreSQL Schema & Trigram/Domain Indexes*, *Issue 3: Design System CSS Tokens & Priority 12-Color Palette*, *Issue 4: IndexedDB Local Store & Outbox Sync Engine*, *Issue 5: Rectangular `<NoteCard />` with Dynamic Typography Scaling*, *Issue 6: Bin-Packing `<MasonryGrid />`*, etc.).
2. **Required Issue Sections**:
   Every GitHub Issue you author must contain:
   - **Spec & Design References**: Exact section citations from `specs.md` and `design.md`.
   - **Implementation Scope**: Exact files, `.tsx` components, API routes, or SQL migrations to create/modify.
   - **Verification & Test Plan**: Exact automated test files, linter checks, and CLI commands that must pass before closing the issue.

---

## 4. Non-Negotiable Testing, Linting & Quality Gates (Per Issue)

> [!CAUTION]
> **NO ISSUE IS COMPLETE WITHOUT ITS OWN AUTOMATED TESTS AND LINTER PASS.**
> You are strictly forbidden from closing a GitHub Issue or moving to the next issue until all issue-specific tests and linters pass with zero errors.

For **every single GitHub Issue**, you must write and execute:

1. **Static Analysis & Type Safety**:
   - `tsc --noEmit` must pass with **0 errors**.
   - ESLint / Biome must pass with **0 warnings and 0 errors**.
2. **Issue-Specific Unit & Component Tests (Vitest + React Testing Library)**:
   - Verify no title field exists anywhere in the DOM or data model.
   - Verify `<ColorStatePicker />` renders all 12 Google Keep colors with **Red (`coral`), Blue (`storm`), and Black (`clay`/`chalk`) in positions 1, 2, and 3**.
   - Verify `<NoteCard />` applies `22px` font size for $\le 35$ chars, `18px` for $36\text{--}90$ chars, and `14px` with line-clamp for $> 90$ chars as specified in `design.md`.
   - Verify implicit auto-save on click-outside / `Esc` and `< 5ms` IndexedDB write persistence.
3. **Backend & Database Integration Tests**:
   - Verify `/api/v1/sync` Last-Write-Wins delta resolution, soft-delete tombstones (`deleted_at`), trigram search (`pg_trgm`), and `/api/v1/notes/context?domain=...` sub-millisecond indexed lookups.
4. **End-to-End & Extension Tests (Playwright)**:
   - Verify the rectangular Masonry grid layout, keyboard shortcuts (`c`, `/`, `j`, `k`, `e`, `#`, `p`), and the Chrome Extension Shadow DOM `<ContextualNoteOverlay />` automatically surfacing notes when revisiting a bound domain (e.g., `github.com`).

