# Daily maintenance

1. Read `PREFERENCES.md` and `SOURCES.md`.
2. Add one new immutable `data/editions/YYYY-MM-DD.json` using the sample field names.
3. Run `npm run prepare-edition -- data/editions/YYYY-MM-DD.json` and inspect duplicates.
4. Run `npm run verify`, review the local Vite page, then commit the new edition and generated indexes.
5. If validation fails, correct only the new edition; do not overwrite older editions.
