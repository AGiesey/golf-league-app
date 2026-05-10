## Why

The scorecard route (`/matchups/[matchupId]`) built in `add-scorecard` has no entry points — nothing links to it. Golfers can't find their upcoming matchups, and commissioners have no hub for working through score entry for an entire week.

## What Changes

- **New endpoint** `GET /api/me/upcoming-matchups` — returns the golfer's matchups in the next upcoming week, with score-entry status per slot.
- **New endpoint** `GET /api/commissioner/seasons/{seasonId}/score-entry/weeks` — returns all weeks in the season (reverse-chrono) with aggregate round counts for progress tracking.
- **New endpoint** `GET /api/commissioner/weeks/{weekId}/score-entry` — returns one week's matchups with per-matchup slot and round counts.
- **New dashboard widget** "Upcoming Matchup" on the golfer dashboard — one/multiple/empty states, cards link to the scorecard.
- **New commissioner pages** `/commissioner/scores` (week list) and `/commissioner/scores/[weekId]` (week detail), each row linking to the scorecard.
- **New sidebar nav item** "Manage Scores" visible only to commissioners, linking to `/commissioner/scores`.
- **Scorecard back-link** — when arriving from the week detail page via `?from=week`, the scorecard header shows a "Back to week" link.
- **`/design` examples** for the new widgets in all relevant states.

## Capabilities

### New Capabilities

- `upcoming-matchups`: Golfer-facing read of their own next upcoming matchup(s) in the active season.
- `score-entry-hub`: Commissioner-facing navigation hub: week list and week detail pages with score-entry progress indicators.

### Modified Capabilities

- `dashboard`: New "Upcoming Matchup" widget added to the golfer dashboard.
- `sidebar-nav`: New "Manage Scores" commissioner nav item.

## Impact

- **API**: Three new read-only endpoints in `api/Program.cs`. No schema changes.
- **Frontend**: New pages under `web/app/(app)/commissioner/scores/`, new dashboard widget component, sidebar nav update, scorecard header update.
- **Authorization**: Existing `ManageScores` capability gates the two commissioner endpoints. No new capabilities.
