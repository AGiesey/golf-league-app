## ADDED Requirements

### Requirement: POST /seasons/{seasonId}/subs endpoint
The API SHALL expose `POST /seasons/{seasonId}/subs` (commissioner only, `ManageScores` capability) that creates a new `Sub` record. Body: `{ firstName: string, lastName: string, handicap: number }`. Returns the created sub. Authorization scope is the season to confirm the caller is a commissioner in that league.

#### Scenario: Successful sub creation
- **WHEN** a commissioner posts a valid body with firstName, lastName, and handicap
- **THEN** the API returns HTTP 201 with the created sub (id, firstName, lastName, handicap)

#### Scenario: Missing required field rejected
- **WHEN** any of firstName, lastName, or handicap is absent or blank
- **THEN** the API returns HTTP 400

#### Scenario: Non-commissioner rejected
- **WHEN** a non-commissioner calls this endpoint
- **THEN** the API returns HTTP 403

### Requirement: SubPickerInline UI component
The `SubPickerInline` component SHALL render inside `ScoreEntryDialog` and allow the commissioner to either select an existing `Sub` from a list or create a new one inline (firstName, lastName, handicap fields) without leaving the score entry dialog. A toggle affordance switches between "select existing" and "create new" modes.

#### Scenario: Select existing sub
- **WHEN** the commissioner selects an existing sub from the picker
- **THEN** that sub's id is used as `subId` in the round create/edit request

#### Scenario: Inline sub creation
- **WHEN** the commissioner fills in firstName, lastName, and handicap and saves
- **THEN** `POST /seasons/{seasonId}/subs` is called first; on success the new sub is used as `subId` in the round request

#### Scenario: No sub — regular member plays
- **WHEN** the commissioner leaves the sub picker in its default (no sub) state
- **THEN** `subId` is null in the round request and the slot's `LeagueMembershipId` is used
