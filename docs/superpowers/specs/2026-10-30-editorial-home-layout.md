# Editorial Home Layout Design

## Intent

Turn the latest-edition homepage into a dark, editorial gaming-news front page. The design must preserve the existing static-data model, permanent story links, filters, and GitHub Pages base path.

## Layout

- A compact top header contains the My GPT News wordmark, date, a single Home link, Browse archive, and Search.
- Desktop content is a two-column layout: a dominant central feature stage and a wider right-hand latest-stories rail.
- The initially featured article is active in the centre. Selecting a story in the rail updates that stage without navigation.
- A selected rail row shows a left-positioned, left-facing chevron before its thumbnail.
- The centre article exposes its categories, publication date, headline, summary, verified Steam link when present, original source link, and a Read full story link to a dedicated permanent detail page. The detail page shows the complete available briefing record, including historical price when supplied.
- A selection uses a brief fade-and-slide transition; reduced-motion preferences disable it.
- Browse archive remains a separate Archive page. The home page contains no duplicate archive link in the rail.

## Responsive behavior

At narrow widths, the header wraps and the layout becomes one column. The active story remains first; rail rows remain keyboard-operable below it.

## Constraints

- Dark mode only; use a deep blue-charcoal background, warm off-white text, muted blue structure, and restrained rust-orange emphasis.
- Do not create fabricated story data, change edition JSON, or change generated indexes.
- Keep empty-state behavior and existing query-based category/unread filtering.
