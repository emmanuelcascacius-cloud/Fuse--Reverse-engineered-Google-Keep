# Issue 03: Design System CSS Custom Properties, Dual-Theme Tokens & Priority 12-Color Palette

## Spec & Design References
- **`design.md`**: Section 1 (Visual Philosophy: "Calm Spatial Clarity"), Section 2.1 (Complete Dual-Theme Color Token Table), Section 2.2 (Global Canvas, Text & Chrome Tokens), Section 2.3 (Priority Color Ordering: `coral`, `storm`, `clay` first).
- **`specs.md`**: Section 2.1 (Priority-First 12-Color System), Section 2.3 (Feature Slot 2).
- **`AGENTS.md`**: Section 1 (Priority State 12-Color System), Section 2 (Styling: Latest Tailwind CSS configured with exact custom properties), Section 4.2.

## Implementation Scope
1. **CSS Variables & Theming**:
   - `styles/globals.css` with exact Light & Dark CSS custom properties:
     - Canvas & surface tokens (`--bg-canvas`, `--bg-header`, `--bg-search`, `--bg-search-focus`, `--bg-sidebar-active`)
     - Text tokens (`--text-primary`, `--text-secondary`, `--text-muted`)
     - Border & icon tokens (`--border-hairline`, `--icon-default`, `--icon-hover-bg`)
     - State accent dots (`--state-red-dot`, `--state-blue-dot`, `--state-black-dot`)
2. **Dual-Theme 12-Color Palette Token Engine**:
   - `lib/constants/colors.ts`: Full configuration of the 12 colors ordered with Priority States first:
     1. `coral` (Red — Urgent / Serious / Blocker): Light `#F28B82` / Border `#EC695E`; Dark `#5C2B29` / Border `#7C3A37`
     2. `storm` (Blue — Active / Deep Work): Light `#AECBFA` / Border `#8AB4F8`; Dark `#2A425A` / Border `#3B5B7C`
     3. `clay` (Black/Slate — Neutral / Vault): Light `#E8EAED` / Border `#DADCE0`; Dark `#3C4043` / Border `#5F6368`
     4. `chalk` (Default Baseline): Light `#FFFFFF` / Border `#E0E0E0`; Dark `#202124` / Border `#5F6368`
     5. `peach`: Light `#FBBC04` / Border `#F29900`; Dark `#613916` / Border `#7D4A1D`
     6. `sand`: Light `#FFF475` / Border `#FBC02D`; Dark `#594212` / Border `#755718`
     7. `mint`: Light `#CCFF90` / Border `#A8E665`; Dark `#34481D` / Border `#466127`
     8. `sage`: Light `#A7FFEB` / Border `#73E8CE`; Dark `#164E43` / Border `#1E6B5C`
     9. `fog`: Light `#CBF0F8` / Border `#9ADCF0`; Dark `#204F5E` / Border `#2C6B80`
     10. `dusk`: Light `#D7AEFB` / Border `#C084FC`; Dark `#472A5B` / Border `#5E3878`
     11. `blossom`: Light `#FDCFE8` / Border `#F8A5D2`; Dark `#5B2E48` / Border `#7A3E61`
     12. `earth`: Light `#E6C9A8` / Border `#D4AF87`; Dark `#4B3621` / Border `#63472B`
3. **Tailwind Config Integration**:
   - Ensure Tailwind theme references semantic CSS variables and dynamic utility classes.
4. **Theme Provider & Hook**:
   - `components/theme/ThemeProvider.tsx` and `useTheme` hook supporting system, light, and dark modes.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/colors.test.ts` (verifies all 12 color IDs match specifications, slots 1-3 are strictly coral, storm, and clay; checks hex values in light and dark modes).
  - `tests/unit/theme-tokens.test.ts` (verifies CSS variable definitions and computed styles).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/colors.test.ts tests/unit/theme-tokens.test.ts` -> All pass.

