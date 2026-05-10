## ADDED Requirements

### Requirement: Upcoming Matchup widget on golfer dashboard
The system SHALL render an "Upcoming Matchup" widget on the golfer dashboard when setup is complete, using data from `GET /api/me/upcoming-matchups`. The widget SHALL handle one-matchup, multiple-matchup, and empty states.

#### Scenario: One upcoming matchup — card shown and linked
- **WHEN** `GET /api/me/upcoming-matchups` returns exactly one matchup
- **THEN** the widget renders a single card showing week label, date, nine, tee time, "vs [opponent team]", and the card is a link to `/matchups/[matchupId]`

#### Scenario: Multiple upcoming matchups — stacked cards
- **WHEN** `GET /api/me/upcoming-matchups` returns more than one matchup
- **THEN** the widget renders one card per matchup, each linked to its own scorecard

#### Scenario: No upcoming matchups — empty state shown
- **WHEN** `GET /api/me/upcoming-matchups` returns an empty list
- **THEN** the widget renders an empty state with the reason string (e.g., "No matchups scheduled" or "Season ended")

### Requirement: My Matchups widget cards link to scorecards
The existing My Matchups widget's "Upcoming" and "Last Match" sections SHALL be clickable links to the respective scorecard route.

#### Scenario: Upcoming matchup card is a link
- **WHEN** `GET /season/my-matchup-summary` returns a non-null `upcoming` with a `matchupId`
- **THEN** the upcoming section is wrapped in a link to `/matchups/[matchupId]`

#### Scenario: Previous matchup card is a link
- **WHEN** `GET /season/my-matchup-summary` returns a non-null `previous` with a `matchupId`
- **THEN** the previous section is wrapped in a link to `/matchups/[matchupId]`

#### Scenario: Null matchup — no link rendered
- **WHEN** `upcoming` or `previous` is null
- **THEN** no link is rendered for that section (empty state as before)
