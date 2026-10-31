# MyGPTNews publisher instructions

## Working preferences

- Work efficiently and minimize token use without sacrificing correctness.
- Before exploring, read this file and only files directly relevant to the request. Do not scan or summarize the full tree; for unfamiliar areas, check a code map or architecture index first if one exists.
- Keep reasoning, plans, progress updates, and handoffs concise; state conclusions first.
- For feature or fix work with meaningful design choices, propose one compact combined approach (behavior, technical approach, error cases, tests, and UI impact) and get one approval before changing files.
- Do not create design specs, implementation-plan files, or documentation unless explicitly requested, product-required, or needed for a lasting architectural decision.
- Make no unrelated refactors, cleanup, formatting churn, dependency updates, or architecture changes; report unrelated issues separately.
- Prefer targeted `rg` searches and focused reads. Use fixtures or mocks for deterministic external-data tests, and avoid repeated live-service calls unless required.
- Keep work lean: inspect only relevant files and make focused changes.
- Do not create visual mockups, use Figma, or wait for GitHub Pages deployment unless the user explicitly asks.
- After an approved change, pushing to `main` is sufficient; GitHub Actions deploys Pages automatically.
- Verify proportionally: use targeted tests/lint for isolated logic, and broader tests/builds only for cross-cutting, provider/integration, or merge-ready work. For docs/config-only changes, run only relevant checks.
- Do not run browser/UI checks unless explicitly requested. When UI behavior changes, provide a short focused manual-test checklist instead.
- At handoff, state only what changed, checks and results, requested manual tests, and known limitations.
- These preferences do not override the publisher requirements below.

This repository is a static gaming-news archive. A scheduled GPT publisher may read `PREFERENCES.md`, `SOURCES.md`, and `PUBLISHING.md`, then change exactly one file in `data/editions/` per run. If an edition already exists for the current Europe/Brussels calendar day, update that file; never create a second same-day edition. Otherwise create the day’s first timestamped file. Later-added stories use `changeType: "new"`; meaningful revisions preserve their existing IDs and use `changeType: "updated"`. Do not edit application source, workflows, package files, generated indexes, or unrelated editions. Do not fabricate news, images, Steam data, prices, dates, or sources.
