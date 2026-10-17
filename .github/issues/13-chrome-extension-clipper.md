# Issue 13: Chrome Extension Manifest V3 Web Clipper & Active URL Listener

## Spec & Design References
- **`specs.md`**: Section 2.2 (Chrome Extension: Web Clipper & Proactive Overlay: One-click popup, right-click "Save selection to Fuse", source domain/URL normalization, offline queue), Section 2.3 (Active URL Listener & Shadow DOM Injection).
- **`AGENTS.md`**: Section 1 (Proactive Chrome Extension), Section 2 (Chrome Extension: Manifest V3 bundled using shared `.tsx` components), Section 4.4.

## Implementation Scope
1. **Manifest V3 Configuration**:
   - `extension/manifest.json`:
     - Permissions: `activeTab`, `storage`, `contextMenus`, `tabs`, `scripting`.
     - Background service worker, popup action, content script.
2. **Domain & URL Normalizer Utility**:
   - `extension/lib/url-utils.ts`:
     - Normalizes URLs: strips tracking parameters, extracts root hostname (e.g. `https://github.com/foo/bar?ref=123` -> `github.com`).
     - Supports exact URL matching scope vs root domain matching scope.
3. **Background Service Worker**:
   - `extension/background.ts`:
     - Context menu creation: "Save selection to Fuse".
     - Active tab listener (`chrome.tabs.onUpdated`): inspects active URL, queries local cache for matching domain notes, messages content script to display overlay.
4. **Extension Popup UI**:
   - `extension/popup.tsx`:
     - Compact Quick Capture bar displaying current site favicon and domain pill.
     - Priority Color Picker (Red, Blue, Black first).
     - Offline queueing via `chrome.storage.local`.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/extension-url-utils.test.ts` (verifies: 1. Hostname extraction across diverse URLs; 2. URL sanitization; 3. Domain match scope logic).
  - `tests/unit/extension-clipper.test.ts` (verifies: 1. Selection capture generates note with body and source URL; 2. Priority color selection; 3. Offline storage writes).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/extension-url-utils.test.ts tests/unit/extension-clipper.test.ts` -> All pass.

