# My GPT News

A static gaming-news archive built with Vite and deployed to GitHub Pages. Published content lives only in timestamped JSON files under `data/editions/`; an empty archive is intentional until real reporting is published.

## Commands

`npm install` installs tooling. `npm run dev` starts local development. `npm test` runs tests. `npm run prepare-edition -- data/editions/YYYY-MM-DD.json` validates all editions and regenerates indexes. `npm run build` creates `dist/`; `npm run verify` runs the complete pipeline.

See `PUBLISHING.md` and `AGENTS.md` before scheduling GPT publishing. Run `npm run verify` before committing an edition. Generated indexes are build artifacts; GitHub Actions validates, tests, builds, and deploys but never generates news.

Enable **Settings → Pages → Source: GitHub Actions** once in GitHub.
