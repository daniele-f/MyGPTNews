# My GPT News Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, responsive personal gaming-news briefing with permanent editions, archive browsing, client-side search, and mechanical publishing.

**Architecture:** Vite builds a vanilla HTML/CSS/ES-module site using `base: '/MyGPTNews/'`. Immutable edition JSON is the source of truth; Node scripts validate it and atomically generate archive, search, game, and URL indexes. The site has no backend.

**Tech Stack:** Node.js 20+, npm, Vite, Node built-in test runner, JSON Schema, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-09-27-mygptnews-design.md`

## Global Constraints

- English UI/content; dates and edition boundaries in Europe/Brussels.
- Vite must use `/MyGPTNews/`; internal URLs cannot be root-relative.
- No backend, database, auth, CMS, analytics, social features, or paid service.
- Daily content only changes `data/editions/`; generated indexes are mechanical.
- Semantic, keyboard accessible, responsive, contrast-safe, reduced-motion-aware UI.
- Remote lazy images use a local neutral fallback without layout shift.
- Invalid new content must never replace valid generated indexes.

## Review Focus

- Invalid editions must leave current generated data intact; tested in Task 3.
- Image error retains card dimensions and has a fallback; tested in Task 5.
- Absent/malformed archive date preserves navigation and displays an error; tested in Task 6.
- Punctuation, case variants, and empty search queries are safe and predictable; tested in Task 4.
- All built internal paths work under `/MyGPTNews/`; tested in Tasks 1 and 7.

---

### Task 1: Initialize Vite and baseline tests

**Files:** Create `package.json`, `vite.config.js`, `src/index.html`, `src/styles.css`, `tests/project.test.js`.

**Produces:** `npm run dev`, `npm run build`, `npm test`, and `npm run verify` contracts.

- [ ] Write failing `tests/project.test.js` asserting `config.default.base === '/MyGPTNews/'`.
- [ ] Run `npm test -- tests/project.test.js`; expect failure because configuration is absent.
- [ ] Add Vite and scripts. Export `{ base: '/MyGPTNews/' }` from `vite.config.js`; configure `vite`, `vite build`, and `node --test` scripts.
- [ ] Run `npm test -- tests/project.test.js; npm run build`; expect pass and `dist/` output.
- [ ] Commit: `chore: initialize Vite static site`.

### Task 2: Define edition format, URL utility, and samples

**Files:** Create `data/schema/edition.schema.json`, `data/editions/2026-09-25.json`, `data/editions/2026-09-26.json`, `scripts/lib/url.js`, `tests/url.test.js`.

**Produces:** `normalizeUrl(value: string): string` and complete edition field contract.

- [ ] Write a failing test that normalizes `HTTPS://Example.test/news/?utm_source=x#top` to `https://example.test/news`.
- [ ] Run `npm test -- tests/url.test.js`; expect a missing-module/function failure.
- [ ] Implement normalization: lower-case host/scheme, drop fragments/default ports/tracking parameters, and remove a non-root trailing slash.
- [ ] Add schema requiring deterministic ID, date, headline, summary, subjects, developer/publisher, categories/platforms/tags, source data, image, publication/discovery timestamps, featured flag, and optional Steam/related IDs.
- [ ] Add fictional samples demonstrating featured content, categories/platforms, Steam link, failed remote image fallback, archive date variety, and a linked update.
- [ ] Run focused test; expect pass. Commit: `feat: add edition data contract and samples`.

### Task 3: Validate editions and generate data indexes transactionally

**Files:** Create `scripts/lib/editions.js`, `scripts/lib/indexes.js`, `scripts/prepare-edition.js`, `tests/editions.test.js`, `tests/fixtures/`.

**Consumes:** `normalizeUrl()` and edition source files. **Produces:** `validateEdition(edition)`, `buildIndexes(editions)`, `prepareEditions(rootDir)`, archive/search/game/processed URL JSON.

- [ ] Write failing tests for duplicate normalized source URL rejection and for retaining an original index when a new invalid edition is processed.
- [ ] Run `npm test -- tests/editions.test.js`; expect missing implementation failure.
- [ ] Implement schema/field/date validation, unique IDs/URLs, deterministic near-headline detection, and sort order (edition newest-first; featured story then publication time).
- [ ] Implement atomic generation through a temporary directory and replacement only after every source edition validates.
- [ ] Add CLI `node scripts/prepare-edition.js [edition-path]` that validates every edition and regenerates every index.
- [ ] Run focused tests and `npm run prepare-edition -- data/editions/2026-09-26.json`; expect pass and generated files. Commit: `feat: validate editions and generate indexes`.

### Task 4: Build static loading and filtering engine

**Files:** Create `src/js/paths.js`, `src/js/data.js`, `src/js/search.js`, `tests/search.test.js`.

