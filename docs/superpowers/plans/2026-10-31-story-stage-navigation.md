# Story Stage Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the story stage and story rail a coherent, animated in-day story navigator.

**Architecture:** Homepage rendering supplies explicit stage and rail subcomponents; `today.ts` owns a selected story index and uses one activation function for rail and stage controls. CSS applies directional state classes and reduced-motion fallbacks. A UI vocabulary document makes the agreed component names persistent.

**Tech Stack:** TypeScript, Vite, vanilla DOM, CSS, Node tests via `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-31-story-stage-navigation-design.md`

## Global Constraints

- Preserve permanent article links, date navigation, edition JSON, and generated indexes.
- Do not add dependencies.
- Use `Updated` and `updatedAt` only where an update timestamp exists.
- Motion respects `prefers-reduced-motion`.

## Review Focus

- First and last stories disable the unavailable stage direction without selecting an invalid item.
- A story without `changeType` shows no status pill; `new` and `updated` show their correct pill.
- Updating a story replaces the timestamp label and time, rather than showing both publication and update values.
- Rail click and stage button selection yield the same active state.
- Keyboard focus reveals and activates hidden rail chevrons without relying on hover.

---

### Task 1: Vocabulary and presentation markup

**Files:**
- Create: `docs/ui-vocabulary.md`
- Modify: `src/js/home-view.ts`
- Modify: `tests/home-view.test.ts`

**Interfaces:**
- Produces: rail metadata markup with `data-story-index`, `rail-story-copy`, and optional status pill; stage markup with `data-stage-previous` and `data-stage-next` buttons.

- [ ] **Step 1: Write failing rendering tests**

  Assert an updated stage story renders `Updated` with `updatedAt`; rail stories render title/top and category-plus-status/footer markup; `new` and `updated` pills are present only when relevant; and stage navigation buttons exist.

- [ ] **Step 2: Verify RED**

  Run: `npm exec -- tsx --test tests/home-view.test.ts`
  Expected: FAIL because no status pills or stage navigation controls exist and timestamps are always `Published`.

- [ ] **Step 3: Implement vocabulary and markup**

  Document A–L terminology. Add `storyNavigationView(index, total)` to `home-view.ts`, render stage buttons, timestamp selection, rail index/data wrappers, and status pills.

- [ ] **Step 4: Verify GREEN**

  Run: `npm exec -- tsx --test tests/home-view.test.ts`
  Expected: PASS.

### Task 2: Shared story navigation and motion

**Files:**
- Modify: `src/js/today.ts`
- Modify: `src/styles.css`
- Modify: `tests/home-view.test.ts`

**Interfaces:**
- Consumes: `data-story-index`, `data-stage-previous`, and `data-stage-next` from Task 1.
- Produces: one `activate(index: number, direction: 'previous' | 'next' | 'direct')` path for rail and stage controls.

- [ ] **Step 1: Write failing navigation-state tests**

  Assert first/last stage markup disables unavailable adjacent buttons and selected rail markup carries its left-shift state hook.

- [ ] **Step 2: Verify RED**

  Run: `npm exec -- tsx --test tests/home-view.test.ts`
  Expected: FAIL because boundary state and animation hooks are absent.

- [ ] **Step 3: Implement activation behavior and styles**

  In `today.ts`, maintain a selected index and bind rail and stage buttons to the shared activation function. Update pressed and disabled state after each selection. In CSS, top-align rail copy, pin its footer, reveal/translate chevrons on hover/focus, shift selected entries left, and add directional stage/rail transitions with reduced-motion overrides.

- [ ] **Step 4: Verify GREEN**

  Run: `npm exec -- tsx --test tests/home-view.test.ts && npm run typecheck`
  Expected: PASS.

### Task 3: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run full checks**

  Run: `npm test && npm run typecheck && npm run build && git diff --check`
  Expected: all tests pass, no type errors, successful build, and no whitespace errors.
