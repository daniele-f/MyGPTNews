# Story Stage Navigation Design

## Intent

Refine the editorial homepage so the story stage and story rail behave as one
clear in-day navigator. Readers can select a rail story or use stage chevrons;
the content transition and active rail state explain which direction the
selection moved.

## Goals

- Add a durable UI vocabulary document defining the named components from the
  annotated screenshots, including the publication timestamp.
- Render the publication timestamp as `Updated <date and time>` using
  `updatedAt` when present; otherwise retain `Published <date and time>` using
  `publishedAt`.
- Align rail headline text with the top of its thumbnail, and a bottom row
  containing categories left and a `New` or `Updated` status pill right when
  `changeType` is present.
- Keep rail chevrons visually hidden until hover or keyboard focus, then
  reveal and shift them left to signal activation.
- Shift the selected rail item left, rather than right, and animate the rail
  state and stage content in the direction of story navigation.
- Add previous/next story buttons to the stage’s top-right. They select the
  adjacent rail story and disable at the first/last story.
- Retain keyboard operation and reduced-motion behavior.

## Non-goals

- Changing article permalink URLs or selected-story state in the browser URL.
- Changing edition data, generated indexes, date navigation, or search.
- Adding a new dependency.

## Approaches considered

1. CSS-only refinements. Insufficient because stage buttons, state, disabled
   boundaries, and direction-aware motion require shared behavior.
2. A shared story navigator. Chosen: one activation function receives a story
   index and direction, updates the stage, rail selection, stage buttons, and
   transition classes. It keeps click, button, and keyboard behavior coherent.
3. Update the browser URL on every story selection. Rejected because it makes
   routine in-day browsing noisy without improving the established permanent
   article links.

## Implementation decisions

- Add `docs/ui-vocabulary.md` as the source of truth for A–L names from the
  annotation and their page role.
- Rail markup exposes a `data-story-index`, dedicated headline/body wrappers,
  status pills for `new` and `updated`, and no pill when absent.
- Stage markup contains a labelled story-navigation group. Previous means the
  immediately earlier rail item and next means the immediately later rail
  item; unavailable directions use disabled buttons.
- The browser entry owns the selected index and calls one activation function
  for rail clicks and stage-chevron clicks. It applies an incoming direction
  class before rendering, then updates accessible pressed/disabled state.
- CSS uses transform/opacity transitions for stage and rail state; the
  reduced-motion media query suppresses them.

## Constraints

- Preserve the existing static Vite architecture and permanent article links.
- Do not alter edition JSON or generated data indexes.
- Cover the markup and timestamp rules with focused tests before implementation,
  then run the full test suite, typecheck, and production build.
