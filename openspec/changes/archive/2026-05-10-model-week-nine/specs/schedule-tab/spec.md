## MODIFIED Requirements

### Requirement: GET /commissioner/season/schedule endpoint
The API SHALL expose `GET /commissioner/season/schedule` within the `/commissioner` route group. It SHALL return all `Week` records for the caller's active season, ordered by `week_number` ascending. The endpoint SHALL require the caller to be a commissioner.

#### Scenario: Commissioner receives schedule
- **WHEN** a commissioner calls `GET /commissioner/season/schedule`
- **THEN** the API returns HTTP 200 with an array of week objects each containing `id`, `weekNumber`, `startDate`, `type`, and `nine`, ordered by `weekNumber` ascending

#### Scenario: Empty array when no weeks exist
- **WHEN** no `Week` records exist for the active season
- **THEN** the API returns HTTP 200 with an empty array

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls `GET /commissioner/season/schedule`
- **THEN** the API returns HTTP 403

#### Scenario: Unauthenticated rejected
- **WHEN** an unauthenticated request hits `GET /commissioner/season/schedule`
- **THEN** the API returns HTTP 401

### Requirement: Schedule tab week table
When weeks exist for the season, the `/commissioner/season?tab=schedule` tab body SHALL display a read-only table of all weeks sorted by week number.

#### Scenario: Table renders all weeks
- **WHEN** `GET /commissioner/season/schedule` returns one or more weeks
- **THEN** the tab body renders a table row for each week

#### Scenario: Table columns
- **WHEN** the schedule table is displayed
- **THEN** each row shows the week number, start date (formatted for display), type, and which nine is played (Front / Back / Full)

#### Scenario: Table is read-only
- **WHEN** a commissioner views the schedule table
- **THEN** there are no edit or delete controls on any row
