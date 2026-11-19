# Scheduled publisher task

Repository: `https://github.com/daniele-f/MyGPTNews.git`
Target branch: `main`

Use the connected GitHub integration as the primary repository interface. Do not require a local checkout. If a current checkout and verification tooling happen to be available, they may be used for local verification, but their absence must not by itself block publication.

For this scheduled run, read and follow `AGENTS.md`, `PREFERENCES.md`, `SOURCES.md`, and `PUBLISHING.md` from `main`, in that order. Those files are the authoritative publishing instructions. Before saving, complete the `PUBLISHING.md` game-name and image checks: use `game.headlineName` whenever the canonical title differs from the literal headline wording, and fetch Steam app-details `header_image` for every verified Steam page when the metadata endpoint is available. If Steam app-details cannot be retrieved, follow the verified image fallback rules in `PUBLISHING.md`; never construct or invent an image URL.

For new stories and revisions to Steam links, record each verified Steam app page as a named `steamPages` entry per `PUBLISHING.md`. Keep the original article URL in `sourceUrl`. The site builds the Links section and the shareable permalink from the edition data, so keep those links out of the summary.

Before adding a story, inspect every edition under `data/editions/` through the connected GitHub integration and check its ID and source URL against the complete archive, including previous days. Apply the same normalization semantics documented by `normalizeUrl` in `scripts/lib/url.ts`; read that file from GitHub when needed. Follow the archive-wide duplicate checks in `PUBLISHING.md`; skip previously covered reporting rather than assigning a new ID or changing its source URL.

Follow the daily-edition rules in `PUBLISHING.md`: the first run for a Europe/Brussels calendar day creates the day's timestamped edition, and later runs edit that same file only. Never create a second edition for the same Brussels date.

Publish only when the verified reporting supports it. Keep every publishing change within the single target file under `data/editions/`. Re-read the complete target edition before committing and check required fields, categories, featured count, story IDs, normalized source URLs, Steam metadata, images, change markers, and same-day behavior.

When a current checkout and verification tooling are available, run `npm run verify` successfully against the complete archive before committing. When no checkout is available, do not attempt to clone solely for verification and do not block publication for that reason. Instead, commit only the target edition JSON directly to `main` through the connected GitHub integration and let the repository's GitHub Actions workflow be the authoritative remote validation and deployment gate. Do not claim local verification in that case.

Do not modify application source, workflows, package files, generated indexes, documentation, or unrelated editions during a publishing run. Do not pause or disable the publishing automation merely because local checkout, DNS-based cloning, or local npm verification is unavailable. If GitHub integration access itself is unavailable, required repository files cannot be read, the target edition cannot be safely determined, or verified reporting is insufficient, make no publishing change and report the blocker.
