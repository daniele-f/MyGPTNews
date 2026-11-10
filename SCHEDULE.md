# Scheduled publisher prompt

Publish verified gaming news directly to the `main` branch of the MyGPTNews repository: https://github.com/daniele-f/MyGPTNews

Do not use a local folder, local checkout, pull request, or draft. Edit the repository through the connected GitHub integration.

Before researching or editing, read `AGENTS.md`, `PREFERENCES.md`, `SOURCES.md`, and `PUBLISHING.md` from the repository’s `main` branch. Follow them exactly.

Your task is a worldwide daily gaming and game-industry briefing, with PC gaming as the primary priority. Focus on new releases, upcoming products, major expansions/DLC, major updates, significant PC gaming hardware, announcements that materially affect PC players, and noteworthy PC gaming deals or events.

Prefer:

- PC releases and Steam releases
- PC versions of major multiplatform games
- Major PC expansions, DLC, updates, and patches
- Significant PC hardware news
- Steam sales, Steam Next Fest, major publisher sales, significant GOG or Epic sales, worthwhile free weekends, giveaways, and other high-value promotions

Major multiplatform or console announcements may be included when they matter broadly to the gaming industry or PC players. Deprioritize Nintendo Switch and Switch 2 news unless it is a genuinely major cross-industry announcement or title.

Avoid filler, trivial discounts, unsupported rumors, esports results, and corporate news unless it directly affects a product, release, or PC players. Use credible current sources. Prefer developments from the past 24–48 hours and do not repeat prior coverage unless there is meaningful new factual information.

Research and selection:

- For a new daily edition, select 5–9 of the most relevant updates when enough strong stories exist.
- For later runs on the same day, add only genuinely worthwhile new stories or meaningful factual revisions. Do not add filler merely to reach a target count.
- For every game mentioned, record its verified Steam store app link as a named `steamPages` entry per `PUBLISHING.md`. Omit pages that cannot be verified.
- Include a relevant verified image URL when available. Do not fabricate images, Steam data, prices, dates, sources, or claims.
- Include source links for every story.

Daily-edition rule:

1. Determine today’s calendar date in `Europe/Brussels`.
2. Inspect every file in `data/editions/`.
3. If no edition has today’s `date`, create one timestamped edition file for today using the current UTC timestamp in its filename and ID.
4. If an edition already has today’s `date`, edit that existing file only. Never create a second same-day edition file, never rename it, and never create a new archive entry for a later run.
5. Update the edition-level `updatedAt` whenever the day’s file changes.
6. Do not change a previous day except to correct a confirmed factual error.

Story update rules for later same-day runs:

- For a genuinely new story added after the day’s first publication, append it with:
  - a new stable `id`
  - `changeType: "new"`
  - `updatedAt` set to the current run time
- For a meaningful factual revision to an existing story, edit that story in place:
  - preserve its existing `id`
  - set `changeType: "updated"`
  - set its `updatedAt` to the current run time
  - update the summary, source URL, image, Steam metadata, price observation, or other fields only when newly verified
- Do not mark a story as new or updated merely because another schedule run occurred.
- Do not repeat an article with a new ID, duplicate its normalized source URL, or create a second version of the same story.
- Stories present in the first publication of the day are the baseline and must omit `changeType`.

Edition schema requirements:

- Required story fields: `id`, `headline`, `summary`, `categories`, `sourceUrl`, `publishedAt`, and `featured`
- Allowed categories: `Releases`, `Announcements`, `Updates`, `Industry News`, and `Deals & Events`
- At most one story may be `featured`
- `changeType`, when present, must be exactly `"new"` or `"updated"` and requires a valid story-level `updatedAt`
- Preserve existing article IDs when correcting facts
- Omit optional game, image, Steam, price, and related fields when they cannot be verified
- Treat price observations as historical, never as current-price claims

Before committing, re-read the target edition file and check for duplicate story IDs, duplicate normalized source URLs, unsupported categories, invented facts, and incorrect same-day-file behavior.

Commit only the one target file in `data/editions/` when publishing. Do not edit application source, workflows, package files, generated indexes, or unrelated edition files. Do not claim to have run local verification unless a local checkout is actually available; GitHub Actions will validate and deploy the committed edition.

If there is no credible new story or meaningful update to publish, make no repository changes and report that no publication was needed.

After a successful commit, report:

- the edition filename edited or created
- whether it was a new daily edition or an update to the existing daily edition
- number of newly added stories
- number of updated stories
- featured headline
- commit SHA

## Link presentation

The site builds the Links section from the raw `sourceUrl` and `steamPages` URLs and generates the story permalink. Keep those links out of the summary. Use descriptive Markdown links for other inline references.
