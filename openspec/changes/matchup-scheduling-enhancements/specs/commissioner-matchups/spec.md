## ADDED Requirements

### Requirement: Commissioner matchup page — scheduling aids
The commissioner matchup page SHALL, for a selected Regular week, display an unscheduled-teams section and a collapsible pairing-history matrix alongside the existing matchup list. The create/edit dialog SHALL show a non-blocking inline warning when the selected pair has prior season history. These aids are read-only views over existing data; they do not gate or alter the create/edit/delete flows.

#### Scenario: Unscheduled-teams section appears for Regular weeks
- **WHEN** the commissioner selects a Regular week on the matchup page
- **THEN** the unscheduled-teams section is visible above or alongside the matchup list

#### Scenario: Scheduling aids hidden for non-Regular weeks
- **WHEN** the commissioner selects a non-Regular week
- **THEN** neither the unscheduled-teams section nor the pairing-history matrix is displayed

#### Scenario: History matrix is present on the page
- **WHEN** the commissioner is on the matchup page for any week
- **THEN** the collapsible pairing-history matrix is accessible (collapsed by default)
