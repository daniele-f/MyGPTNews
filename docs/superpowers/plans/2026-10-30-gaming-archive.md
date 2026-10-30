# Gaming Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild MyGPTNews as a validated static gaming-news archive with separate timestamped editions, permanent article links, and persistent reader preferences.

**Architecture:** Timestamped edition JSON files are the only published source. A TypeScript preparation pipeline validates all content and atomically generates static indexes for Vite’s home, archive, and search pages. Browser-only localStorage stores favorites and read state.

**Tech Stack:** Vite 7, TypeScript, `tsx` Node test runner, GitHub Pages Actions.

**Spec:** `docs/superpowers/specs/2026-10-30-gaming-archive-design.md`

## Global Constraints

- Keep Vite, TypeScript, static GitHub Pages, and `/MyGPTNews/` base-path support.
- Add no backend, accounts, database, dependencies, runtime APIs, or secrets.
- Remove all fictional editions and all hourly-quote functionality.
- GPT creates or corrects exactly one timestamped edition JSON file per run.
- Preserve article IDs on corrections, accept only the five specified categories, and validate related IDs.
- Generate indexes atomically only after all editions pass validation.
- Use UTC for identity/filenames and Europe/Brussels for calendar grouping.

## Review Focus

- Deep links under the GitHub Pages subpath focus the intended article — Task 3 tests.
- DST-boundary timestamps group by Brussels date — Task 2 tests.
- Empty editions produce deployable empty indexes and a browser empty state — Tasks 2 and 5.
- Invalid relationships cannot replace prior indexes — Task 2.
- Missing optional image, Steam, game, and price fields produce no misleading UI — Task 4.

---

## File Structure

- `scripts/lib/editions.ts`: types, timestamp filename parsing, validation.
- `scripts/lib/indexes.ts`: discovery, cross-edition checks, deterministic atomic indexes.
- `scripts/lib/routes.ts`: pure permanent-link helpers.
- `src/js/state.ts`: localStorage state.
- `src/js/data.ts`, `src/js/render.ts`, `src/js/edition-view.ts`: shared frontend data and rendering.
- `src/js/today.ts`, `src/js/archive.ts`, `src/js/search-page.ts`: pages.
- `AGENTS.md`, `PREFERENCES.md`, `PUBLISHING.md`, `README.md`: publishing workflow.

### Task 1: Remove quote prototype and fictional content

**Files:** Delete `hourly-quotes/`, quote source/scripts/tests/data, fictional edition JSON files, and `data/processed-urls.json`. Modify `package.json`, `vite.config.ts`, Pages workflow, styles, and `tests/project.test.ts`.

**Interfaces:** Produces an empty `data/editions/`, only home/archive/search Vite entries, and a Pages workflow triggered solely on `main` pushes or manual dispatch.

- [ ] **Step 1: Write the failing regression**

In `tests/project.test.ts`, assert there is no quote Vite input/script/scheduled workflow/content-commit step.

- [ ] **Step 2: Run the regression**

Run `npm test -- --test-name-pattern="hourly quote"`; expect FAIL because quote artifacts exist.

- [ ] **Step 3: Remove all obsolete artifacts**

Keep Pages deploy actions and generic validation/build scripts only.

- [ ] **Step 4: Run the regression**

Run `npm test -- --test-name-pattern="hourly quote"`; expect PASS.

- [ ] **Step 5: Commit**

Commit message: `chore: remove hourly quote prototype`.

### Task 2: Timestamped edition validation and indexing

**Files:** Create `tests/fixtures/create-edition.ts`. Modify `scripts/lib/editions.ts`, `scripts/lib/indexes.ts`, `scripts/prepare-edition.ts`, `data/schema/edition.schema.json`, `tests/editions.test.ts`, and `tests/build-data.test.ts`.

**Interfaces:** Produces `parseEditionFilename(name: string): string | null`, `validateEdition(edition: unknown, expectedId: string): ValidationResult`, and `prepareEditions(rootDir: string): Promise<Indexes>`.

- [ ] **Step 1: Write failing multi-run and date-grouping tests**

Use `2026-10-30T08-00-00Z.json` and `2026-10-30T18-00-00Z.json`; assert unique edition IDs, shared `date: "2026-10-30"`, newest-first ordering, and a DST grouping case.

- [ ] **Step 2: Write failing invalid-content/atomicity tests**

