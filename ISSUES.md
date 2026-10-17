# Fuse — GitHub Issue Roadmap & Implementation Plan

This roadmap decomposes [`specs.md`](file:///workspaces/fuse/specs.md) and [`design.md`](file:///workspaces/fuse/design.md) into 15 atomic, dependency-ordered GitHub Issues in accordance with Section 3 and Section 4 of [`AGENTS.md`](file:///workspaces/fuse/AGENTS.md).

---

## Issue Index

| Issue # | Title | Target Subsystem | Status |
| :---: | :--- | :--- | :---: |
| **01** | [Monorepo & Next.js 15+ Workspace Setup with Strict TypeScript & Vitest](#issue-01-monorepo--nextjs-15-workspace-setup-with-strict-typescript--vitest) | Project Architecture | ✅ Completed |
| **02** | [PostgreSQL Database Schema, Drizzle ORM Models & Trigram Indexes](#issue-02-postgresql-database-schema-drizzle-orm-models--trigram-indexes) | Backend / Database | ✅ Completed |
| **03** | [Design System CSS Custom Properties, Dual-Theme Tokens & Priority 12-Color Palette](#issue-03-design-system-css-custom-properties-dual-theme-tokens--priority-12-color-palette) | Frontend Design System | ✅ Completed |
| **04** | [IndexedDB Local-First Engine (`Dexie.js`) & Offline `sync_outbox` Mutation Store](#issue-04-indexeddb-local-first-engine-dexiejs--offline-sync_outbox-mutation-store) | Client Storage & State | ✅ Completed |
| **05** | [Dynamic Typography Scaling Engine & Rectangular `<NoteCard />` Component](#issue-05-dynamic-typography-scaling-engine--rectangular-notecard--component) | Core UI Components | ✅ Completed |
| **06** | [Greedy Bin-Packing `<MasonryGrid />` & Pinned/Others Section Layout](#issue-06-greedy-bin-packing-masonrygrid--pinnedothers-section-layout) | Core UI Components | ✅ Completed |
| **07** | [Zero-Friction `<QuickCaptureBar />` & Shared-Element `<NoteModal />` with Auto-Save](#issue-07-zero-friction-quickcapturebar--shared-element-notemodal-with-auto-save) | Core UI Components | ✅ Completed |
| **08** | [Priority State `<ColorStatePicker />` (Red, Blue, Black Primary Ordering)](#issue-08-priority-state-colorstatepicker-red-blue-black-primary-ordering) | Core UI Components | ✅ Completed |
| **09** | [Labels System, Dynamic `<SidebarNav />` Drawer & Inline `#label` Autocomplete](#issue-09-labels-system-dynamic-sidebarnav--drawer--inline-label-autocomplete) | Core UI & Navigation | ✅ Completed |
| **10** | [Multi-Select Batch Actions & Global Keyboard Navigation (`c`, `/`, `j`, `k`, `e`, `#`, `p`)](#issue-10-multi-select-batch-actions--global-keyboard-navigation-c--j-k-e--p) | Interactions & Accessibility | ✅ Completed |
| **11** | [Instant Client-Side Search Highlighting & Multi-Facet Filter Bar](#issue-11-instant-client-side-search-highlighting--multi-facet-filter-bar) | Search & Discovery | 🔄 In Progress |
| **12** | [Backend Delta Sync (`/api/v1/sync` LWW) & Domain Context REST API](#issue-12-backend-delta-sync-apiv1sync-lww--domain-context-rest-api) | Backend API | ⏳ Pending |
| **13** | [Chrome Extension Manifest V3 Web Clipper & Active URL Listener](#issue-13-chrome-extension-manifest-v3-web-clipper--active-url-listener) | Chrome Extension | ⏳ Pending |
| **14** | [Chrome Extension Shadow DOM Proactive Overlay (`<ContextualNoteOverlay />`)](#issue-14-chrome-extension-shadow-dom-proactive-overlay-contextualnoteoverlay) | Chrome Extension | ⏳ Pending |
| **15** | [Full-System Integration, PWA Offline Service Worker & Quality Verification Gate](#issue-15-full-system-integration-pwa-offline-service-worker--quality-verification-gate) | Integration & QA | ⏳ Pending |

---

### Issue 01: Monorepo & Next.js 15+ Workspace Setup with Strict TypeScript & Vitest
- **Spec & Design References**: `specs.md` §3.1; `AGENTS.md` §2, §4.
- **Implementation Scope**: Root `package.json`, Next.js 15+ (App Router, React 19), TypeScript strict config (`"strict": true`, no `any`), Tailwind CSS v4 / postcss config, Vitest + React Testing Library + happy-dom, ESLint / Biome setup.
- **Verification & Test Plan**: `npm run lint`, `npm run typecheck`, and `npm test` passing with zero warnings/errors.

### Issue 02: PostgreSQL Database Schema, Drizzle ORM Models & Trigram Indexes
- **Spec & Design References**: `specs.md` §5 (Exact SQL schema, `notes` table without title column, `source_domain`, `pg_trgm`, `sync` indexes).
- **Implementation Scope**: Drizzle ORM configuration, schema definition (`users`, `notes`, `labels`, `note_labels`, `note_attachments`), migration scripts, and Docker compose / test DB harness.
- **Verification & Test Plan**: Drizzle schema unit tests, migration integration test verifying UUID generation, trigram index, and partial domain index.

### Issue 03: Design System CSS Custom Properties, Dual-Theme Tokens & Priority 12-Color Palette
- **Spec & Design References**: `design.md` §2.1 (Dual-Theme Color Token Table), §2.2 (Canvas/Text/Chrome Tokens); `specs.md` §2.1.
- **Implementation Scope**: `globals.css` with exact dual-theme CSS variables, Tailwind theme extension, theme toggle provider (`light` / `dark`), and note color token helper utilities.
- **Verification & Test Plan**: Unit tests asserting all 12 note colors map to exact hex codes, with `coral`, `storm`, and `clay` occupying slots 1, 2, and 3; theme switching snapshot tests.

### Issue 04: IndexedDB Local-First Engine (`Dexie.js`) & Offline `sync_outbox` Mutation Store
- **Spec & Design References**: `specs.md` §1.1 (Principle 5: < 5ms local-first), §3.2 (IndexedDB Stores & Sync Loop); `AGENTS.md` §1.
- **Implementation Scope**: `lib/db/dexie.ts` defining `notes_store`, `labels_store`, and `sync_outbox`, optimistic mutation hooks (`createNote`, `updateNote`, `deleteNote`, `enqueueSync`).
- **Verification & Test Plan**: Vitest suite with `fake-indexeddb` verifying sub-5ms local writes, UUID generation, soft-deletion tombstone tracking, and outbox sequencing.

### Issue 05: Dynamic Typography Scaling Engine & Rectangular `<NoteCard />` Component
- **Spec & Design References**: `design.md` §3.2 (Typography Scaling Rules: <=35 chars -> 22px; 36-90 -> 18px; 91-280 -> 14px; >280 clamped at 14 lines), §4.1 (240px rectangular card geometry, 8px border-radius, 12px 16px padding), §5 (hover transitions).
- **Implementation Scope**: `components/notes/NoteCard.tsx`, `components/notes/Checklist.tsx`, dynamic font scaling utility `lib/typography.ts`, action toolbar with hover reveal.
- **Verification & Test Plan**: RTL tests verifying no title element, exact font sizes applied for character thresholds, checklist item toggling, and hover toolbar opacity transition classes.

### Issue 06: Greedy Bin-Packing `<MasonryGrid />` & Pinned/Others Section Layout
- **Spec & Design References**: `specs.md` §2.1 (High-Density Rectangular Masonry View), §3.1; `design.md` §4.2 (240px columns, 16px gaps, shortest-column-first greedy placement, transform transitions, Pinned vs Others dividers).
- **Implementation Scope**: `components/grid/MasonryGrid.tsx`, `hooks/useMasonryColumns.ts`, bin-packing calculation engine, Grid vs List View toggle.
- **Verification & Test Plan**: Unit tests verifying shortest-column bin packing distributes varying card heights correctly without horizontal/vertical drift, responsive column calculation, and section separation.

### Issue 07: Zero-Friction `<QuickCaptureBar />` & Shared-Element `<NoteModal />` with Auto-Save
- **Spec & Design References**: `specs.md` §1.1 (Principle 1: Zero-Friction Implicit Save), §2.1; `design.md` §4.3 (46px collapsed height, floating shadow), §5 (Card-to-Modal 200ms cubic-bezier transition).
- **Implementation Scope**: `components/capture/QuickCaptureBar.tsx`, `components/modal/NoteModal.tsx`, click-outside hook, auto-save and empty-note discard mechanics.
- **Verification & Test Plan**: Component tests verifying auto-save commits on click-outside and `Esc`, empty notes are discarded without saving, text <-> checklist conversion preserves content.

### Issue 08: Priority State `<ColorStatePicker />` (Red, Blue, Black Primary Ordering)
- **Spec & Design References**: `specs.md` §2.3 (Feature Slot 2); `design.md` §2.1, §2.3 (2 rows of 6 circular swatches, 28x28px, Coral/Storm/Clay first with inner ring indicator).
- **Implementation Scope**: `components/palette/ColorStatePicker.tsx`, tooltip descriptions ("Serious / Urgent", "Active / Deep Work", "Neutral / Vault"), keyboard shortcuts (`Alt+1`, `Alt+2`, `Alt+3`).
- **Verification & Test Plan**: Component tests asserting order of swatches is strictly Coral, Storm, Clay, Chalk, etc., inner ring indicator presence, color change callback dispatch, and keyboard shortcuts.

### Issue 09: Labels System, Dynamic `<SidebarNav />` Drawer & Inline `#label` Autocomplete
- **Spec & Design References**: `specs.md` §2.1 (Labels & Tagging), §3.1 (`<SidebarNav />`); `design.md` §2.2 (`--bg-sidebar-active: #FEEFC3`).
- **Implementation Scope**: `components/sidebar/SidebarNav.tsx`, `components/labels/EditLabelsModal.tsx`, inline `#label` parser and autocomplete dropdown in note editor.
- **Verification & Test Plan**: Vitest tests verifying label creation, editing, deleting, inline hashtag parsing, filtering notes by selected label in sidebar, and active nav pill styling.

### Issue 10: Multi-Select Batch Actions & Global Keyboard Navigation (`c`, `/`, `j`, `k`, `e`, `#`, `p`)
- **Spec & Design References**: `specs.md` §2.1 (Multi-Select Batch Operations, Global Keyboard Shortcuts); `design.md` §5 (Selection checkmark animation).
- **Implementation Scope**: `hooks/useGlobalShortcuts.ts`, `components/toolbar/BatchActionBar.tsx`, selection state manager in Zustand, focus ring management (`j`/`k`).
- **Verification & Test Plan**: RTL tests for multi-selection via hover checkmark and `Shift+Click`, batch color change, batch archive, batch delete, and keyboard trigger firing for `c`, `/`, `j`, `k`, `e`, `#`, `p`.

### Issue 11: Instant Client-Side Search Highlighting & Multi-Facet Filter Bar
- **Spec & Design References**: `specs.md` §2.1 (Search & Multi-Facet Filtering); `design.md` §2.2.
- **Implementation Scope**: `components/search/SearchBar.tsx`, `components/search/FacetFilterGrid.tsx`, full-text client indexing search engine (body text, checklists, labels, domains), query highlight renderer.
- **Verification & Test Plan**: Vitest tests verifying sub-millisecond search query filtering, term match highlighting, and facet filtering by Color (Priority colors first), Label, and Website Domain.

### Issue 12: Backend Delta Sync (`/api/v1/sync` LWW) & Domain Context REST API
- **Spec & Design References**: `specs.md` §4.1, §4.2 (API Endpoints: `POST /api/v1/sync`, `GET /api/v1/notes/context?domain=...`, REST fallback endpoints).
- **Implementation Scope**: Next.js App Router API routes (`app/api/v1/sync/route.ts`, `app/api/v1/notes/context/route.ts`, `app/api/v1/notes/route.ts`, `app/api/v1/labels/route.ts`), Last-Write-Wins delta resolver, 30-day trash cleanup helper.
- **Verification & Test Plan**: Integration tests for LWW conflict resolution, tombstone soft-deletion processing, and domain context lookup queries.

### Issue 13: Chrome Extension Manifest V3 Web Clipper & Active URL Listener
- **Spec & Design References**: `specs.md` §2.2 (Web Clipper), §2.3 (Active URL Listener); `AGENTS.md` §1.
- **Implementation Scope**: Extension manifest `manifest.json` (MV3), background service worker `extension/background.ts`, extension popup `extension/popup.tsx`, context menu "Save selection to Fuse" handler, `source_domain` normalizer.
- **Verification & Test Plan**: Vitest / Playwright extension tests asserting URL normalization (e.g. `https://github.com/foo/bar` -> `github.com`), context menu clip generation, and offline queueing in `chrome.storage.local`.

### Issue 14: Chrome Extension Shadow DOM Proactive Overlay (`<ContextualNoteOverlay />`)
- **Spec & Design References**: `specs.md` §2.3 (Feature Slot 1 — Proactive Contextual Notes), §3.1; `design.md` §6 (Shadow DOM isolation, top 16px right 16px anchor, collapsed pill, expanded card, Red on top, slide in 220ms).
- **Implementation Scope**: `extension/content.ts`, `components/extension/ContextualNoteOverlay.tsx`, Shadow DOM injection wrapper, priority sorting (`coral` notes first), inline note editor and dismiss/snooze mechanics.
- **Verification & Test Plan**: Content script tests verifying Shadow DOM root creation with `:host { all: initial }`, proactive rendering when domain matches local notes, priority sorting of red notes to top, and inline edit persistence.

### Issue 15: Full-System Integration, PWA Offline Service Worker & Quality Verification Gate
- **Spec & Design References**: `specs.md` §1.1, §3.2; `design.md` All sections; `AGENTS.md` §1, §2, §4.
- **Implementation Scope**: PWA Service Worker (Workbox / Serwist), end-to-end integration tests (Playwright), dark/light mode seamless switching verification, strict lint and typecheck audit.
- **Verification & Test Plan**: Full test matrix: `npm run lint` (0 errors, 0 warnings), `npm run typecheck` (0 errors), Vitest suite (100% passing), Playwright E2E suite verifying offline capability and UI specs.
