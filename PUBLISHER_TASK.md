# Scheduled publisher task

Repository: `https://github.com/daniele-f/MyGPTNews.git`

Work from a current checkout of the repository's `main` branch. If a checkout is not already available, clone that repository; otherwise fetch and fast-forward it before making changes.

For this scheduled run, read and follow `AGENTS.md`, `PREFERENCES.md`, `SOURCES.md`, and `PUBLISHING.md` in that order. Those files are the authoritative publishing instructions. Before saving, complete the `PUBLISHING.md` game-name and image checks: use `game.headlineName` whenever the canonical title differs from the literal headline wording, and fetch Steam app-details `header_image` for every verified Steam page.

Publish only when the verified reporting supports it. Keep every publishing change within `data/editions/`, validate with `npm run verify` when available, and commit and push only the resulting edition file to `main`.
