## ADDED Requirements

### Requirement: GET /commissioner/season/teams endpoint
The API SHALL expose `GET /commissioner/season/teams` within the `/commissioner` route group. It SHALL return all active `Team` records for the season with their two members, all unassigned active members, and an `isLocked` flag indicating whether team editing is permitted.

#### Scenario: Commissioner receives teams and unassigned members
- **WHEN** a commissioner calls `GET /commissioner/season/teams`
- **THEN** the API returns HTTP 200 with `{ isLocked, teams, unassigned }` where `teams` is an array of team objects each containing `teamId`, `name`, and `members` (array of two member objects), and `unassigned` is an array of member objects not yet on a team

#### Scenario: isLocked is true when any week has started
- **WHEN** at least one `Week` record for the season has a `StartDate` on or before today
- **THEN** `isLocked` is `true` in the response

#### Scenario: isLocked is false when no weeks have started
- **WHEN** no `Week` records exist for the season, or all weeks have a `StartDate` in the future
- **THEN** `isLocked` is `false` in the response

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls `GET /commissioner/season/teams`
- **THEN** the API returns HTTP 403

#### Scenario: Unauthenticated rejected
- **WHEN** an unauthenticated request hits `GET /commissioner/season/teams`
- **THEN** the API returns HTTP 401

### Requirement: POST /commissioner/season/teams endpoint
The API SHALL expose `POST /commissioner/season/teams` within the `/commissioner` route group. It SHALL accept exactly two `leagueMembershipId` values, create a new `Team` with an auto-generated sequential name, assign both members via `TeamMembership` records, and return the created team. The endpoint SHALL be blocked when teams are locked.

#### Scenario: Commissioner creates a team
- **WHEN** a commissioner sends `{ "memberIds": ["uuid1", "uuid2"] }` to `POST /commissioner/season/teams`
- **THEN** the API creates a `Team` named "Team N" (where N is the current team count + 1), creates two `TeamMembership` records, and returns HTTP 201 with the created team object

#### Scenario: Request rejected when memberIds count is not exactly 2
- **WHEN** the request body contains fewer or more than 2 `memberIds`
- **THEN** the API returns HTTP 400

#### Scenario: Request rejected when a member is already on a team
- **WHEN** one or both `leagueMembershipId` values belong to a member already assigned to a team
- **THEN** the API returns HTTP 409

#### Scenario: Request rejected when teams are locked
- **WHEN** the season is locked (any week has `StartDate` on or before today) and a POST is attempted
- **THEN** the API returns HTTP 409

#### Scenario: Request rejected when a membershipId does not belong to the season
- **WHEN** a supplied `leagueMembershipId` belongs to a different season than the commissioner's active season
- **THEN** the API returns HTTP 400

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls `POST /commissioner/season/teams`
- **THEN** the API returns HTTP 403

### Requirement: DELETE /commissioner/season/teams/{teamId} endpoint
The API SHALL expose `DELETE /commissioner/season/teams/{teamId}` within the `/commissioner` route group. It SHALL delete the team and its associated `TeamMembership` records, returning both members to the unassigned pool. The endpoint SHALL be blocked when teams are locked.

#### Scenario: Commissioner disbands a team
- **WHEN** a commissioner sends `DELETE /commissioner/season/teams/{teamId}` for a team in their active season
- **THEN** the API deletes the `Team` and both `TeamMembership` records and returns HTTP 204

#### Scenario: Request rejected when teams are locked
- **WHEN** the season is locked and a DELETE is attempted
- **THEN** the API returns HTTP 409

#### Scenario: Team not found
- **WHEN** the `teamId` does not exist or belongs to a different season
- **THEN** the API returns HTTP 404

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls `DELETE /commissioner/season/teams/{teamId}`
- **THEN** the API returns HTTP 403

### Requirement: Teams tab unassigned pool and formed teams list
The `/commissioner/season?tab=teams` tab body SHALL render two zones: an unassigned member pool showing all members not yet on a team, and a formed teams list showing all current teams with their members.

#### Scenario: Unassigned members are shown in the pool
- **WHEN** one or more members have no team assignment
- **THEN** each unassigned member appears in the unassigned pool zone

#### Scenario: Formed teams are shown in the teams list
- **WHEN** one or more teams have been created
- **THEN** each team appears with its name and both member names

#### Scenario: Pool is empty when all members are assigned
- **WHEN** every active member is on a team
- **THEN** the unassigned pool zone displays a message indicating all members are assigned

### Requirement: Pair-picker to create a team
When teams are not locked, the Teams tab SHALL provide a pair-picker that allows the commissioner to select exactly two unassigned members and create a team.

#### Scenario: Create Team button enabled only when exactly 2 members are selected
- **WHEN** the commissioner has checked exactly 2 members in the unassigned pool
- **THEN** the "Create Team" button is enabled

#### Scenario: Create Team button disabled when fewer or more than 2 are selected
- **WHEN** the commissioner has checked 0, 1, or 3+ members
- **THEN** the "Create Team" button is disabled

#### Scenario: Successful team creation updates UI
- **WHEN** the commissioner clicks "Create Team" with exactly 2 members selected
- **THEN** the client sends `POST /commissioner/season/teams`, and on success the two members move from the unassigned pool to a new team entry in the formed teams list

#### Scenario: POST failure shows toast
- **WHEN** the POST call returns an error
- **THEN** a toast notification informs the commissioner of the failure and selections are preserved

### Requirement: Disband button on formed teams
When teams are not locked, each formed team SHALL display a Disband button that removes the team and returns both members to the unassigned pool.

#### Scenario: Disband returns members to unassigned pool
- **WHEN** the commissioner clicks Disband on a team
- **THEN** the client sends `DELETE /commissioner/season/teams/{teamId}`, and on success the team is removed and both members reappear in the unassigned pool

#### Scenario: DELETE failure shows toast
- **WHEN** the DELETE call returns an error
- **THEN** a toast notification informs the commissioner of the failure and the team remains in the list

### Requirement: Read-only state when teams are locked
When `isLocked` is `true` in the GET response, the Teams tab SHALL render in a fully read-only state with no pair-picker or Disband buttons.

#### Scenario: Tab is read-only when locked
- **WHEN** `isLocked` is `true`
- **THEN** the pair-picker is not rendered, Disband buttons are not rendered, and a message explains that teams are locked because the season has started

#### Scenario: Tab is interactive when not locked
- **WHEN** `isLocked` is `false`
- **THEN** the pair-picker and Disband buttons are rendered and functional
