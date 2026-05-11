## ADDED Requirements

### Requirement: GET /matchups/{matchupId}/scorecard endpoint
The API SHALL expose `GET /matchups/{matchupId}/scorecard` returning all data needed to render the scorecard for a matchup. Authorization: any authenticated user with a valid league context for this matchup's league. Returns 404 for unknown matchups and 403 for users outside the league.

#### Scenario: Member receives scorecard
- **WHEN** an authenticated league member calls `GET /matchups/{matchupId}/scorecard`
- **THEN** the API returns HTTP 200 with a scorecard payload

#### Scenario: Non-member rejected
- **WHEN** an authenticated user with no membership in the matchup's league calls the endpoint
- **THEN** the API returns HTTP 403

#### Scenario: Unknown matchup returns 404
- **WHEN** the matchupId does not correspond to a known matchup
- **THEN** the API returns HTTP 404

### Requirement: Scorecard payload shape
The scorecard response SHALL include: the matchup (id, week with number/startDate/nine, teamA, teamB); the holes for the week's nine in play order (id, number, par, handicapIndex); and the pairings with their slots.

#### Scenario: Holes filtered to week's nine
- **WHEN** `Week.Nine = Front`
- **THEN** the `holes` array contains exactly holes 1–9 in ascending order

#### Scenario: Holes for Back nine
- **WHEN** `Week.Nine = Back`
- **THEN** the `holes` array contains exactly holes 10–18 in ascending order

#### Scenario: Holes for Full week
- **WHEN** `Week.Nine = Full`
- **THEN** the `holes` array contains all 18 holes in ascending order

### Requirement: Slot states in scorecard payload
Each pairing slot in the scorecard SHALL carry the scheduled golfer's membership info (firstName, lastName, handicap) and a `round` field that is `null` when no scores have been entered or a round object when scores exist.

#### Scenario: Slot with no round — not started state
- **WHEN** no `Round` record exists for a pairing slot
- **THEN** the slot's `round` field is `null`

#### Scenario: Slot with round — scores present
- **WHEN** a `Round` record exists for a pairing slot
- **THEN** the slot's `round` includes `id`, `teeBox`, and `holeScores` (one per hole in the same order as the top-level `holes` array)

#### Scenario: Slot with sub
- **WHEN** a `Round` exists with a non-null `SubId`
- **THEN** the slot's `round` includes a `sub` object (firstName, lastName, handicap) and the slot's `membership` field still reflects the scheduled golfer

### Requirement: Scorecard UI — read-only display
The scorecard route (`/matchups/[matchupId]`) SHALL display the `Scorecard` component rendering one 9-hole table per nine played. Each table SHALL have a hole-number row, a par row, a handicap-index row, and one score row per round. Slots without rounds render as a row with the scheduled golfer's name and empty score cells.

#### Scenario: Regular nine renders one table
- **WHEN** `Week.Nine` is `Front` or `Back`
- **THEN** exactly one 9-column scorecard table is rendered

#### Scenario: Full week renders two stacked tables
- **WHEN** `Week.Nine` is `Full`
- **THEN** two scorecard tables are rendered — front nine above, back nine below

#### Scenario: Slot without round shows empty row
- **WHEN** a pairing slot has no associated round
- **THEN** a row appears with the golfer's name and blank score cells

#### Scenario: Slot with round shows scores
- **WHEN** a pairing slot has a round with hole scores
- **THEN** each score cell shows the gross strokes for that hole

#### Scenario: Sub name displayed
- **WHEN** a round was played by a sub
- **THEN** the sub's name is shown in the row label (not the scheduled golfer's name)
