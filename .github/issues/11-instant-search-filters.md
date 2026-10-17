# Issue 11: Instant Client-Side Search Highlighting & Multi-Facet Filter Bar

## Spec & Design References
- **`specs.md`**: Section 2.1 (Search & Multi-Facet Filtering: Instant client-side search across body text, checklist items, labels, source URLs; instant filter grids by Color with Priority colors first, Label, Note Type, and Website Domain).
- **`design.md`**: Section 2.2 (`--bg-search`, `--bg-search-focus`), Section 3.1.

## Implementation Scope
1. **Client-Side Search & Filter Engine**:
   - `lib/search/search-engine.ts`:
     - Tokenizes search queries, matches against `body`, checklist items, `source_domain`, and labels.
     - Computes match score and highlights matching substrings with `<mark>` styling.
     - Multi-facet filters:
       - By Color: `coral` (Serious), `storm` (Active), `clay` (Neutral), and remaining colors.
       - By Type: Text notes, Checklists, Notes with URLs.
       - By Domain: e.g. `github.com`, `linear.app`.
       - By Label.
2. **Search Bar & Facet Grid**:
   - `components/search/SearchBar.tsx`: Search input with `/` shortcut binding, instant clear button, and dropdown facet filters trigger.
   - `components/search/FacetFilterGrid.tsx`: Visual chips and color swatches for one-click facet filtering.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/search-engine.test.ts` (verifies: 1. Full-text search over body and checklist items; 2. Domain matching; 3. Text highlight offsets; 4. Facet filter conjunctions).
  - `tests/unit/search-bar.test.tsx` (RTL tests for input focus, clear action, and facet filter selection).
- **Verification Commands**:
  - `npm run typecheck` -> 0 errors.
  - `npx vitest run tests/unit/search-engine.test.ts tests/unit/search-bar.test.tsx` -> All pass.

