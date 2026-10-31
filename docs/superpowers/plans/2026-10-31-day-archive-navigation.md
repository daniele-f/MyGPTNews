# Day Archive Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate archive page with a homepage day navigator that supports an available-day calendar popover.

**Architecture:** The homepage entry reads an optional `date` query parameter and loads every edition belonging to that day, as it already does for permanent article links. A small pure rendering helper produces the date timeline and calendar controls from the archive index's unique dates; the entry module binds popover behavior and navigation. The old archive entry point is removed from the Vite build.

**Tech Stack:** TypeScript, Vite multi-page static site, Node test runner via `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-31-day-archive-navigation-design.md`

## Global Constraints

- Do not modify edition JSON or the user-modified generated data indexes.
- Keep `/search/` and query-parameter article links working below `/MyGPTNews/`.
- Use no new runtime dependency.
- The calendar only selects dates present in `archive.json`.

## Review Focus

- An unavailable or malformed `date` query shows the existing unavailable-edition error instead of silently selecting another day.
- The oldest and newest available days render disabled previous/next controls with no broken link.
- Selecting a day with multiple legacy editions combines stories and retains their permanent edition IDs.
- A direct `edition`/`article` link still wins over a competing `date` query and focuses the exact story.
- Calendar controls remain operable by keyboard and expose expanded state to assistive technology.

---

### Task 1: Date navigation markup and homepage presentation

**Files:**
- Modify: `src/js/home-view.ts`
- Modify: `tests/home-view.test.ts`

**Interfaces:**
- Consumes: `availableDates: string[]`, `selectedDate: string`
- Produces: `dayNavigationView(availableDates: string[], selectedDate: string): string`

- [ ] **Step 1: Write failing tests for a selected-day timeline and calendar trigger**

  Assert `homeView` includes a `Stories for this day` rail heading, no rail publication timestamp, one current-day calendar trigger, and only valid previous/next date links.

- [ ] **Step 2: Run the focused test to verify it fails**

  Run: `npm exec -- tsx --test tests/home-view.test.ts`
  Expected: FAIL because the old archive link, rail heading, and timestamp markup remain.

- [ ] **Step 3: Implement `dayNavigationView` and extend `homeView`**

  Add accessible prev/next controls, a popover trigger, calendar dialog markup whose date buttons are enabled only for `availableDates`, and a selected-day heading. Change rail markup to title plus categories only.

- [ ] **Step 4: Run the focused test to verify it passes**

  Run: `npm exec -- tsx --test tests/home-view.test.ts`
  Expected: PASS.

### Task 2: Date route resolution and calendar interaction

**Files:**
- Modify: `src/js/today.ts`
- Create: `src/js/day-route.ts`
- Modify: `src/styles.css`
- Modify: `tests/home-view.test.ts`
- Create: `tests/day-route.test.ts`

**Interfaces:**
- Consumes: homepage `?date=YYYY-MM-DD`, archive edition metadata
- Produces: selected-day homepage content and calendar popover interaction

- [ ] **Step 1: Write failing tests for date-aware homepage selection helpers**

  Assert `resolveDayRoute(search, editions)` chooses the requested available day, returns `null` for unavailable dates, and chooses the article edition's date when `edition`/`article` are present.

- [ ] **Step 2: Run the focused test to verify it fails**

  Run: `npm exec -- tsx --test tests/day-route.test.ts`
  Expected: FAIL because the homepage currently always selects the newest edition unless an article route is present.

- [ ] **Step 3: Implement selected-date loading and interaction binding**

  Implement `resolveDayRoute(search: string, editions: { id: string; date: string }[]): string | null` in `src/js/day-route.ts`. Use it in `today.ts` to resolve a valid date from the archive index, load that day’s editions, and pass available dates to `homeView`; direct article links remain authoritative. Bind popover open/close, escape/outside-close, month navigation, and enabled date links. Add responsive styles matching the editorial header.

- [ ] **Step 4: Run the focused test to verify it passes**

  Run: `npm exec -- tsx --test tests/day-route.test.ts tests/home-view.test.ts`
  Expected: PASS.

### Task 3: Remove the retired archive route

**Files:**
- Delete: `archive/index.html`
- Delete: `src/js/archive.ts`
- Modify: `vite.config.ts`
- Modify: tests that reference the archive-only entry, if any

**Interfaces:**
- Consumes: Vite's multi-page `input` configuration
- Produces: a build containing only home, article, and search pages

- [ ] **Step 1: Write a failing build-config test**

  Assert Vite has no archive input and the retired archive entry file is absent.

- [ ] **Step 2: Run the focused test to verify it fails**

  Run: `npm exec -- tsx --test tests/project.test.ts`
  Expected: FAIL because the archive input and files still exist.

- [ ] **Step 3: Remove the retired route and its Vite input**

  Delete the obsolete source and HTML entry, remove the archive build input, and adjust any page-copy expectations that reference it.

- [ ] **Step 4: Run focused tests and build verification**

  Run: `npm exec -- tsx --test tests/project.test.ts && npm run build`
  Expected: PASS; `dist` has no archive entry.

### Task 4: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run all automated checks**

  Run: `npm test && npm run typecheck && npm run build`
  Expected: PASS with no type errors and no archive build entry.

- [ ] **Step 2: Inspect the final diff**

  Run: `git diff --check && git diff -- src/js/home-view.ts src/js/today.ts src/styles.css vite.config.ts tests`
  Expected: no whitespace errors; changes match the approved design without touching data indexes.
