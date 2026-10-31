# Day Archive Navigation Design

## Intent

Make the homepage the archive: readers can move through dates that have
published coverage, choose an available date from a compact calendar popover,
and see that day's editorial stage and story rail. This replaces a separate
archive destination with an archive experience that keeps the visual focus on
the selected day's stories.

## Goals

- Default to the newest available Brussels calendar day.
- Support `?date=YYYY-MM-DD` for a selected available date, so chosen-day
  views are linkable and browser navigation works naturally.
- Put a small timeline in the homepage header with previous-day and next-day
  controls enabled only when an available date exists, plus the selected date
  as the calendar-popover trigger.
- Render a keyboard-accessible calendar popover. Dates with no edition are
  visually disabled and cannot be selected; navigating its months does not
  alter the selected day until a valid date is chosen.
- Reload the stage and rail with all stories for the selected calendar day.
  Legacy data with multiple editions for a day remains combined as today.
- Rename the rail heading to `Stories for this day` and show only each story's
  headline and categories there.
- Remove the standalone archive page and all of its route/build/test references.
  Preserve search and permanent article links.

## Non-goals

- Altering published edition JSON or generated indexes.
- Removing the search or article pages.
- Adding a server, package, or arbitrary-date browsing without data.

## Approaches considered

1. Keep `/archive/` and add a duplicate date control there. This leaves the
   front page and archive with competing navigation models.
2. Use a dropdown containing available dates. This is simple but does not meet
   the requested small calendar interaction.
3. Make the homepage the day archive, with a custom calendar popover that
   exposes only available dates. Chosen because it consolidates the flow and
   gives clear unavailable-date feedback without relying on a native date
   input, which cannot disable arbitrary dates. The user selected this
   approach.

## Implementation decisions

- Extract date selection and calendar markup/interaction into focused homepage
  helpers, using the archive index's distinct dates as the source of truth.
- Selecting a date uses `location.assign` (or an equivalent link) to the root
  page with `?date=`; browser history then behaves normally without a client
  router.
- Previous means the next older available date; next means the next newer
  available date. Missing adjacent dates produce disabled controls.
- `?edition` and `?article` permanent links keep priority over `?date`, because
  article links must still load and focus their exact story.
- Remove `archive/index.html`, `src/js/archive.ts`, its Vite entry, and tests
  that solely specify the retired page. Update existing homepage tests and add
  focused tests for date selection/rendering behavior.

## Constraints

- Keep the existing static Vite architecture and Pages base-path handling.
- Preserve unrelated user changes to generated data indexes.
- Run targeted tests while developing, then `npm test`, `npm run typecheck`,
  and `npm run build` before handoff.
