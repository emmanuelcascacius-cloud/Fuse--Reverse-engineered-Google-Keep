# Issue 15: Full-System Integration, PWA Offline Service Worker & Quality Verification Gate

## Spec & Design References
- **`specs.md`**: Section 1.1 (All Reverse-Engineered Principles), Section 3.2 (Service Worker PWA), Section 6 (Mandatory Tests & Quality Gate).
- **`design.md`**: All visual specifications and motion physics.
- **`AGENTS.md`**: Section 4 (Non-Negotiable Testing, Linting & Quality Gates).

## Implementation Scope
1. **PWA Service Worker**:
   - `public/sw.js` and registration helper in `app/providers.tsx` caching app shell, fonts, and assets for offline load.
2. **End-to-End Integration Tests (Playwright / Vitest Integration)**:
   - Full user journey:
     - Load app offline.
     - Create body-only note in `<QuickCaptureBar />` -> auto-save on click-outside -> note appears in `<MasonryGrid />`.
     - Assign Priority Red (`coral`) color -> verify color styling and top priority.
     - Search for note -> term highlight.
     - Move to Trash -> Undo toastbar appears.
     - Simulate background sync with server.
3. **Comprehensive Quality Gate Run**:
   - `npm run lint` -> 0 warnings, 0 errors.
   - `npm run typecheck` -> 0 errors.
   - `npm test` -> 100% tests passing across all test suites.

## Verification & Test Plan
- **Test Files**:
  - `tests/e2e/user-journey.test.ts` (verifies full capture, color change, masonry rendering, offline persistence, and search).
- **Verification Commands**:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`

