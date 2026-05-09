## ADDED Requirements

### Requirement: Matchup entity and migration
The system SHALL introduce `Matchup`, `Pairing`, and `PairingSlot` tables via a migration. Each `Matchup` belongs to a `Week` and references two `Team` records (`TeamA`, `TeamB`). Each `Matchup` has exactly one `Pairing` child. Each `Pairing` has zero or more `PairingSlot` children, each referencing a `LeagueMembership`.

#### Scenario: Tables created by migration
- **WHEN** the migration runs
- **THEN** `matchups`, `pairings`, and `pairing_slots` tables exist in the database with the correct columns and foreign keys

### Requirement: GET /commissioner/season/matchups endpoint
The API SHALL expose `GET /commissioner/season/matchups?weekId=<id>` within the `/commissioner` route group. It SHALL return all matchups for the given week, provided the week belongs to the commissioner's active season. Each matchup response SHALL include the matchup ID, team names and member names for each team, and a boolean `isLocked`.

#### Scenario: Returns matchups for a valid week
- **WHEN** a commissioner calls `GET /commissioner/season/matchups?weekId=<id>` for a week in their active season
- **THEN** the API returns HTTP 200 with an array of matchup objects

#### Scenario: isLocked is false when no rounds exist
- **WHEN** no `Round` records reference any `PairingSlot` under the matchup's pairing
- **THEN** `isLocked` is `false`

#### Scenario: isLocked is true when rounds exist
- **WHEN** at least one `Round` record references a `PairingSlot` under the matchup's pairing
- **THEN** `isLocked` is `true`

#### Scenario: Week not in active season returns 404
- **WHEN** the `weekId` does not belong to the commissioner's active season
- **THEN** the API returns HTTP 404

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls the endpoint
- **THEN** the API returns HTTP 403

#### Scenario: Unauthenticated rejected
- **WHEN** an unauthenticated request hits the endpoint
- **THEN** the API returns HTTP 401

### Requirement: POST /commissioner/season/matchups endpoint
The API SHALL expose `POST /commissioner/season/matchups` within the `/commissioner` route group. It SHALL create a `Matchup`, one `Pairing`, and `PairingSlot` rows for every `TeamMembership` across both teams. The endpoint SHALL reject invalid inputs per the validation rules below.

#### Scenario: Successfully creates matchup with pairing slots
- **WHEN** a commissioner posts a valid `{ weekId, teamAId, teamBId }` body
- **THEN** the API returns HTTP 201 with the created matchup, one `Pairing` is created, and `PairingSlot` rows are inserted for each member of both teams

#### Scenario: Rejects non-Regular week
- **WHEN** the targeted week has `Type` other than `Regular`
- **THEN** the API returns HTTP 422 with `{ error: "week_not_regular" }`

#### Scenario: Rejects team already in a matchup that week
- **WHEN** either `teamAId` or `teamBId` already appears in another matchup for the same week
- **THEN** the API returns HTTP 409 with `{ error: "team_already_scheduled" }`

#### Scenario: Rejects team playing itself
- **WHEN** `teamAId == teamBId`
- **THEN** the API returns HTTP 422 with `{ error: "same_team" }`

#### Scenario: Rejects teams not in active season
- **WHEN** either team does not belong to the commissioner's active season
- **THEN** the API returns HTTP 422 with `{ error: "invalid_team" }`

#### Scenario: Rejects teams with no members
- **WHEN** either team has no active `TeamMembership` records
- **THEN** the API returns HTTP 422 with `{ error: "empty_team" }`

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls the endpoint
- **THEN** the API returns HTTP 403

### Requirement: PUT /commissioner/season/matchups/{matchupId} endpoint
The API SHALL expose `PUT /commissioner/season/matchups/{matchupId}` within the `/commissioner` route group. It SHALL allow swapping one or both teams. On a valid edit, existing `PairingSlot` rows SHALL be hard-deleted and regenerated from the new teams' current `TeamMembership` records. The `Pairing` row SHALL be updated in place. Editing a locked matchup SHALL be rejected.

