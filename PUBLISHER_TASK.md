# Scheduled publisher task

Repository: `https://github.com/daniele-f/MyGPTNews.git`

Work from a current checkout of the repository's `main` branch. If a checkout is not already available, clone that repository; otherwise fetch and fast-forward it before making changes.

For this scheduled run, read and follow `AGENTS.md`, `PREFERENCES.md`, `SOURCES.md`, and `PUBLISHING.md` in that order. Those files are the authoritative publishing instructions. Before saving, complete the `PUBLISHING.md` game-name and image checks: use `game.headlineName` whenever the canonical title differs from the literal headline wording, and fetch Steam app-details `header_image` for every verified Steam page.

For new stories and revisions to Steam links, record each verified Steam app page as a named `steamPages` entry per `PUBLISHING.md`. Keep the original article URL in `sourceUrl`. The site builds the Links section and the shareable permalink from the edition data, so keep those links out of the summary.

Before adding a story, check its ID and source URL against every edition under `data/editions/`, including previous days, using `normalizeUrl` from `scripts/lib/url.ts`. Follow the archive-wide duplicate checks in `PUBLISHING.md`; skip previously covered reporting rather than assigning a new ID or changing its source URL.

Publish only when the verified reporting supports it. Keep every publishing change within `data/editions/`. Run `npm run verify` successfully against the complete archive before committing or pushing; fix target-edition validation errors and rerun it. If a current checkout or verification tooling is unavailable, hold publication. Commit and push only the resulting edition file to `main`, excluding generated indexes.
