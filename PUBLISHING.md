# Publishing gaming editions

Each schedule run creates one file named `data/editions/YYYY-MM-DDTHH-mm-ssZ.json`. Its `id` uses the same instant with colons, e.g. `2026-10-30T18:00:00Z`; `date` is that instant's Europe/Brussels date. Multiple files may share a date.

```json
{"id":"2026-10-30T18:00:00Z","date":"2026-10-30","publishedAt":"2026-10-30T18:00:00Z","updatedAt":"2026-10-30T18:00:00Z","stories":[{"id":"stable-story-id","headline":"Verified headline","summary":"Concise verified summary.","categories":["Updates"],"game":{"name":"Game name","id":"game-name"},"sourceUrl":"https://publisher.example/news","publishedAt":"2026-10-30T17:00:00Z","featured":true,"imageUrl":"https://publisher.example/image.jpg","steam":{"url":"https://store.steampowered.com/app/1/","releaseDate":"2026-11-01T00:00:00Z"},"price":{"amount":19.99,"currency":"EUR","discountPercent":20,"checkedAt":"2026-10-30T18:00:00Z"},"relatedArticleIds":[]}]}
```

Required article fields are `id`, `headline`, `summary`, `categories`, `sourceUrl`, `publishedAt`, and `featured`. Categories are Releases, Announcements, Updates, Industry News, and Deals & Events. Optional game, image, Steam, price, and related fields must be omitted when unverified. Price observations are historical, never current-price claims. Validate locally with `npm run verify`; fix validation errors in the target JSON file only.
