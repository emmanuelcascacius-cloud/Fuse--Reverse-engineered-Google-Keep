# Issue 05: Dynamic Typography Scaling Engine & Rectangular `<NoteCard />` Component

## Spec & Design References
- **`specs.md`**: Section 1.1 (Principle 2: No-Title Body-Only, Principle 3: Calm Surface, Principle 4: Spatial Memory & 240px Masonry), Section 2.1 (Typography Scaling, Checklists, Image previews, Labels).
- **`design.md`**: Section 3.2 (Dynamic Body Text Scaling Rules), Section 3.3 (Checklist & Chip Typography), Section 4.1 (The Rectangular Note Card: 240px width, min-height 60px, max-height 380px, border-radius 8px, body padding 12px 16px 12px 16px, hover toolbar height 36px), Section 5 (Micro-interactions: hover box shadow, action bar opacity 0 -> 1 over 140ms, checkmark scale).
- **`AGENTS.md`**: Section 1 (Body-Only Notes: never add title field in .tsx), Section 4.2 (Verify 22px <=35 chars, 18px 36-90 chars, 14px >90 chars with line-clamp).

## Implementation Scope
1. **Typography Scaling Engine**:
   - `lib/typography.ts`: Function `getTypographyProfile(bodyText: string)`:
     - `L <= 35` and `N <= 2`: Micro Note -> `text-[22px] leading-[28px] tracking-[-0.01em]`
     - `36 <= L <= 90` and `N <= 4`: Short Note -> `text-[18px] leading-[24px] tracking-[0em]`
     - `91 <= L <= 280`: Standard Note -> `text-[14px] leading-[20px] tracking-[+0.01em]`
     - `L > 280` or `N > 12`: Long Note -> `text-[14px] leading-[20px] line-clamp-[14]`
2. **Interactive Checklist Component**:
   - `components/notes/Checklist.tsx`: Rendering active items with custom checkboxes and completed items in a collapsible "X Checked items" footer.
3. **Rectangular NoteCard Component**:
   - `components/notes/NoteCard.tsx`:
     - Width `240px` (or list view width `600px`).
     - Border radius `8px`.
     - Strictly NO title input/display.
     - Internal padding `12px 16px 12px 16px`.
     - Label and domain chips row (`padding: 4px 16px 8px 16px`, `gap: 6px`).
     - Hover action bar (`height: 36px`, `padding: 0 8px 4px 8px`, `opacity: 0` transitioning to `1` on hover/focus).
     - Selection checkmark badge in top-left (`-8px, -8px`, `20px × 20px`, scaling on hover).
     - Color application using the dual-theme token system.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/typography.test.ts` (verifies font size, line height, and line clamping classes for exact character boundaries).
  - `tests/unit/notecard.test.tsx` (RTL tests asserting: 1. No title input/label in DOM; 2. Exact typography classes applied; 3. Checkmark badge toggle; 4. Checklist completion rendering; 5. Action toolbar opacity transitions).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/typography.test.ts tests/unit/notecard.test.tsx` -> All pass.

