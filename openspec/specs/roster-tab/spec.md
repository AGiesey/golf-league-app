## ADDED Requirements

### Requirement: GET /commissioner/season/roster endpoint
The API SHALL expose `GET /commissioner/season/roster` within the `/commissioner` route group. It SHALL return all active (non-archived) `LeagueMembership` records for the caller's active season, each including membership and golfer details. The endpoint SHALL require the caller to be a commissioner.

#### Scenario: Commissioner receives roster
- **WHEN** a commissioner calls `GET /commissioner/season/roster`
- **THEN** the API returns HTTP 200 with an array of membership objects, each containing `leagueMembershipId`, `golferId`, `firstName`, `lastName`, `email`, `handicap` (nullable decimal), and `isCommissioner`

#### Scenario: Response includes only active memberships
- **WHEN** a season has both active and archived `LeagueMembership` records
- **THEN** only records where `ArchivedAt` is null are returned

#### Scenario: Results sorted alphabetically by last name
- **WHEN** the roster contains multiple members
- **THEN** the response array is ordered by `lastName` ascending, then `firstName` ascending

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls `GET /commissioner/season/roster`
- **THEN** the API returns HTTP 403

#### Scenario: Unauthenticated rejected
- **WHEN** an unauthenticated request hits `GET /commissioner/season/roster`
- **THEN** the API returns HTTP 401

### Requirement: PATCH /commissioner/season/roster/{leagueMembershipId}/handicap endpoint
The API SHALL expose `PATCH /commissioner/season/roster/{leagueMembershipId}/handicap` within the `/commissioner` route group. It SHALL accept a nullable decimal value and update `LeagueMembership.Handicap` for the specified member. The endpoint SHALL require the caller to be a commissioner, and the target membership SHALL belong to the same season as the commissioner's active membership.

#### Scenario: Commissioner updates handicap
- **WHEN** a commissioner sends `{ "handicap": 12.5 }` to `PATCH /commissioner/season/roster/{id}/handicap`
- **THEN** the API updates `LeagueMembership.Handicap` to the provided value and returns HTTP 200 with the updated membership object

#### Scenario: Commissioner clears handicap
- **WHEN** a commissioner sends `{ "handicap": null }` to `PATCH /commissioner/season/roster/{id}/handicap`
- **THEN** the API sets `LeagueMembership.Handicap` to null and returns HTTP 200

#### Scenario: Target membership not in commissioner's season
- **WHEN** the `leagueMembershipId` path parameter refers to a membership in a different season
- **THEN** the API returns HTTP 403

#### Scenario: Target membership not found or archived
- **WHEN** the `leagueMembershipId` path parameter refers to a non-existent or archived membership
- **THEN** the API returns HTTP 404

#### Scenario: Non-commissioner rejected
- **WHEN** an authenticated non-commissioner calls the PATCH endpoint
- **THEN** the API returns HTTP 403

### Requirement: Roster table in tab=roster content
The `/commissioner/season?tab=roster` tab body SHALL render a table of all active members for the season. The table SHALL display first name, last name, email, handicap, and a commissioner indicator per row. Members SHALL be listed alphabetically by last name.

#### Scenario: Table renders all active members
- **WHEN** a commissioner views the Roster tab
- **THEN** a table row appears for every active member returned by `GET /commissioner/season/roster`

#### Scenario: Commissioner badge displayed
- **WHEN** a member's `isCommissioner` is `true`
- **THEN** a visual badge or indicator appears alongside that member's name in the table

#### Scenario: Members sorted by last name
- **WHEN** the roster contains multiple members
- **THEN** rows are displayed in ascending alphabetical order by last name

### Requirement: Inline handicap input for unset values
When a member's `handicap` is null, the Roster tab SHALL render an inline input field directly in the handicap cell. The commissioner SHALL be able to type a value and save it without leaving the page.

#### Scenario: Null handicap shows input
- **WHEN** a member's `handicap` is null
- **THEN** the handicap cell contains an input field ready for entry

#### Scenario: Saving a handicap via inline input
- **WHEN** the commissioner types a value in the input and commits (blur or Enter)
- **THEN** the client sends `PATCH /commissioner/season/roster/{id}/handicap`, and on success the cell switches to plain text showing the saved value

#### Scenario: PATCH failure reverts input
- **WHEN** the PATCH call returns an error
- **THEN** the input value is reverted to empty and a toast notification informs the commissioner of the failure

#### Scenario: Input shows loading state during save
- **WHEN** the PATCH request is in flight
- **THEN** the input is disabled and a loading indicator is visible in the cell

### Requirement: Plain text display for set handicap values
When a member's `handicap` is already set (non-null), the Roster tab SHALL display the value as plain text in the handicap cell. Inline editing of an existing handicap is explicitly deferred.

#### Scenario: Set handicap shows plain text
- **WHEN** a member's `handicap` is non-null
- **THEN** the handicap cell displays the value as plain text with no input field

#### Scenario: No inline edit for existing values
- **WHEN** a commissioner views a cell with a set handicap
- **THEN** there is no in-place edit affordance; the value is read-only in the current implementation
