# My GPT News

A static personal daily gaming-news briefing, built with Vite and deployed to GitHub Pages. Vite gives `npm run dev` live reload while the deployed site stays dependency-light and static.

## Commands

`npm install` installs tooling. `npm run dev` starts local development. `npm test` runs tests. `npm run prepare-edition -- data/editions/YYYY-MM-DD.json` validates all editions and regenerates indexes. `npm run build` creates `dist/`; `npm run verify` runs the complete pipeline.

Edit only `data/editions/YYYY-MM-DD.json` for daily content, then run preparation and verification. Remove the two fictional sample JSON editions and regenerate indexes before publishing real editions. `PREFERENCES.md` governs selection and `SOURCES.md` limits collection. If a daily update fails, fix or remove the invalid new file and rerun preparation; existing generated data remains valid.

Enable **Settings → Pages → Source: GitHub Actions** once in GitHub.
