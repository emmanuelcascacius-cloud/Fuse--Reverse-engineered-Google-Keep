# Issue 01: Monorepo & Next.js 15+ Workspace Setup with Strict TypeScript & Vitest

## Spec & Design References
- **`specs.md`**: Section 1.1 (Reverse-Engineered Google Keep Principles), Section 3.1 (Tech Stack & Structure: React 18+/19, TypeScript, Next.js App Router).
- **`design.md`**: Section 1 (Calm Spatial Clarity, font stacks).
- **`AGENTS.md`**: Section 2 (Technology Stack & "Latest Packages" Mandate: Next.js App Router, React 19, strict mode `"strict": true`, zero `any`), Section 4 (Static Analysis & Type Safety).

## Implementation Scope
1. **Workspace Root Configuration**:
   - `package.json` with latest stable Next.js, React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, Testing Library, and Biome/ESLint.
   - `tsconfig.json` configured with `"strict": true`, `"noImplicitAny": true`, `"exactOptionalPropertyTypes": true`, `"strictNullChecks": true`, and paths `@/*`.
2. **Next.js App Router Core**:
   - `app/layout.tsx` with Google Sans / Inter / Roboto typography stack, metadata, and root theme support.
   - `app/page.tsx` base canvas shell.
3. **Testing & Tooling Harness**:
   - `vitest.config.ts` configured with `happy-dom`, React Testing Library setup file (`tests/setup.ts`).
   - Linting script: `npm run lint` with 0 warnings, 0 errors.
   - Typecheck script: `npm run typecheck` (`tsc --noEmit`) with 0 errors.

## Verification & Test Plan
- **Test Files**:
  - `tests/unit/workspace.test.ts` (verifies test environment, React 19 render, and TypeScript strict checks).
- **Verification Commands**:
  - `npm run lint` -> Must pass with 0 errors and 0 warnings.
  - `npm run typecheck` -> Must pass with 0 errors.
  - `npm test` -> Must pass with all tests green.

