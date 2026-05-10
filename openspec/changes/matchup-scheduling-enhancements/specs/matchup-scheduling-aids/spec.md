## ADDED Requirements

### Requirement: GET /commissioner/season/matchups/unscheduled-teams endpoint
The API SHALL expose `GET /commissioner/season/matchups/unscheduled-teams?weekId=<id>` within the `/commissioner` route group. It SHALL return all active (non-archived) teams in the active season that do not appear as TeamA or TeamB in any matchup for the given week. The week SHALL belong to the commissioner's active season.

#### Scenario: Returns teams not in any matchup for the week
- **WHEN** a commissioner calls the endpoint for a week where some teams are already scheduled
- **THEN** the API returns HTTP 200 with only the teams not appearing in any matchup for that week

#### Scenario: Returns empty array when all teams are scheduled
- **WHEN** every active team in the season appears in a matchup for the given week
- **THEN** the API returns HTTP 200 with an empty array

#### Scenario: Returns all teams when no matchups exist
- **WHEN** no matchups exist for the given week
- **THEN** the API returns HTTP 200 with all active teams in the season

#### Scenario: Week not in active season returns 404
- **WHEN** the `weekId` does not belong to the commissioner's active season
- **THEN** the API returns HTTP 404

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls the endpoint
- **THEN** the API returns HTTP 403

### Requirement: GET /commissioner/season/pairing-history endpoint
The API SHALL expose `GET /commissioner/season/pairing-history` within the `/commissioner` route group. It SHALL return, for every pair of teams that has played at least once in a prior regular week of the active season, the count of times they have played. Pair identity SHALL be canonicalized using `LEAST`/`GREATEST` on team IDs so that (A, B) and (B, A) are counted as the same pair.

#### Scenario: Returns play counts for all pairs that have played
- **WHEN** teams A and B have played twice in prior regular weeks of the active season
- **THEN** the response includes an entry for that pair with `count: 2`

#### Scenario: Current week's matchups are excluded
- **WHEN** two teams are only matched in the current (caller-specified) week and not in any prior week
- **THEN** that pair does not appear in the response

#### Scenario: Empty response when no prior matchups exist
- **WHEN** no matchups have been scheduled in any prior regular week
- **THEN** the API returns HTTP 200 with an empty array

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls the endpoint
- **THEN** the API returns HTTP 403

### Requirement: Unscheduled-teams list on the week-detail view
The commissioner matchup page SHALL display, for the selected regular week, a list of teams not yet in a matchup that week. Each team SHALL be rendered as a clickable chip. Clicking a chip SHALL open the create-matchup dialog with that team pre-selected as Team A.

#### Scenario: Chips shown for unscheduled teams
- **WHEN** some teams are not in any matchup for the selected week
- **THEN** the unscheduled-teams section shows one chip per unscheduled team

#### Scenario: Empty state when all teams are scheduled
- **WHEN** every team appears in a matchup for the selected week
- **THEN** the unscheduled-teams section shows a "All teams scheduled" message instead of chips

#### Scenario: Chip click pre-selects team in create dialog
- **WHEN** the commissioner clicks an unscheduled-team chip
- **THEN** the create-matchup dialog opens with that team pre-populated in the Team A field

#### Scenario: Unscheduled list not shown for non-Regular weeks
- **WHEN** the selected week has a type other than Regular
- **THEN** the unscheduled-teams section is not displayed

### Requirement: Pairing history matrix on the week-detail view
The commissioner matchup page SHALL display a collapsible pairing history matrix for the active season. The matrix SHALL be a grid with all season teams on both axes. Each cell SHALL show the number of times that pair has played in prior regular weeks; zero-count cells SHALL display a dash or be blank. Diagonal cells SHALL be blank. The matrix SHALL default to collapsed.

#### Scenario: Matrix shows correct play counts
- **WHEN** teams A and B have played twice in prior regular weeks
- **THEN** the cell at row A / column B (and B / A) shows 2

#### Scenario: Diagonal cells are blank
- **WHEN** the matrix is rendered
- **THEN** the cell where row team equals column team is blank

#### Scenario: Zero-play cells show dash
- **WHEN** two teams have never played
- **THEN** their cell shows "—" or is visually empty

#### Scenario: Matrix defaults to collapsed
- **WHEN** the matchup page loads
- **THEN** the history matrix is collapsed and not visible until the commissioner expands it

#### Scenario: Matrix can be toggled open and closed
- **WHEN** the commissioner clicks the matrix header
- **THEN** the matrix expands or collapses

### Requirement: Inline duplicate-pair warning in the create/edit matchup dialog
When both Team A and Team B are selected in the create or edit matchup dialog, and that pair has already played in a prior regular week of the active season, the dialog SHALL display a non-blocking inline notice identifying the prior week number. The commissioner SHALL still be able to submit the form.

#### Scenario: Warning shown when pair has prior history
- **WHEN** Team A and Team B are both selected and they have played in week 3 of the current season
- **THEN** the dialog shows a notice such as "Already played — Week 3"

#### Scenario: No warning when pair has no prior history
- **WHEN** Team A and Team B are both selected and they have never played in the current season
- **THEN** no warning is shown

#### Scenario: Warning is non-blocking
- **WHEN** the duplicate-pair warning is shown
- **THEN** the Submit button remains enabled and the commissioner can create or save the matchup

#### Scenario: Warning clears when a team is changed
- **WHEN** the commissioner changes Team A or Team B to a different selection after a warning appeared
- **THEN** the warning updates or disappears based on the new pair's history