#### Scenario: Successfully edits matchup and regenerates slots
- **WHEN** a commissioner puts a valid `{ teamAId, teamBId }` body for an unlocked matchup
- **THEN** the API returns HTTP 200, existing `PairingSlot` rows are deleted, and new slots are created from the updated teams' current memberships

#### Scenario: Rejects edit of locked matchup
- **WHEN** the matchup's `isLocked` is `true`
- **THEN** the API returns HTTP 409 with `{ error: "matchup_locked" }`

#### Scenario: Rejects matchup not in active season
- **WHEN** the `matchupId` does not belong to the commissioner's active season
- **THEN** the API returns HTTP 404

#### Scenario: Same team validations apply on edit
- **WHEN** the new `teamAId` or `teamBId` violates any creation-time validation (same team, not in season, no members, already scheduled that week in a different matchup)
- **THEN** the API returns the corresponding error response

### Requirement: DELETE /commissioner/season/matchups/{matchupId} endpoint
The API SHALL expose `DELETE /commissioner/season/matchups/{matchupId}` within the `/commissioner` route group. It SHALL hard-delete the `PairingSlot` rows, then the `Pairing` row, then the `Matchup` row. Deleting a locked matchup SHALL be rejected.

#### Scenario: Successfully deletes matchup and cascade
- **WHEN** a commissioner deletes an unlocked matchup
- **THEN** the API returns HTTP 204, and the `Matchup`, `Pairing`, and all `PairingSlot` rows are removed

#### Scenario: Rejects delete of locked matchup
- **WHEN** the matchup's `isLocked` is `true`
- **THEN** the API returns HTTP 409 with `{ error: "matchup_locked" }`

#### Scenario: Rejects matchup not in active season
- **WHEN** the `matchupId` does not belong to the commissioner's active season
- **THEN** the API returns HTTP 404

### Requirement: Commissioner matchup management UI
The system SHALL expose a page at `/commissioner/matchups` accessible only to authenticated users whose active league context has `isCommissioner: true`. The page SHALL allow the commissioner to select a week from the active season, view all matchups for that week, and create, edit, or delete matchups on unlocked weeks.

#### Scenario: Commissioner can access the matchup page
- **WHEN** an authenticated commissioner navigates to `/commissioner/matchups`
- **THEN** the page renders with a week selector showing Regular weeks for the active season

#### Scenario: Non-commissioner redirected
- **WHEN** a non-commissioner navigates to `/commissioner/matchups`
- **THEN** they are redirected to `/dashboard`

#### Scenario: Unauthenticated redirected
- **WHEN** an unauthenticated user navigates to `/commissioner/matchups`
- **THEN** they are redirected to `/login`

#### Scenario: Week selector controls active week
- **WHEN** the commissioner selects a week from the selector
- **THEN** the matchup list updates to show matchups for that week

#### Scenario: Empty state shown when no matchups exist
- **WHEN** no matchups exist for the selected week
- **THEN** the page displays an empty state with a control to create the first matchup

#### Scenario: Matchup list shows team names and members
- **WHEN** matchups exist for the selected week
- **THEN** each row shows Team A vs Team B with the member names for each team

#### Scenario: Create matchup — team picker
- **WHEN** the commissioner initiates a new matchup
- **THEN** a form allows selecting two different teams from the season's active teams that are not yet scheduled for that week

#### Scenario: Edit matchup — swap teams
- **WHEN** the commissioner edits an unlocked matchup
- **THEN** the form pre-fills with the current teams and allows swapping one or both

#### Scenario: Delete matchup — unlocked
- **WHEN** the commissioner deletes an unlocked matchup
- **THEN** the matchup is removed from the list

#### Scenario: Locked matchup — no edit or delete controls
- **WHEN** a matchup is locked (`isLocked: true`)
- **THEN** no edit or delete controls are shown for that matchup

#### Scenario: Week URL deep-linking
- **WHEN** the URL is `/commissioner/matchups?weekId=<id>`
- **THEN** the week selector defaults to that week and its matchups are loaded