**Consumes:** generated `search-index.json`. **Produces:** `assetPath(path)`, `loadJson(path)`, `searchStories(records, query, filters)`.

- [ ] Write failing tests for case-insensitive cross-edition game matching, intersected source/platform filters, and blank query returning all records.
- [ ] Run `npm test -- tests/search.test.js`; expect missing implementation failure.
- [ ] Implement base-safe `assetPath` using `import.meta.env.BASE_URL`, fetch JSON loading with useful errors, and normalized matching across headline, summary, subject, developer, publisher, category, platform, tags, and source.
- [ ] Support inclusive date, game, platform, category, and source filters.
- [ ] Run focused tests; expect pass. Commit: `feat: add static data loading and search`.

### Task 5: Build the accessible Today page and common cards

**Files:** Create `src/js/render.js`, `src/js/today.js`, `src/index.html`, `src/styles.css`, `public/fallback-news.svg`, `tests/render.test.js`.

**Consumes:** edition object, `assetPath`, `loadJson`. **Produces:** `renderStoryCard(story)`, `renderEdition(edition)`, `installImageFallback(image)`.

- [ ] Write failing tests that an updated story shows its relationship and Steam link, and that an image error uses fallback while retaining lazy loading/aspect-ratio layout.
- [ ] Run `npm test -- tests/render.test.js`; expect missing renderer failure.
- [ ] Render semantic cards with image, metadata, tags, source/original links, Steam link, and update indicator. Use safe external link attributes.
- [ ] Render greeting for Daniele based on local time, subtitle, Brussels edition date/last update, accessible archive/search controls, featured story, and remaining cards.
- [ ] Implement empty, malformed-data, and older-edition-available failure states.
- [ ] Implement dark navy/blue/violet responsive styles with two large columns desktop, one column mobile, focus, contrast, and reduced-motion rules.
- [ ] Run focused tests and build; expect pass. Commit: `feat: build responsive daily briefing page`.

### Task 6: Add Archive, Search, and game history pages

**Files:** Create `src/archive/index.html`, `src/search/index.html`, `src/js/archive.js`, `src/js/search-page.js`, `tests/pages.test.js`.

**Consumes:** archive/search/game indexes and `date`/`game` URL parameters. **Produces:** chronological edition view, result deep links, game histories.

- [ ] Write failing tests that an invalid date returns a `missing` state containing archive navigation, and an empty result creates an accessible “No stories found” message.
- [ ] Run `npm test -- tests/pages.test.js`; expect missing helper failure.
- [ ] Implement newest-first edition listing, `?date=YYYY-MM-DD` selection, previous/next links, stable `#story-id` anchors, and graceful malformed-data handling.
- [ ] Implement labelled query/filter controls, initialize game from `?game=`, render all filter choices, and deep-link results to edition/story anchors.
- [ ] Run focused tests and production build; expect pass. Commit: `feat: add archive search and game history`.

### Task 7: Configure verification, GitHub Pages, and publishing documents

**Files:** Create `.github/workflows/deploy-pages.yml`, `README.md`, `PREFERENCES.md`, `SOURCES.md`, `docs/daily-maintenance.md`, `scripts/verify.js`; modify `package.json`, `tests/project.test.js`.

**Consumes:** preparation, tests, and build commands. **Produces:** `npm run verify` and daily publishing instructions.

- [ ] Write failing test that `verify` includes preparation before production build.
- [ ] Run `npm test -- tests/project.test.js`; expect failure due to incomplete pipeline.
- [ ] Implement verification sequence: test, validate/index generation, Vite build.
- [ ] Add least-privilege Pages workflow from `main`: cache npm, `npm ci`, `npm run verify`, configure/upload/deploy Pages; set `contents: read`, `pages: write`, `id-token: write`.
- [ ] Document local development, data format, samples removal, Pages setting, daily update/recovery, and sources/preference authority.
- [ ] Seed preferences with marked example games/topics plus PC-first, quality-first, major-outside-interest, Steam, and no-repeat rules. Seed sources with specified source priorities/types, including primary official sources.
- [ ] Run `npm run verify`; expect test/data/build pass. Commit: `docs: add publishing operations and Pages deployment`.

### Task 8: Verify the complete browser-facing artifact

**Files:** Modify only defect-specific source/test/docs files if required.

- [ ] Run `npm run verify; rg 'href="/' dist src`; expect successful verification and no root-relative application URLs.
- [ ] Start `npm run dev -- --host 127.0.0.1`, then inspect Today, Archive, and Search under the repository base path for keyboard operation, story links, filtering, fallback behavior, and console errors.
- [ ] For every defect, first add a failing regression test, then make the minimal correction and rerun `npm run verify`.
- [ ] Commit any final correction: `test: verify Pages-ready news site`.
