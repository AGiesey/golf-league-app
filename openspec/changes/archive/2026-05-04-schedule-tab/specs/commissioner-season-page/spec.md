## MODIFIED Requirements

### Requirement: Tabbed layout with completion indicators
The page SHALL render three tabs — Roster, Teams, Schedule — in that order. Each tab label SHALL display a checkmark indicator when the corresponding requirement `isMet` is `true`, and a warning indicator when `isMet` is `false`. The Roster tab body SHALL render the live roster table (see `roster-tab` capability). The Teams tab body SHALL render the live teams management UI (see `teams-tab` capability). The Schedule tab body SHALL render the live schedule view (see `schedule-tab` capability).

#### Scenario: Met tab shows checkmark
- **WHEN** a requirement's `isMet` is `true`
- **THEN** the corresponding tab label displays a checkmark indicator

#### Scenario: Unmet tab shows warning
- **WHEN** a requirement's `isMet` is `false`
- **THEN** the corresponding tab label displays a warning indicator

#### Scenario: Roster tab body shows roster table
- **WHEN** a commissioner selects the Roster tab
- **THEN** the tab body renders the live roster table with member data fetched from `GET /commissioner/season/roster`

#### Scenario: Teams tab body shows teams management UI
- **WHEN** a commissioner selects the Teams tab
- **THEN** the tab body renders the live teams management UI with data fetched from `GET /commissioner/season/teams`

#### Scenario: Schedule tab body shows schedule view
- **WHEN** a commissioner selects the Schedule tab
- **THEN** the tab body renders the live schedule view with data fetched from `GET /commissioner/season/schedule`
