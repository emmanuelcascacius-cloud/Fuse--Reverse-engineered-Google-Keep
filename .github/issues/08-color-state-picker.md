# Issue 08: Priority State `<ColorStatePicker />` (Red, Blue, Black Primary Ordering)

## Spec & Design References
- **`specs.md`**: Section 2.1 (Priority-First 12-Color System), Section 2.3 (Feature Slot 2: Priority State Color System: Red, Blue, Black Primary Ordering).
- **`design.md`**: Section 2.1 (Complete Dual-Theme Color Token Table), Section 2.3 (Color Picker Popover Geometry: 2 rows of 6 circular swatches, 28px x 28px each, 6px gap, 8px 12px padding; Row 1: Coral, Storm, Clay, Chalk, Peach, Sand; Row 2: Mint, Sage, Fog, Dusk, Blossom, Earth), Section 5 (180ms ease-in-out transition).
- **`AGENTS.md`**: Section 1 (Priority State 12-Color System: Red/Blue/Black ordered first), Section 4.2.

## Implementation Scope
1. **Color Picker Popover Component**:
   - `components/palette/ColorStatePicker.tsx`:
     - 2 rows of 6 circular swatches (`28px × 28px`, `gap: 6px`, container padding `8px 12px`, `border-radius: 8px`).
     - Row 1: `coral`, `storm`, `clay`, `chalk`, `peach`, `sand`.
     - Row 2: `mint`, `sage`, `fog`, `dusk`, `blossom`, `earth`.
     - Inner ring indicator (`2px`) on Primary States (`coral`, `storm`, `clay`).
     - Selected state: centered `14px` checkmark with `2px solid #1A73E8` outer focus ring.
     - Tooltips indicating semantic state:
       - `coral`: "Red — Serious / Urgent / Blocker"
       - `storm`: "Blue — Active / Deep Work / Context"
       - `clay`: "Clay — Neutral / Vault / Log"
       - `chalk`: "Default Surface"
2. **Keyboard Shortcuts Support**:
   - `Alt+1` sets Red (`coral`), `Alt+2` sets Blue (`storm`), `Alt+3` sets Black/Slate (`clay`).

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/color-state-picker.test.tsx` (verifies: 1. Swatch order has Coral, Storm, Clay in indices 0, 1, 2; 2. Selecting a color triggers onSelect callback; 3. Checkmark renders on active color; 4. Semantic tooltips/aria-labels match spec).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/color-state-picker.test.tsx` -> All pass.

