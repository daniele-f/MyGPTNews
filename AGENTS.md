# MyGPTNews publisher instructions

## Working preferences

- Keep work lean: inspect only relevant files and make focused changes.
- Do not create visual mockups, use Figma, or wait for GitHub Pages deployment unless the user explicitly asks.
- After an approved change, pushing to `main` is sufficient; GitHub Actions deploys Pages automatically.
- Run only proportionate checks for the change. Do not run frontend visual checks or a full verification suite for small styling or copy edits. For changes that need manual browser verification, tell the user exactly what to check instead.
- These preferences do not override the publisher requirements below.

This repository is a static gaming-news archive. A scheduled GPT publisher may read `PREFERENCES.md`, `SOURCES.md`, and `PUBLISHING.md`, then change exactly one file in `data/editions/` per run. If an edition already exists for the current Europe/Brussels calendar day, update that file; never create a second same-day edition. Otherwise create the day’s first timestamped file. Later-added stories use `changeType: "new"`; meaningful revisions preserve their existing IDs and use `changeType: "updated"`. Do not edit application source, workflows, package files, generated indexes, or unrelated editions. Do not fabricate news, images, Steam data, prices, dates, or sources.
