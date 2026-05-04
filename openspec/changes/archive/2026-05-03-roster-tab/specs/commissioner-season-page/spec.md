## MODIFIED Requirements

### Requirement: Tabbed layout with completion indicators
The page SHALL render three tabs — Roster, Teams, Schedule — in that order. Each tab label SHALL display a checkmark indicator when the corresponding requirement `isMet` is `true`, and a warning indicator when `isMet` is `false`. The Roster tab body SHALL render the live roster table (see `roster-tab` capability). Teams and Schedule tab bodies remain empty placeholders until their respective implementation proposals are applied.

#### Scenario: Met tab shows checkmark
- **WHEN** a requirement's `isMet` is `true`
- **THEN** the corresponding tab label displays a checkmark indicator

#### Scenario: Unmet tab shows warning
- **WHEN** a requirement's `isMet` is `false`
- **THEN** the corresponding tab label displays a warning indicator

#### Scenario: Roster tab body shows roster table
- **WHEN** a commissioner selects the Roster tab
- **THEN** the tab body renders the live roster table with member data fetched from `GET /commissioner/season/roster`

#### Scenario: Teams and Schedule tab bodies are placeholders
- **WHEN** a commissioner selects the Teams or Schedule tab
- **THEN** the tab body renders a placeholder indicating the feature is not yet available
