## ADDED Requirements

### Requirement: GET /api/commissioner/seasons/{seasonId}/score-entry/weeks endpoint
The system SHALL expose `GET /api/commissioner/seasons/{seasonId}/score-entry/weeks` returning all weeks of the season in reverse chronological order (most recent first). Each entry SHALL include `weekId`, `weekNumber`, `startDate`, `type` (`Regular`/`FunWeek`/`MakeupDay`), `nine`, `matchupCount`, `slotCount`, and `roundCount`. Authorization: `ManageScores` capability (commissioner-only).

#### Scenario: Commissioner retrieves week list
- **WHEN** an authenticated commissioner calls the endpoint for their active season
- **THEN** the response is HTTP 200 with an array of week objects in reverse chronological order

#### Scenario: Aggregate counts are correct
- **WHEN** week W has 2 matchups, 4 pairings with 8 slots total, and 5 rounds entered
- **THEN** the week entry returns `matchupCount: 2`, `slotCount: 8`, `roundCount: 5`

#### Scenario: Week with no matchups
- **WHEN** a week has no matchups scheduled
- **THEN** the week entry returns `matchupCount: 0`, `slotCount: 0`, `roundCount: 0`

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls the endpoint
- **THEN** the response is HTTP 403

### Requirement: GET /api/commissioner/weeks/{weekId}/score-entry endpoint
The system SHALL expose `GET /api/commissioner/weeks/{weekId}/score-entry` returning all matchups for the specified week with per-matchup score-entry counts. Each matchup entry SHALL include `matchupId`, `teamA`, `teamB`, `pairings` (with tee time and slot golfer names), `slotCount`, and `roundCount`. Authorization: `ManageScores` capability.

#### Scenario: Commissioner retrieves week detail
- **WHEN** an authenticated commissioner calls the endpoint for a week in their season
- **THEN** the response is HTTP 200 with matchup-level detail including slot and round counts

#### Scenario: Week with no matchups returns empty array
- **WHEN** the week exists but has no matchups
- **THEN** the response is HTTP 200 with `{ matchups: [] }`

#### Scenario: Week in different season rejected
- **WHEN** the weekId belongs to a season the caller is not a member of
- **THEN** the response is HTTP 403

#### Scenario: Non-existent weekId returns 404
- **WHEN** the weekId does not exist
- **THEN** the response is HTTP 404

### Requirement: Commissioner score-entry week list page
The system SHALL expose `/commissioner/scores` as a server-rendered page showing all weeks in the active season with score-entry status. Access restricted to commissioners; non-commissioners are redirected to `/dashboard`.

#### Scenario: Commissioner views week list
- **WHEN** an authenticated commissioner navigates to `/commissioner/scores`
- **THEN** the page renders a list of weeks in reverse chronological order, each showing week number, date, type badge, nine badge, and a status pill (Not started / Partial / Complete / No matchups)

#### Scenario: Status pill — Not started
- **WHEN** a week has `slotCount > 0` and `roundCount === 0`
- **THEN** the status pill reads "Not started"

#### Scenario: Status pill — Partial
- **WHEN** a week has `0 < roundCount < slotCount`
- **THEN** the status pill reads "Partial"

#### Scenario: Status pill — Complete
- **WHEN** a week has `slotCount > 0` and `roundCount === slotCount`
- **THEN** the status pill reads "Complete"

#### Scenario: Status pill — No matchups
- **WHEN** a week has `slotCount === 0`
- **THEN** the status pill reads "No matchups"

#### Scenario: Each week row links to week detail
- **WHEN** the commissioner clicks a week row
- **THEN** they are navigated to `/commissioner/scores/[weekId]`

#### Scenario: Non-commissioner redirected
- **WHEN** a non-commissioner navigates to `/commissioner/scores`
- **THEN** they are redirected to `/dashboard`

### Requirement: Commissioner score-entry week detail page
The system SHALL expose `/commissioner/scores/[weekId]` showing all matchups for the week with score-entry status and golfer names. Each matchup row SHALL link to `/matchups/[matchupId]`.

#### Scenario: Commissioner views week detail
- **WHEN** an authenticated commissioner navigates to `/commissioner/scores/[weekId]`
- **THEN** the page shows the week header (number, date, type, nine) and a list of matchups with team names, golfer names per pairing, and a status pill

#### Scenario: Matchup row links to scorecard
- **WHEN** the commissioner clicks a matchup row
- **THEN** they navigate to `/matchups/[matchupId]?from=[weekId]`

#### Scenario: Empty week shows empty state
- **WHEN** the week has no matchups
- **THEN** the page shows an empty state message

#### Scenario: Non-commissioner redirected
- **WHEN** a non-commissioner navigates to `/commissioner/scores/[weekId]`
- **THEN** they are redirected to `/dashboard`

### Requirement: Scorecard back-link when arriving from week detail
The system SHALL render a "← Week N" back link in the scorecard header when the `from` query param contains a valid weekId (i.e., the golfer arrived from `/commissioner/scores/[weekId]`).

#### Scenario: Back link shown when from param present
- **WHEN** the scorecard route is loaded with `?from=[weekId]`
- **THEN** a back link to `/commissioner/scores/[weekId]` is visible in the page header

#### Scenario: No back link when from param absent
- **WHEN** the scorecard route is loaded without a `from` query param
- **THEN** no back link is rendered