Reject malformed filename/ID, duplicate edition/article ID, invalid category, duplicate normalized source URL, bad optional Steam/price values, and unknown related ID; assert existing archive bytes remain unchanged.

- [ ] **Step 3: Write the failing empty-archive test**

Assert empty editions generate empty archive/search/game indexes and `generatedAt: null`.

- [ ] **Step 4: Run tests red**

Run `npm test -- tests/editions.test.ts tests/build-data.test.ts`; expect FAIL because discovery is date-only and prototype fields are required.

- [ ] **Step 5: Implement the typed edition/article validator**

Require article `id`, `headline`, `summary`, `categories`, `sourceUrl`, `publishedAt`, and `featured`; validate optional fields only when present. Derive Brussels date from the timestamp and require the edition date to match.

- [ ] **Step 6: Implement discovery and atomic indexes**

Index records contain `id`, `date`, `publishedAt`, `updatedAt`, `path`, and `storyCount`; search records retain edition ID. Do not generate processed URLs.

- [ ] **Step 7: Update JSON Schema and run green tests**

Mirror timestamp/category/optional-field rules, then run `npm test -- tests/editions.test.ts tests/build-data.test.ts`; expect PASS.

- [ ] **Step 8: Commit**

Commit message: `feat: validate timestamped gaming editions`.

### Task 3: Permanent routes and reader state

**Files:** Create `scripts/lib/routes.ts`, `src/js/routes.ts`, `src/js/state.ts`, `tests/routes.test.ts`, `tests/state.test.ts`. Modify `src/js/paths.ts` and `tests/url.test.ts`.

**Interfaces:** Produces `buildArticleUrl(editionId: string, articleId: string): string`, `parseArticleRoute(search: string): ArticleRoute | null`, `getReaderState(storage): ReaderState`, `toggleFavoriteGame(gameId, storage): ReaderState`, `markRead(articleId, storage): ReaderState`.

- [ ] **Step 1: Write failing routing tests**

Assert edition/article query-value round trips, incomplete values reject, and relative URLs work below the Vite base path.

- [ ] **Step 2: Write failing state tests**

Using in-memory Storage, assert favorite/read persistence, idempotent toggle behavior, and malformed JSON recovery.

- [ ] **Step 3: Run tests red**

Run `npm test -- tests/routes.test.ts tests/state.test.ts`; expect FAIL because modules do not exist.

- [ ] **Step 4: Implement route/state helpers**

Use guarded versioned keys `mygptnews.favorites.v1` and `mygptnews.read.v1`; keep static paths centralized in `assetPath`.

- [ ] **Step 5: Run green tests and commit**

Run `npm test -- tests/routes.test.ts tests/state.test.ts tests/url.test.ts`; expect PASS. Commit `feat: add article routes and reader preferences`.

### Task 4: Shared data access and article cards

**Files:** Create `tests/render.test.ts`. Modify `src/js/data.ts`, `src/js/render.ts`, and `public/fallback-news.svg`.

**Interfaces:** Produces `loadArchive()`, `loadEdition(id: string)`, `articleCard(article, context): string`, and `featuredArticle(article, context): string`.

- [ ] **Step 1: Write minimal-card failing test**

Assert source, categories, permanent link, lazy/fallback image markup, and absence of Steam, price, release, related, and game UI when those fields are missing.

- [ ] **Step 2: Write optional-card failing test**

Assert verified Steam link, release date, historical price/discount with check timestamp, and related link all render when supplied.

- [ ] **Step 3: Run test red**

Run `npm test -- tests/render.test.ts`; expect FAIL because renderer assumes prototype fields.

- [ ] **Step 4: Implement typed loaders and semantic card rendering**

Escape text, use lazy image fallback, safe external links, Task 3 related routes, and omit missing metadata.

- [ ] **Step 5: Run green test and commit**

Run `npm test -- tests/render.test.ts`; expect PASS. Commit `feat: render gaming stories with optional metadata`.

### Task 5: Responsive edition browsing

**Files:** Create `src/js/edition-view.ts`, `tests/edition-view.test.ts`. Modify home/archive scripts, their HTML entry points, styles, and `tests/project.test.ts`.

**Interfaces:** Produces `renderEditionView(options: EditionViewOptions): string` and `findAdjacentEdition(archive, currentId, direction): EditionMeta | null`.

- [ ] **Step 1: Write failing view/filter tests**

