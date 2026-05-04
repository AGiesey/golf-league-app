## ADDED Requirements

### Requirement: SeasonSetupStatus type
The API SHALL define a `SeasonSetupStatus` type with the following shape:

```
SeasonSetupStatus {
  isComplete: bool
  requirements: [
    { name: string, isMet: bool, detail: string }
  ]
}
```

`isComplete` SHALL equal `requirements.every(r => r.isMet)`. The `requirements` array SHALL always contain exactly three entries in this order: Roster, Teams, Schedule.

#### Scenario: All requirements met
- **WHEN** all three requirements are met
- **THEN** `isComplete` is `true`

#### Scenario: Any requirement unmet
- **WHEN** at least one requirement is not met
- **THEN** `isComplete` is `false`

### Requirement: Roster requirement computation
The Roster requirement SHALL be met when at least 2 active `LeagueMembership` records exist for the current season (not soft-deleted). The `detail` string SHALL state the current member count (e.g., "2 members added" or "1 member added — need at least 2").

#### Scenario: Roster met
- **WHEN** the season has 2 or more active league memberships
- **THEN** the Roster requirement has `isMet: true`

#### Scenario: Roster not met
- **WHEN** the season has fewer than 2 active league memberships
- **THEN** the Roster requirement has `isMet: false` and `detail` describes the shortfall

### Requirement: Teams requirement computation
The Teams requirement SHALL be met when every active `LeagueMembership` for the season belongs to a `Team` via a `TeamMembership` record. The `detail` string SHALL name any unassigned members (e.g., "Bob is not on a team") or confirm all are assigned.

#### Scenario: Teams met
- **WHEN** every active league membership has a corresponding team membership
- **THEN** the Teams requirement has `isMet: true`

#### Scenario: Teams not met
- **WHEN** one or more active league memberships have no team membership
- **THEN** the Teams requirement has `isMet: false` and `detail` names the unassigned members

#### Scenario: Teams met vacuously when roster is empty
- **WHEN** there are zero active league memberships
- **THEN** the Teams requirement has `isMet: true` (vacuously — there are no unassigned members)

### Requirement: Schedule requirement computation
The Schedule requirement SHALL be met when at least one `Week` exists for the current season. The `detail` string SHALL state the number of weeks scheduled (e.g., "12 weeks scheduled" or "0 weeks scheduled").

#### Scenario: Schedule met
- **WHEN** at least one Week record exists for the season
- **THEN** the Schedule requirement has `isMet: true`

#### Scenario: Schedule not met
- **WHEN** no Week records exist for the season
- **THEN** the Schedule requirement has `isMet: false` and `detail` says "0 weeks scheduled"

### Requirement: GET /commissioner/season/setup-status endpoint
The API SHALL expose `GET /commissioner/season/setup-status` returning the `SeasonSetupStatus` for the caller's active season. The endpoint SHALL require the caller to be the commissioner of the active league. Non-commissioners SHALL receive HTTP 403. Unauthenticated callers SHALL receive HTTP 401.

#### Scenario: Commissioner receives status
- **WHEN** a commissioner calls `GET /commissioner/season/setup-status`
- **THEN** the API returns HTTP 200 with a `SeasonSetupStatus` computed from live data

#### Scenario: Non-commissioner rejected
- **WHEN** a regular golfer (non-commissioner) calls `GET /commissioner/season/setup-status`
- **THEN** the API returns HTTP 403

#### Scenario: Unauthenticated rejected
- **WHEN** an unauthenticated request hits `GET /commissioner/season/setup-status`
- **THEN** the API returns HTTP 401
