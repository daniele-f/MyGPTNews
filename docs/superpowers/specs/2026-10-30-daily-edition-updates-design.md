# Daily Edition Updates Design

## Intent

Support schedules that run more than once per day without creating separate reader-facing archive editions. Readers see one consolidated briefing per Brussels calendar day and can immediately identify information added or revised after the day’s initial publication.

## Data and publishing

- There is one edition JSON file per Brussels calendar day, named with that day’s first publication timestamp.
- The first run creates the file. Later runs on the same Brussels day edit that same file only: add verified stories or update existing stories in place; never create a second edition file.
- The edition’s `updatedAt` records the most recent successful run.
- Later-added stories carry `changeType: "new"` and `updatedAt`.
- Revised existing stories carry `changeType: "updated"` and `updatedAt`; their stable IDs remain unchanged.
- Stories present in the first run omit `changeType`; they are the day’s baseline rather than a later update.
- A new Brussels day creates a fresh edition; it never changes a prior day’s edition except to correct a factual error.

## Reader experience

- Archive navigation groups all content for a day into one edition.
- The homepage’s story rail and the active centre story show a small `New` or `Updated` label when the selected story has `changeType`.
- The label remains visible for the rest of that daily edition, including its article detail page.

## Constraints

- Keep direct article URLs stable by preserving story IDs.
- Do not fabricate information or use tags merely because a later schedule ran; a tag requires an actual addition or meaningful factual revision.
- The scheduled publisher edits only the target day’s edition JSON file and runs the documented verification workflow where available.

## Approaches considered

1. Create timestamped editions and visually merge them. Rejected because it produces unnecessary archive entries and adds reader-facing complexity.
2. One daily edition edited by later schedule runs. Chosen because it matches the requested single daily briefing and makes update state explicit.
