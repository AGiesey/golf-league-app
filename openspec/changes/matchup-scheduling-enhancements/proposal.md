## Why

Commissioners scheduling matchups must mentally track which teams are unmatched this week and which pairs have already played — information the system already has but doesn't surface. Exposing this removes the memory burden and makes gaps in the schedule visually obvious.

## What Changes

- **Unscheduled-teams list** on the week-detail view: every team in the season not yet in a matchup this week, shown as clickable chips. Clicking a chip opens the create-matchup dialog with that team pre-selected. Empty list signals the week is fully scheduled.
- **Matchup history matrix**, collapsible, on the week-detail view: a grid of all teams vs. all teams showing how many times each pair has played in prior regular weeks of this season (current week excluded). Diagonal cells are blanked. Read-only, no color coding.
- **Inline duplicate-pair warning** in the create/edit matchup dialog: after both Team A and Team B are selected, if they have already played in a prior regular week, a non-blocking notice appears (e.g., "Already played — Week 3").
- New API endpoints to support the above: one for unscheduled teams per week, one for the season-wide pairing history matrix.

## Capabilities

### New Capabilities
- `matchup-scheduling-aids`: Unscheduled-teams list, history matrix, and inline duplicate-pair warning within the commissioner matchup management UI.

### Modified Capabilities
- `commissioner-matchups`: The matchup week-detail view gains two new sections (unscheduled-teams list and history matrix) and the create/edit dialog gains an inline warning. Core create/edit/delete flows are unchanged.

## Impact

- **API**: Two new commissioner endpoints — `GET /commissioner/season/matchups/unscheduled-teams?weekId=<id>` and `GET /commissioner/season/matchups/pairing-history`.
- **Web**: `MatchupsClient.tsx` updated to render the unscheduled-teams list and matrix alongside the existing matchup list; the create/edit form extended with the inline warning.
- **No migration**: Matrix is computed with `COUNT(*)` grouped on `(LEAST(team_a_id, team_b_id), GREATEST(team_a_id, team_b_id))` at query time.
