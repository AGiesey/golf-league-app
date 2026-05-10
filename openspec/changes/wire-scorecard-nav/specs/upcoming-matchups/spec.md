## ADDED Requirements

### Requirement: GET /api/me/upcoming-matchups endpoint
The system SHALL expose `GET /api/me/upcoming-matchups` returning the authenticated golfer's matchups in their next upcoming week (the earliest Week in the active season where `start_date >= today`; if today is a play date, today's week is returned). The response SHALL include `matchupId`, week metadata, both team names, pairings with tee time, and per-slot `hasRound` flag. Authorization: any active league member (authenticated, `X-Membership-Id` header).

#### Scenario: Golfer has an upcoming matchup
- **WHEN** the active season has a week with `start_date >= today` and the golfer's team has a matchup that week
- **THEN** the endpoint returns HTTP 200 with a non-empty array of matchup objects, each containing `matchupId`, `week.number`, `week.startDate`, `week.nine`, `myTeam`, `opponentTeam`, and `pairings` with `teeTime` and `slots[].hasRound`

#### Scenario: No upcoming week in the season
- **WHEN** all weeks in the active season have `start_date < today`
- **THEN** the endpoint returns HTTP 200 with `{ matchups: [], reason: "no_upcoming_week" }`

#### Scenario: Golfer's team has no matchup in the upcoming week
- **WHEN** an upcoming week exists but the golfer's team has no matchup that week
- **THEN** the endpoint returns HTTP 200 with `{ matchups: [], reason: "no_matchup_this_week" }`

#### Scenario: Unauthenticated request rejected
- **WHEN** the request is missing a valid `Authorization` header or `X-Membership-Id`
- **THEN** the endpoint returns HTTP 401 or 403

### Requirement: matchupId included in existing my-matchup-summary endpoint
The system SHALL include a nullable `matchupId` field on both the `upcoming` and `previous` matchup objects returned by `GET /season/my-matchup-summary`.

#### Scenario: Upcoming matchup id returned
- **WHEN** `GET /season/my-matchup-summary` returns a non-null `upcoming` object
- **THEN** the object includes `matchupId` (non-null Guid string)

#### Scenario: Previous matchup id returned
- **WHEN** `GET /season/my-matchup-summary` returns a non-null `previous` object
- **THEN** the object includes `matchupId` (non-null Guid string)

#### Scenario: Null matchup objects remain null
- **WHEN** either `upcoming` or `previous` is null (no matchup in that position)
- **THEN** the field is null (not an object without matchupId)
