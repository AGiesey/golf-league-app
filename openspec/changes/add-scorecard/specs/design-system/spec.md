## ADDED Requirements

### Requirement: Scorecard component
The system SHALL include a `Scorecard` component (read-only) that renders a single 9-hole table. Columns are hole numbers; rows are: par, handicap index, and one score row per pairing slot. Cells for slots without rounds render as empty. The component SHALL be parameterized by a holes array and a slots array.

#### Scenario: Scorecard renders correct column count
- **WHEN** `Scorecard` receives 9 holes
- **THEN** the table renders exactly 9 score columns plus a label column

#### Scenario: Empty slot row
- **WHEN** a slot has no associated round
- **THEN** the row shows the golfer's name and blank cells for all holes

#### Scenario: Score row with values
- **WHEN** a slot has a round with hole scores
- **THEN** each cell shows the gross strokes for that hole

#### Scenario: Sub name in row label
- **WHEN** a round was played by a sub
- **THEN** the sub's name (not the scheduled golfer) appears as the row label

### Requirement: ScoreEntryDialog component
The system SHALL include a `ScoreEntryDialog` commissioner-only form component that opens in a dialog. It SHALL render one numeric input per hole, a `SubPickerInline`, a tee box select, and Save / Cancel. It SHALL be usable for both creating and editing a round (create: empty inputs; edit: pre-populated with existing scores).

#### Scenario: Create mode — empty inputs
- **WHEN** ScoreEntryDialog opens for a slot with no round
- **THEN** all hole score inputs are empty and the dialog title reads "Add Round"

#### Scenario: Edit mode — pre-populated inputs
- **WHEN** ScoreEntryDialog opens for a slot with an existing round
- **THEN** hole score inputs are pre-filled with the existing strokes and the title reads "Edit Round"

#### Scenario: Numeric inputs only
- **WHEN** a non-numeric value is entered in a hole score input
- **THEN** the input rejects it or the Save button remains disabled
