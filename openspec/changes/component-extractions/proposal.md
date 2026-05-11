## Why

A review of all React files found six sections of inline JSX that have grown large enough, or are duplicated enough, to warrant extraction into named components. None of these are feature changes — behavior stays identical throughout. The goal is readability, reduced duplication, and making each file's responsibility easier to see at a glance.

## What Changes

- **`LeagueHeader`** extracted from `dashboard/page.tsx` — the same league-name card is rendered four times with slight variations; consolidating it removes ~40 lines of repeated markup.
- **`ScoreStatusBadge`** extracted and shared across `scores/page.tsx` and `scores/[weekId]/page.tsx` — both files contain identical `statusPill`, `nineLabel`, and `formatDate` helpers, plus identical inline Badge colour-override logic. Extraction removes the duplication entirely.
- **`MatchupFormDialog`** extracted from `MatchupsClient.tsx` — an 80-line inline modal currently built from a raw `<div>` overlay. Extraction also replaces the raw overlay with the `Dialog` primitive from `components/ui/`.
- **`TeamCard`** extracted from `TeamsTab.tsx` — a ~65-line per-team render block inside a `.map()`, including an inline rename form with its own sub-interactions.
- **`ScorecardPanel`** extracted from `ScorecardView.tsx` — a local `renderScorecard` function returning JSX. Local render functions are the canonical signal to promote something to a named component.
- **`MatchupListItem`** extracted from `MatchupsClient.tsx` — the per-matchup card (edit / delete / lock state) in the matchup list.

## Capabilities

### New Capabilities

- `league-header`: Shared card displaying league name, season year, and optional Commissioner badge. Extracted from `dashboard/page.tsx`.
- `score-status-badge`: `ScoreStatusBadge` component and shared `nineLabel` / `formatDate` utilities used by both scores list pages.
- `matchup-form-dialog`: Modal for creating and editing matchups, using the `Dialog` primitive. Extracted from `MatchupsClient.tsx`.
- `team-card`: Per-team card with inline rename and disband controls. Extracted from `TeamsTab.tsx`.
- `scorecard-panel`: Card wrapper around a `Scorecard` with optional section label and entry-button injection. Extracted from `ScorecardView.tsx`.
- `matchup-list-item`: Per-matchup row with edit, delete, and locked-state rendering. Extracted from `MatchupsClient.tsx`.

### Modified Capabilities

## Impact

- `web/app/(app)/dashboard/page.tsx` — replaces four inline Card blocks with `<LeagueHeader />`
- `web/app/(app)/commissioner/scores/page.tsx` — replaces duplicated helpers and inline Badge logic with `<ScoreStatusBadge />`
- `web/app/(app)/commissioner/scores/[weekId]/page.tsx` — same as above
- `web/app/(app)/commissioner/matchups/MatchupsClient.tsx` — extracts `MatchupFormDialog` and `MatchupListItem`; file shrinks by ~145 lines
- `web/app/(app)/commissioner/season/TeamsTab.tsx` — extracts `TeamCard`; file shrinks by ~65 lines
- `web/components/scorecard/ScorecardView.tsx` — `renderScorecard` becomes `ScorecardPanel`
- New files: `components/dashboard/LeagueHeader.tsx`, `components/scorecard/ScoreStatusBadge.tsx`, `components/scorecard/ScorecardPanel.tsx`, and three files collocated with their source (or alongside in the same directory)
- No API changes, no routing changes, no behavior changes
