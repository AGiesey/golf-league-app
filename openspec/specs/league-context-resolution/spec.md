## ADDED Requirements

### Requirement: LeagueContext type
The system SHALL define a `LeagueContext` record containing: `golferId`, `leagueMembershipId`, `seasonId`, `leagueId`, `courseId`, and `isCommissioner`.

#### Scenario: LeagueContext carries all required fields
- **WHEN** a LeagueContext is constructed from a resolved membership
- **THEN** it contains golferId, leagueMembershipId, seasonId, leagueId, courseId, and isCommissioner

### Requirement: Active season resolution
The system SHALL determine the candidate season for a golfer's memberships using this rule: prefer the season whose `start_date ≤ today ≤ end_date` and `archived_at IS NULL`; if none exists, use the non-archived season with the latest `end_date` that is before today.

#### Scenario: Currently active season selected
- **WHEN** a golfer has a membership in a season whose date range contains today
- **THEN** that season's membership is returned as a candidate

#### Scenario: Most recently ended season used as fallback
- **WHEN** a golfer has no membership in a currently active season but has memberships in past seasons
- **THEN** the membership in the most recently ended non-archived season is returned as a candidate

#### Scenario: Archived seasons excluded
- **WHEN** a season has archived_at set
- **THEN** it is never returned as a candidate regardless of dates

### Requirement: GET /api/context endpoint
The system SHALL expose `GET /api/context` (authenticated). An optional `membershipId` query parameter carries the client's preferred membership hint. The endpoint SHALL return one of three response shapes based on the candidate count and hint validity.

#### Scenario: Single candidate — auto-resolved
- **WHEN** the golfer has exactly one candidate membership and no valid hint
- **THEN** the endpoint returns `{ status: "resolved", context: { golferId, leagueMembershipId, seasonId, leagueId, courseId, isCommissioner } }`

#### Scenario: Valid hint provided — resolved
- **WHEN** the golfer provides a membershipId that matches one of their candidate memberships
- **THEN** the endpoint returns `{ status: "resolved", context: {...} }` for that membership

#### Scenario: Multiple candidates, no valid hint — pick required
- **WHEN** the golfer has multiple candidate memberships and no valid hint
- **THEN** the endpoint returns `{ status: "pick_required", memberships: [{ id, leagueName, seasonYear, isCommissioner }] }`

#### Scenario: No candidate memberships
- **WHEN** the golfer has no candidate memberships (no active or recently ended season)
- **THEN** the endpoint returns `{ status: "no_leagues" }`

#### Scenario: Invalid hint discarded
- **WHEN** the membershipId hint does not belong to the authenticated golfer or is archived
- **THEN** the hint is ignored and the endpoint proceeds as if no hint was given

#### Scenario: Unauthenticated request rejected
- **WHEN** no golfer is resolved and GET /api/context is called
- **THEN** the API returns HTTP 401
