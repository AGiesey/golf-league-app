## ADDED Requirements

### Requirement: WeekType enum
The system SHALL define a `WeekType` enum with three values: `Regular`, `FunWeek`, `MakeupDay`. The `Week` entity SHALL include a `Type` property of this enum type, stored as a string in the database with a default value of `Regular`.

#### Scenario: Week type defaults to Regular
- **WHEN** a `Week` record is created without an explicit `Type` value
- **THEN** the `Type` is stored as `Regular`

#### Scenario: All three type values are valid
- **WHEN** a `Week` record has `Type` set to `Regular`, `FunWeek`, or `MakeupDay`
- **THEN** the value is stored and returned correctly

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

### Requirement: Schedule tab empty state
When no weeks exist for the season, the `/commissioner/season?tab=schedule` tab body SHALL display a friendly empty state message directing the commissioner to contact their course admin.

#### Scenario: Empty state shown when no weeks
- **WHEN** `GET /commissioner/season/schedule` returns an empty array
- **THEN** the tab body displays a message indicating the schedule has not been set up and instructs the commissioner to contact the course admin

#### Scenario: No actions available in empty state
- **WHEN** the empty state is displayed
- **THEN** there are no create, edit, or delete controls visible

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
