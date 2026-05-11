## ADDED Requirements

### Requirement: ManageScores authorization capability
The system SHALL define a `ManageScores` named authorization capability. It SHALL be granted only to users whose active `LeagueContext` has `isCommissioner = true`. It SHALL gate all `Round` and `HoleScore` write operations and sub creation.

#### Scenario: Commissioner has ManageScores
- **WHEN** the active `LeagueContext` has `isCommissioner = true`
- **THEN** the `ManageScores` capability is granted for requests scoped to that league/season

#### Scenario: Non-commissioner lacks ManageScores
- **WHEN** the active `LeagueContext` has `isCommissioner = false`
- **THEN** the `ManageScores` capability is denied and write endpoints return HTTP 403

### Requirement: ManageScores gates write endpoints
The API SHALL apply the `ManageScores` capability check to `POST /pairing-slots/{slotId}/round`, `PUT /rounds/{roundId}`, and `POST /seasons/{seasonId}/subs`. Read access to scorecard data SHALL remain available to any authenticated league member without a capability check.

#### Scenario: Read endpoint requires only league membership
- **WHEN** any authenticated league member calls `GET /matchups/{matchupId}/scorecard`
- **THEN** the request is authorized without requiring `ManageScores`

#### Scenario: Write endpoints require ManageScores
- **WHEN** a request to a score write endpoint arrives without the `ManageScores` capability
- **THEN** the API returns HTTP 403
