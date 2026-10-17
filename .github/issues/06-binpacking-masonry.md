# Issue 06: Greedy Bin-Packing `<MasonryGrid />` & Pinned/Others Section Layout

## Spec & Design References
- **`specs.md`**: Section 1.1 (Principle 4: Spatial Memory & Simultaneous Visual Scanning), Section 2.1 (High-Density Rectangular Masonry View, Bin-Packing Layout Algorithm, Pinned/Others sections, Multi-Column vs List View).
- **`design.md`**: Section 4.1 (240px Masonry card width vs 600px list view), Section 4.2 (Masonry Bin-Packing Grid: 16px horizontal/vertical gaps, column count formula, greedy shortest-column placement, 220ms transform transitions, Section dividers).

## Implementation Scope
1. **Column Calculation & Bin-Packing Hook**:
   - `hooks/useMasonryLayout.ts`:
     - Dynamically computes column count based on available viewport width:
       `Columns = max(1, floor((W_viewport - W_sidebar - 48) / (240 + 16)))`
     - Implements greedy shortest-column bin packing placing each card into whichever column has the lowest cumulative height $H_c$.
2. **Masonry Grid Component**:
   - `components/grid/MasonryGrid.tsx`:
     - Multi-column 240px card grid with 16px gaps.
     - Section dividers for "PINNED" vs "OTHERS" (`11px`, `font-weight: 500`, uppercase, `letter-spacing: 0.08em`, `margin: 24px 0 8px 16px`).
     - Smooth transitions using `translate3d(x, y, 0)` with `transition: transform 220ms cubic-bezier(0.2, 0, 0, 1)`.
     - Toggle between Masonry Grid and Single-Column List View (`600px` centered cards).

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/masonry-algorithm.test.ts` (verifies column packing assigns cards to shortest columns, handles 1 to N columns, maintains correct order).
  - `tests/unit/masonry-grid.test.tsx` (RTL tests asserting separation of Pinned and Others cards, switching to List view, responsive column updates).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/masonry-algorithm.test.ts tests/unit/masonry-grid.test.tsx` -> All pass.

