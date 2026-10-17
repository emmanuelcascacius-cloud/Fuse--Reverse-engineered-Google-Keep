# Issue 14: Chrome Extension Shadow DOM Proactive Overlay (`<ContextualNoteOverlay />`)

## Spec & Design References
- **`specs.md`**: Section 2.3 (Feature Slot 1 — Proactive Contextual Notes "Notes Find You", Active URL Listener & Shadow DOM Injection).
- **`design.md`**: Section 6.1 (Style Isolation with Shadow DOM: `<div id="fuse-contextual-root">`, `attachShadow({ mode: 'open' })`, `:host { all: initial }`), Section 6.2 (Proactive Floating Note Widget Geometry: anchor top 16px right 16px, collapsed pill state, proactive expanded card state, priority sorting: Red on top, 220ms entrance slide).
- **`AGENTS.md`**: Section 1 (Proactive Chrome Extension), Section 4.4.

## Implementation Scope
1. **Shadow DOM Injection Mount**:
   - `extension/content.ts`:
     - Creates isolated host container `<div id="fuse-contextual-root">`.
     - Attaches Shadow DOM in `open` mode.
     - Injects isolated CSS resets (`:host { all: initial; font-family: 'Inter', Roboto, sans-serif; z-index: 2147483646; }`).
     - Mounts React `<ContextualNoteOverlay />` inside shadow root.
2. **Contextual Note Overlay Component**:
   - `components/extension/ContextualNoteOverlay.tsx`:
     - Fixed anchor `top: 16px; right: 16px`.
     - Collapsed Pill State: compact `36px` pill with domain name, note count badge, priority color dot.
     - Proactive Expanded State: `280px` rectangular card with note's background color, domain chip, and header controls (Add `+`, Minimize `-`, Snooze `x`).
     - Priority Sorting: **Red (`coral`)** notes sorted to top, followed by **Blue (`storm`)**, then **Black (`clay`)**.
     - Inline editable body and checklist items with immediate `< 2ms` persistence to extension storage.
     - Smooth slide-in entrance (`translateX(16px)` to `translateX(0)` over `220ms cubic-bezier(0.16, 1, 0.3, 1)`).

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/contextual-overlay.test.tsx` (verifies: 1. Shadow DOM attachment and style encapsulation; 2. Priority sorting orders coral notes before storm and clay; 3. Inline editing updates note; 4. Collapsed vs expanded states).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/contextual-overlay.test.tsx` -> All pass.

