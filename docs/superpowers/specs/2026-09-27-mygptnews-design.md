# My GPT News design

## Purpose

My GPT News is Daniele's public, personal daily gaming-news briefing. A scheduled publishing task will add a small curated edition each day; every prior edition remains browsable, searchable, and shareable. The complete interface and content are English.

## Chosen architecture

Use **Vite with vanilla HTML, CSS, and ES modules**. Vite provides a local development server with automatic updates on source and JSON-data changes, while its production output remains a lightweight static site suitable for GitHub Pages. There is no framework runtime, backend, database, account system, CMS, or paid dependency.

`vite.config.js` sets `base: '/MyGPTNews/'`. All internal links and assets are resolved through this base path so the deployed site works below the repository subpath as well as during local development.

## Site structure

- Today is the root page. It loads metadata for the newest valid edition, renders a personal greeting, edition information, an accessible search entry point, a featured story, and responsive story cards.
- Archive is a static page with chronological edition navigation and stable links in the form `archive/?date=YYYY-MM-DD`.
- Search is a static page with client-side, fielded matching against a generated index and filters for date range, game, platform, category, and source. Results deep-link to the matching edition/story anchor.
- A game name links to the search page with a game filter, giving a history view without duplicating page data.

The interface uses semantic landmarks, keyboard-operable controls, visible focus styles, responsive image aspect ratios, reduced-motion support, lazy remote images, and a local neutral fallback when an image fails.

## Data and publishing model

Each immutable daily edition lives at `data/editions/YYYY-MM-DD.json`. It contains edition metadata and stories with deterministic IDs, normalized source URLs, source and discovery times, tags, platforms, optional Steam URL, featured status, and optional relationships to earlier stories.

Generated files are separated from source content:

- `data/archive.json`: valid edition list and newest-edition metadata.
- `data/search-index.json`: compact normalized searchable records.
- `data/games-index.json`: game to story mappings.
- `data/processed-urls.json`: normalized URLs for deterministic duplicate checks.

Node scripts validate the schema, reject malformed dates and duplicate URLs/IDs, identify deterministic close headline matches, sort stories, and regenerate every derived index. A new edition is only published if it validates; existing editions and their indexes remain untouched if a future run fails.

## Tooling and verification

Use Node's built-in test runner to avoid a test framework dependency. Tests cover schema validation, URL duplicate detection, index creation, archive ordering, and base-path resolution. `npm run prepare-edition -- data/editions/YYYY-MM-DD.json` validates and regenerates indexes. `npm run verify` runs tests, data validation, and the production build.

## Deployment

The GitHub Actions workflow triggers from `main`, uses minimal Pages permissions, caches npm data, runs `npm ci` and `npm run verify`, uploads `dist`, then deploys it through GitHub's standard Pages actions. Deployment does not run after any validation or build failure. The owner must select GitHub Actions as the repository's Pages source once.

## Operational documents

`PREFERENCES.md` is the editable source of truth for each scheduled briefing task. `SOURCES.md` is the sole allowed source list with priority and source type. A concise daily runbook will describe exactly how a future task adds, validates, and commits a new edition without reading application code. The README explains development, data, deployment, sample-data removal, and failure recovery.

## Scope boundaries

The implementation excludes authentication, comments, analytics, advertising, notifications, social features, a CMS, databases, and unrelated features.
