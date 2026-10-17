# Issue 10: Multi-Select Batch Actions & Global Keyboard Navigation (`c`, `/`, `j`, `k`, `e`, `#`, `p`)

## Spec & Design References
- **`specs.md`**: Section 2.1 (Multi-Select Batch Operations: checkmark badge on card hover, batch color change, batch label, batch pin, batch archive, batch delete; Global Keyboard Shortcuts: `c`, `/`, `j`, `k`, `e`, `#`/`Delete`, `p`, `?`).
- **`design.md`**: Section 5 (Micro-Interactions: selection checkmark scale 0.8 to 1.0 over 120ms cubic-bezier(0.4, 0, 0.2, 1)).

## Implementation Scope
1. **Selection State Management**:
   - `lib/store/useSelectionStore.ts`: Tracks set of selected note IDs, provides `toggleSelect(id)`, `selectAll()`, `clearSelection()`.
2. **Batch Action Bar**:
   - `components/toolbar/BatchActionBar.tsx`:
     - Fixed/floating top bar appearing when `selectedIds.length > 0`.
     - Displays count: "X selected".
     - Action buttons: Batch Pin, Batch Color Picker, Batch Label, Batch Archive, Batch Delete, Close Selection (`Esc`).
3. **Global Keyboard Navigation Hook**:
   - `hooks/useGlobalShortcuts.ts`:
     - `c`: Focus Quick Capture bar.
     - `/`: Focus global search bar.
     - `j` / `k`: Move focus ring down/up or next/prev note card in grid.
     - `e`: Archive focused or selected note(s).
     - `#` or `Delete`: Move focused or selected note(s) to Trash.
     - `p`: Toggle Pin on focused or selected note(s).
     - `?`: Toggle keyboard shortcuts cheat-sheet modal.
     - `Escape`: Deselect all or close open modal.
4. **Shortcuts Modal**:
   - `components/modal/ShortcutsModal.tsx`: Displays clean list of keyboard shortcuts.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/selection-and-batch.test.tsx` (verifies: 1. Multi-selecting multiple notes; 2. Batch pin/unpin; 3. Batch color change; 4. Batch delete; 5. Selection bar visibility).
  - `tests/unit/keyboard-shortcuts.test.tsx` (verifies: 1. `c` focuses quick capture; 2. `j`/`k` moves focus ring; 3. `e` archives note; 4. `#` trashes note; 5. `p` pins note).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/selection-and-batch.test.tsx tests/unit/keyboard-shortcuts.test.tsx` -> All pass.

