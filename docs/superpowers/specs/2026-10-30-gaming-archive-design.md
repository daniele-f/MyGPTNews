# MyGPTNews Gaming Archive Design

## Intent

Rebuild MyGPTNews as a static, responsive archive for verified gaming-news
briefings. An external scheduled ChatGPT task is the publisher: it commits only
edition JSON files to GitHub. GitHub Actions validates and deploys that content
to Pages. The site has no backend, accounts, database, runtime news API, or
embedded secrets.

## Goals

- Show the latest published edition by default and group editions by local
  calendar day in archive navigation.
- Support more than one separately published edition per day.
- Provide permanent article links, edition navigation, search, category and
  favorite-game filtering, related coverage, Steam metadata, and local read
  state.
- Make invalid content fail CI before deployment; generate deterministic archive
  and search indexes from editions.
- Remove all hourly quote content, UI, scripts, tests, data, and workflow logic.

## Non-goals

- Automatic collection or generation of news in GitHub Actions.
- Server-side preferences, synchronisation, login, current Steam prices, or
  fabricated news/metadata.
- Publishing any development fixture as real news.

## Edition identity and storage

Each scheduled run creates one self-contained edition. Files use an ISO-like,
Windows-safe UTC timestamp: `data/editions/YYYY-MM-DDTHH-mm-ssZ.json`, for
example `data/editions/2026-10-30T18-00-00Z.json`.

The edition contains an `id` with the corresponding ISO instant
(`2026-10-30T18:00:00Z`), `publishedAt`, and `date` (the Europe/Brussels local
calendar day used for grouping). More than one file may share `date`; their
`id`s and filenames must be unique. The app orders by `publishedAt`, not
filename. A correction preserves article IDs and updates only the target edition
file.

## Content model

An edition has a stable ID, a local date, publication/update timestamps, an
optional title, and one or more articles. An article requires a stable `id`,
headline, concise summary, one or more allowed categories, original source URL,
publication timestamp, and `featured` status. Game name and normalized game ID
are paired when applicable. Images, Steam URL/release date, historical price
observation, discount, and related article IDs are optional. A price observation
always records when it was checked and is labelled historical; no field implies
the current price.

The allowed categories are `Releases`, `Announcements`, `Updates`, `Industry
News`, and `Deals & Events`. At most one article may be featured per edition.
References resolve against article IDs in older editions; unresolved references
are reported as validation errors, so they cannot reach the deployed archive.

## Frontend

The Vite multi-page site keeps the home, archive, and search entry points.

- Home loads the latest index record and its edition, with a prominent featured
  article above the rest. It has a clear empty state when no editions exist.
- Archive groups time-stamped edition records under calendar dates, marks dates
  with editions, and supplies previous/next links that skip absent dates. An
  edition selector distinguishes multiple runs on one day.
- Direct article URLs use query parameters (`edition` and `article`) and work
  beneath the GitHub Pages `/MyGPTNews/` base path. Resolving a link selects the
  edition, scrolls/focuses the article, and marks it read without rewriting the
  URL.
- Cards use semantic articles, keyboard-visible controls, lazy images with a
  static fallback, accessible labels, category filters, Steam links where
  verified, and graceful omission of missing optional data.
- `localStorage` holds favorite normalized game IDs and read article IDs.
  Archive-wide favorite and unread filters operate from generated indexes.
- Search is entirely client-side over generated article title, summary, and game
  fields. Results link to the permanent article URL.

## Validation and generated data

`prepare-edition` discovers timestamped files, parses each file, validates its
shape and calendar/timestamp consistency, checks unique edition/article IDs,
source URLs, category values, featured count, Steam URLs, and related-story
references. It writes `archive.json`, `search-index.json`, and `games-index.json`
atomically only after every input passes. The archive index includes edition ID,
date, timestamps, path, and story count. Empty archives are valid and generate
empty indexes.

## Publishing documentation

`AGENTS.md` constrains the scheduled task to editorial files and exactly one
edition JSON file per run. `PREFERENCES.md` contains editable editorial choices.
`PUBLISHING.md` documents filenames, complete schema, examples, date rules,
corrections, and local validation. The task must not modify app source or
generated index files.

## GitHub Actions and verification

The Pages workflow runs on pushes to `main` and manual dispatch only. It runs
the edition preparation, tests, typecheck, and production build before deploying
the generated static artifact. It neither schedules itself nor commits content.
Tests cover indexing, malformed content, cross-edition references, timestamped
routing, preference persistence, search, and the empty state.

## Approaches considered

1. **One mutable daily JSON file.** Simple and compatible with the old format,
   but multiple scheduled runs become indistinguishable updates.
2. **Separate timestamped edition files, grouped by day.** Chosen. It records
   each run as its own edition, keeps a straightforward publish-only workflow,
   and still gives readers a calendar-level daily archive.
3. **A backend or database.** Rejected because static GitHub Pages and direct
   GitHub publishing are explicit constraints.

## Builder decisions

- Use UTC for filename and edition identity; derive and validate the displayed
  grouping date in Europe/Brussels.
- Treat unknown related IDs as invalid input, rather than silently hiding them.
- Remove all existing fictional editions rather than retaining preview content.
- Keep a small test-only fixture creator outside published `data/editions`.
