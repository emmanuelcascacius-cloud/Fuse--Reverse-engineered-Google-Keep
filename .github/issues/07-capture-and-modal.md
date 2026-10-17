# Issue 07: Zero-Friction `<QuickCaptureBar />` & Shared-Element `<NoteModal />` with Auto-Save

## Spec & Design References
- **`specs.md`**: Section 1.1 (Principle 1: Zero-Friction Implicit Save, Principle 2: No-Title Body-First), Section 2.1 (Seamless Text <-> Checklist Conversion, Note Lifecycle).
- **`design.md`**: Section 4.3 (Quick Capture Bar: 46px collapsed height, floating elevation shadow, auto-grow up to 60vh), Section 5 (Card-to-Modal Shared Element Expansion: 200ms cubic-bezier(0.2, 0, 0, 1), 600px width, 85vh max-height).
- **`AGENTS.md`**: Section 1 (Body-Only Notes: never add title field), Section 4.2 (Implicit auto-save on click-outside / Esc and < 5ms persistence).

## Implementation Scope
1. **Quick Capture Bar**:
   - `components/capture/QuickCaptureBar.tsx`:
     - Collapsed state: `46px` height, placeholder *"Take a note..."*, tactile shadow `0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)`.
     - Expand on focus: auto-grows up to `60vh`, revealing Priority Color Picker button, Checklist toggle button, and Pin icon.
     - Click outside or `Esc` immediately triggers implicit auto-save: if note body or checklist has non-empty text, commits to IndexedDB; if empty, cleanly discards.
     - Toggle between body text and newline-separated checklist items without losing content.
2. **Note Modal (Expanded Editor)**:
   - `components/modal/NoteModal.tsx`:
     - Opens on card click with smooth transition (`200ms cubic-bezier(0.2, 0, 0, 1)`).
     - Width `600px`, max-height `85vh`, border-radius `8px`.
     - Scrim backdrop `rgba(32, 33, 36, 0.60)` with `backdrop-filter: blur(1px)`.
     - Full editing of note body, checklist items, labels, color, and pin state.
     - Implicit auto-save when clicking backdrop or pressing `Esc`.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/quick-capture.test.tsx` (verifies: 1. Expand on click; 2. Implicit auto-save on click-outside; 3. Discard empty note; 4. Text-to-checklist conversion; 5. Strictly no title input).
  - `tests/unit/note-modal.test.tsx` (verifies: 1. Opens with note content; 2. Modifies text; 3. Auto-saves on close/Esc; 4. Color changes reflect immediately).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/quick-capture.test.tsx tests/unit/note-modal.test.tsx` -> All pass.

