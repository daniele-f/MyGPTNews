# Daily maintenance

1. Read `PREFERENCES.md`, `SOURCES.md`, and `PUBLISHING.md`.
2. Find the edition file for the current Europe/Brussels date. Create one only when none exists; otherwise update that one file.
3. Append genuinely new stories with `changeType: "new"` and `updatedAt`. Revise existing stories in place with `changeType: "updated"`, `updatedAt`, and the same ID.
4. Run `npm run verify` when a local checkout is available. Commit only the target edition file; generated indexes are rebuilt by GitHub Actions.
5. If validation fails, correct only that day’s target file. Never create a second same-day edition.