Assert featured appears once above standards; multi-category filtering matches either category; favorite/unread filters combine; a missing edition is clear.

- [ ] **Step 2: Write failing navigation tests**

Assert chronological next/previous skips missing dates and same-day editions have distinct accessible selectors.

- [ ] **Step 3: Run tests red**

Run `npm test -- tests/edition-view.test.ts`; expect FAIL because the shared view is absent.

- [ ] **Step 4: Implement view and browser selection**

Home selects newest. Archive groups by Brussels day. Direct article URL selects, focuses, and marks read without changing URL.

- [ ] **Step 5: Replace layout/CSS**

Use semantic markup, labelled controls, visible keyboard focus, restrained responsive cards, and explicit no-content/missing-edition states.

- [ ] **Step 6: Run green tests and commit**

Run `npm test -- tests/edition-view.test.ts tests/project.test.ts`; expect PASS. Commit `feat: add responsive gaming edition archive`.

### Task 6: Archive-wide search

**Files:** Modify `src/js/search.ts`, `src/js/search-page.ts`, `search/index.html`, and `tests/search.test.ts`.

**Interfaces:** Produces `searchStories(stories: SearchStory[], query: string, options: SearchOptions): SearchStory[]` and permanent result links.

- [ ] **Step 1: Write failing search tests**

Assert case-insensitive matches in headline, summary, and game name; favorite/unread filters; stable newest-first result ordering.

- [ ] **Step 2: Run test red**

Run `npm test -- tests/search.test.ts`; expect FAIL because old records do not support the target model.

- [ ] **Step 3: Implement pure search and accessible controls**

Read only `search-index.json`, show result count and filters, and link all results via Task 3 routes.

- [ ] **Step 4: Run green test and commit**

Run `npm test -- tests/search.test.ts`; expect PASS. Commit `feat: search the gaming news archive`.

### Task 7: Publishing documentation and deploy safeguards

**Files:** Create `AGENTS.md` and `PUBLISHING.md`. Modify `PREFERENCES.md`, `README.md`, Pages workflow, and `tests/project.test.ts`.

**Interfaces:** Produces a publisher procedure allowing the GPT schedule to change only one timestamped JSON file per run.

- [ ] **Step 1: Write failing documentation tests**

Assert the two files exist and publishing docs contain timestamp filename, schema, multiple same-day editions, Brussels dates, correction/ID rule, and `npm run verify`.

- [ ] **Step 2: Run test red**

Run `npm test -- tests/project.test.ts`; expect FAIL because complete GPT publishing constraints do not exist.

- [ ] **Step 3: Write publisher and maintainer docs**

Include a valid full JSON example, optional-field behavior, no-fabrication rule, one-file scope, corrections, validation recovery, setup/no-content preview, testing, and Pages setup.

- [ ] **Step 4: Finalize workflow**

Run `npm run verify` before deployment; retain no scheduled trigger, write permissions, or content writes.

- [ ] **Step 5: Run green test and commit**

Run `npm test -- tests/project.test.ts`; expect PASS. Commit `docs: document gaming news publishing workflow`.

### Task 8: Full verification

**Files:** Modify only if verification reveals an issue in Tasks 1–7.

- [ ] **Step 1: Run complete verification**

Run `npm run verify`; expect tests, typecheck, empty-index preparation, and production Vite build to pass.

- [ ] **Step 2: Inspect artifact**

Run `rg -n "hourly quote|fictional|processed-urls" dist data package.json .github`; expect no obsolete artifacts or copy.

- [ ] **Step 3: Commit fixes and inspect status**

Commit `chore: verify gaming archive build` if needed, then run `git status --short`; expect clean status.

## Self-Review

- **Spec coverage:** Tasks 1–2 handle removal, timestamped storage, validation, references, and indexes. Tasks 3–6 cover direct routes, persistence, cards, filters, navigation, responsive states, Steam metadata, and search. Task 7 documents external publishing and CI; Task 8 verifies the release artifact.
- **Step scan:** Every implementation task starts with a concrete failing test, specifies its interface, and ends with targeted verification and a commit.
- **Type consistency:** Task 2 owns `edition.id`/`article.id`; Task 3 serializes those values; Tasks 4–6 consume them. `edition.date` is only the Brussels grouping date.
- **Review focus:** All five likely user-facing failure modes are assigned to Tasks 2–5 tests.
- **Proportion:** This plan defines contracts, tests, and ownership without transcribing the implementation.
