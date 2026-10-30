# Editorial Home Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved editorial homepage layout and story-stage interaction to GitHub Pages.

**Architecture:** Extract deterministic home markup into a render helper so the active-story state can be tested outside the browser bootstrap. The existing entry point loads edition data and binds rail buttons to the helper-rendered centre stage; CSS provides the responsive dark editorial layout and reduced-motion-safe transition.

**Tech Stack:** TypeScript, Vite, Node test runner, CSS.

**Spec:** `docs/superpowers/specs/2026-10-30-editorial-home-layout.md`

## Global Constraints

- Preserve existing static JSON loading, permanent `edition`/`article` URLs, category/unread filters, and empty state.
- Do not modify edition content or generated index files.
- Keep the design dark-only and honour `prefers-reduced-motion`.

## Review Focus

- A non-featured selected story updates the centre headline and direct URL.
- When filters omit a feature, the first remaining story becomes the active stage.
- No duplicate archive control appears in the latest-stories rail.
- Rail controls remain native buttons with an exposed selected state.
- Mobile layout reaches one column without hiding reading or source links.

---

### Task 1: Testable editorial home rendering

**Files:**
- Create: `src/js/home-view.ts`
- Modify: `tests/home-view.test.ts`

**Interfaces:**
- Produces: `homeView(stories: any[], editionId: string, publishedAt: string): string`
- Produces: `stageView(story: any, editionId: string): string`

- [ ] **Step 1: Write the failing tests** for a rail story’s `data-story-id`, left chevron, single top-level archive link, and permanent Read full story URL.
- [ ] **Step 2: Run** `npm test -- tests/home-view.test.ts` and confirm it fails because `home-view.ts` does not exist.
- [ ] **Step 3: Implement** `homeView` and `stageView` in `src/js/home-view.ts` using escaped story content and `assetPath`/existing URLs.
- [ ] **Step 4: Run** `npm test -- tests/home-view.test.ts` and confirm it passes.

### Task 2: Bind the homepage interaction

**Files:**
- Modify: `src/js/today.ts`
- Test: `tests/home-view.test.ts`

**Interfaces:**
- Consumes: `homeView`, `stageView` from `src/js/home-view.ts`.

- [ ] **Step 1: Write the failing test** asserting the active stage can start with the first filtered story when no featured story remains.
- [ ] **Step 2: Run** `npm test -- tests/home-view.test.ts` and confirm it fails against the existing renderer.
- [ ] **Step 3: Replace** inline home markup with `homeView`; bind rail buttons to replace the stage, update `aria-pressed`, and restart the transition class.
- [ ] **Step 4: Run** `npm test -- tests/home-view.test.ts` and confirm it passes.

### Task 3: Implement the responsive dark editorial styling

**Files:**
- Modify: `src/styles.css`
- Test: `tests/home-view.test.ts`

- [ ] **Step 1: Write the failing test** asserting the rendered page exposes the classes required for top header, story stage, and story rail.
- [ ] **Step 2: Run** `npm test -- tests/home-view.test.ts` and confirm it fails.
- [ ] **Step 3: Implement** the desktop two-column layout, compact top header, selected rail treatment, and reduced-motion-safe stage transition.
- [ ] **Step 4: Run** `npm test -- tests/home-view.test.ts` and confirm it passes.

### Task 4: Verify and publish

**Files:**
- Modify: source and tests from Tasks 1–3 only.

- [ ] **Step 1: Run** `npm run verify` and confirm tests, typecheck, index preparation, and production build succeed.
- [ ] **Step 2: Commit** the source, tests, and design records with `feat: add editorial gaming news homepage`.
- [ ] **Step 3: Push** the commit to `main`; confirm the Pages workflow succeeds.
