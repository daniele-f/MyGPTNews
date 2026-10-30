# Daily Edition Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate reader-facing same-day briefings and label newly added or revised stories.

**Architecture:** Keep a single daily edition file for future publishing, while the application aggregates legacy same-day files into one daily feed. Add optional story change metadata that validation indexes carry through to the home rail, stage, and detail page.

**Tech Stack:** TypeScript, Vite, Node test runner, JSON edition data.

**Spec:** `docs/superpowers/specs/2026-10-30-daily-edition-updates-design.md`

## Global Constraints

- Later schedule runs modify the first edition file for the same Brussels calendar day.
- New stories use `changeType: "new"`; meaningful revisions use `changeType: "updated"` and preserve their IDs.
- Existing first-run stories have no change tag.
- Preserve permanent article URLs and do not modify existing editorial content.

## Review Focus

- Invalid change types and missing change timestamps fail validation.
- Legacy same-day editions are combined without losing each story’s edition ID.
- Direct article URLs continue to resolve after day aggregation.
- `New` and `Updated` labels are visible without relying on colour alone.
- The publisher instructions do not allow a later run to create another same-day file.

---

### Task 1: Validate and index change metadata

**Files:**
- Modify: `scripts/lib/editions.ts`
- Modify: `tests/editions.test.ts`

**Interfaces:**
- Consumes: optional `story.changeType` and `story.updatedAt`.
- Produces: validated story metadata preserved by the generated indexes.

- [ ] Write failing tests for valid `new`/`updated` metadata and invalid values or missing timestamps.
- [ ] Run `npm test -- tests/editions.test.ts` and confirm the missing validation fails.
- [ ] Validate `changeType` values and their required timestamps.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Aggregate daily stories and render labels

**Files:**
- Create: `src/js/daily-feed.ts`
- Modify: `src/js/today.ts`, `src/js/home-view.ts`, `src/js/article-view.ts`, `src/styles.css`
- Modify: `tests/home-view.test.ts`, `tests/article-view.test.ts`

**Interfaces:**
- Produces: `dailyStories(metas, editions, date)` records annotated with their original `editionId`.
- Consumes: `story.changeType` to render accessible visible labels.

- [ ] Write failing tests for same-day aggregation and `New`/`Updated` labels in rail, stage, and detail markup.
- [ ] Run focused tests and confirm they fail before the helper exists.
- [ ] Implement aggregation, preserve original IDs for links, and render labels.
- [ ] Re-run focused tests and confirm they pass.

### Task 3: Update publishing documentation and prompt contract

**Files:**
- Modify: `AGENTS.md`, `PUBLISHING.md`, `docs/daily-maintenance.md`

- [ ] Document the one-file-per-day update rule, metadata schema, and correction rules.
- [ ] Ensure examples show a later-added story and a revised story without changing actual edition data.

### Task 4: Verify and publish

**Files:**
- Modify: only the source, tests, and documentation from Tasks 1–3.

- [ ] Run `npm run verify` and confirm all tests, typecheck, edition validation, and production build succeed.
- [ ] Commit the feature and push it to `main` so GitHub Pages deploys it.
