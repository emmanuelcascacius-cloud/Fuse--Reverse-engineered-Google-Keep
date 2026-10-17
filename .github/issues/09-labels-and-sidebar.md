# Issue 09: Labels System, Dynamic `<SidebarNav />` Drawer & Inline `#label` Autocomplete

## Spec & Design References
- **`specs.md`**: Section 2.1 (Labels / Tagging, Inline `#label` autocomplete, Filter main feed by label), Section 3.1 (`<SidebarNav />`).
- **`design.md`**: Section 2.2 (`--bg-sidebar-active: #FEEFC3` light / `#41331C` dark, calm typography), Section 3.3 (Label pill typography: 11px, font-weight 500).

## Implementation Scope
1. **Sidebar Navigation**:
   - `components/sidebar/SidebarNav.tsx`:
     - Navigation items: Notes, Labels (collapsible / listed), Archive, Trash.
     - Active item pill with background `var(--bg-sidebar-active)` and smooth transitions.
     - "Edit labels" trigger to open management modal.
2. **Label Management Modal**:
   - `components/labels/EditLabelsModal.tsx`:
     - Create new labels, rename existing labels, delete labels with cascade removal from active notes.
3. **Inline `#label` Autocomplete**:
   - `components/editor/LabelAutocomplete.tsx`:
     - Detects `#` typed inside note body in QuickCaptureBar and NoteModal, presents fuzzy match dropdown, selects/creates label, attaches to note, and strips tag token from body or preserves based on preference.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/labels.test.tsx` (verifies: 1. Creating and renaming labels; 2. Sidebar active pill styling; 3. Filtering notes by label in store; 4. Inline `#label` detection).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/labels.test.tsx` -> All pass.

