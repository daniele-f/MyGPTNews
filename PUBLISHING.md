# Publishing gaming editions

The first schedule run on a Europe/Brussels calendar day creates one file named `data/editions/YYYY-MM-DDTHH-mm-ssZ.json`. Its `id` uses the same instant with colons, e.g. `2026-10-30T18:00:00Z`; `date` is that instant's Europe/Brussels date. Every later run that day edits that same file and updates the edition-level `updatedAt`; it must never create a second file for the date.

```json
{"id":"2026-10-30T18:00:00Z","date":"2026-10-30","publishedAt":"2026-10-30T18:00:00Z","updatedAt":"2026-10-30T18:00:00Z","stories":[{"id":"stable-story-id","headline":"Verified headline","summary":"Concise verified summary.","categories":["Updates"],"game":{"name":"Game name","id":"game-name","url":"https://official-game.example/"},"sourceUrl":"https://publisher.example/news","publishedAt":"2026-10-30T17:00:00Z","featured":true,"imageUrl":"https://publisher.example/image.jpg","steam":{"url":"https://store.steampowered.com/app/1/","releaseDate":"2026-11-01T00:00:00Z"},"price":{"amount":19.99,"currency":"EUR","discountPercent":20,"checkedAt":"2026-10-30T18:00:00Z"},"relatedArticleIds":[]}]}
```

Required article fields are `id`, `headline`, `summary`, `categories`, `sourceUrl`, `publishedAt`, and `featured`. Categories are Releases, Announcements, Updates, Industry News, and Deals & Events. Optional game, image, Steam, price, and related fields must be omitted when unverified. Summaries are plain text; descriptive Markdown links are allowed, and emphasis must use paired `<b>...</b>` tags—never `**Markdown bold**`. Convert every stated time in a summary to Europe/Brussels local time, and show only the local time without timezone or location labels. Stories centred on one identifiable game should include `game.name` and `game.id`. If its canonical `game.name` is not the exact phrase used in the headline, add `game.headlineName` with the exact headline phrase; it must occur in the headline and is used only for headline highlighting. Use `steam.url` whenever a verified Steam page exists; it is the preferred game-page link. Otherwise, `game.url` may be a verified official game page (such as Battle.net). Price observations are historical, never current-price claims.

For `imageUrl`, prefer a verified image from the article's publisher. If no usable article image is available and `steam.url` is verified, use the exact `header_image` returned by Steam's app-details metadata for that app; do not construct a CDN URL from an app ID. Every story with `steam.url` must therefore include that verified `imageUrl`; if it cannot be verified, do not publish the Steam link or story yet. For stories without Steam, check the publisher article image before omitting `imageUrl`. Do not use screenshots, search-result thumbnails, or invented image URLs; omit `imageUrl` only when neither source can be verified.

For later runs on the same day:

- A genuinely new story is appended with `changeType: "new"` and an `updatedAt` timestamp for that run.
- A meaningful factual revision updates the existing story in place, preserves its `id`, and sets `changeType: "updated"` plus `updatedAt`.
- Do not add either marker merely because a schedule ran. Do not repeat a story with a new ID or duplicate its source URL.
- Existing baseline stories from the day’s first run omit `changeType`.

Validate locally with `npm run verify` when a checkout is available; otherwise commit only the target JSON file and let the repository’s GitHub Actions verification decide deployment.
