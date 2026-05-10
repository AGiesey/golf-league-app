## ADDED Requirements

### Requirement: POST /pairing-slots/{slotId}/round — create round
The API SHALL expose `POST /pairing-slots/{slotId}/round` (commissioner only, `ManageScores` capability) that atomically creates a `Round` and all `HoleScore` rows in a single transaction. Body: `{ subId: uuid | null, teeBoxId: uuid, holeScores: [{ holeId, strokes }] }`.

#### Scenario: Successful round creation
- **WHEN** a commissioner posts a valid body with the correct hole set and all positive integer strokes
- **THEN** the API returns HTTP 201 with the created round and its hole scores

#### Scenario: Conflict — round already exists
- **WHEN** a `Round` already exists for the given slot
- **THEN** the API returns HTTP 409

#### Scenario: Non-commissioner rejected
- **WHEN** a non-commissioner calls this endpoint
- **THEN** the API returns HTTP 403

### Requirement: POST /pairing-slots/{slotId}/round — validation
The create endpoint SHALL enforce: exactly the right number of hole scores for the week's nine (9 for Front/Back, 18 for Full); exactly the correct hole IDs for that nine; no null strokes; all strokes are positive integers; exactly one of subId/leagueMembershipId is used.

#### Scenario: Wrong number of hole scores rejected
- **WHEN** the request contains fewer or more hole scores than the week's nine requires
- **THEN** the API returns HTTP 400

#### Scenario: Wrong hole IDs rejected
- **WHEN** the request contains hole IDs that do not belong to the week's nine
- **THEN** the API returns HTTP 400

#### Scenario: Null strokes rejected
- **WHEN** any `strokes` value in `holeScores` is null
- **THEN** the API returns HTTP 400

#### Scenario: Zero or negative strokes rejected
- **WHEN** any `strokes` value is zero or negative
- **THEN** the API returns HTTP 400

### Requirement: PUT /rounds/{roundId} — replace round
The API SHALL expose `PUT /rounds/{roundId}` (commissioner only, `ManageScores` capability) that atomically deletes all existing `HoleScore` rows for the round and inserts the new set, updating `teeBoxId`, `subId`, and `UpdatedBy` in the same transaction. Same validation as create.

#### Scenario: Successful round edit
- **WHEN** a commissioner puts a valid updated body for an existing round
- **THEN** the API returns HTTP 200 with the updated round; original `CreatedBy` is preserved

#### Scenario: Unknown round returns 404
- **WHEN** the roundId does not exist
- **THEN** the API returns HTTP 404

#### Scenario: Non-commissioner rejected on edit
- **WHEN** a non-commissioner calls this endpoint
- **THEN** the API returns HTTP 403

### Requirement: ScoreEntryDialog UI component
The `ScoreEntryDialog` component SHALL render a form with: one numeric input per hole in the week's nine, a golfer/sub picker (`SubPickerInline`), a tee box picker, and Save / Cancel buttons. Save SHALL be disabled until all hole inputs are filled with positive integers. Closing the dialog or canceling discards all in-progress entry.

#### Scenario: Save disabled when inputs incomplete
- **WHEN** any hole score input is empty or invalid
- **THEN** the Save button is disabled

#### Scenario: Save enabled when all inputs valid
- **WHEN** all hole score inputs contain positive integers
- **THEN** the Save button is enabled

#### Scenario: Cancel discards entry
- **WHEN** the commissioner clicks Cancel or closes the dialog
- **THEN** no API call is made and the scorecard is unchanged

#### Scenario: Successful save refreshes scorecard
- **WHEN** the commissioner submits a valid form and the API returns 201 or 200
- **THEN** the dialog closes and the scorecard component reloads to show the new scores

#### Scenario: Add round button — commissioner only
- **WHEN** `context.isCommissioner` is true and a slot has no round
- **THEN** an "Add round" button is visible for that slot

#### Scenario: Edit round button — commissioner only
- **WHEN** `context.isCommissioner` is true and a slot has a round
- **THEN** an "Edit round" button is visible for that slot

#### Scenario: Edit / add buttons hidden for non-commissioners
- **WHEN** `context.isCommissioner` is false
- **THEN** no score entry affordances are visible
