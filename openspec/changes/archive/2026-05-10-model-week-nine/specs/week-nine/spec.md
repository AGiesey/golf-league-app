## ADDED Requirements

### Requirement: NineType enum
The system SHALL define a `NineType` enum with three values: `Front`, `Back`, `Full`. The `Week` entity SHALL include a `Nine` property of this enum type, stored as a string in the database with a default value of `Front`.

- `Front` — holes 1–9 are played this week.
- `Back` — holes 10–18 are played this week.
- `Full` — all 18 holes are played this week.

#### Scenario: Week nine defaults to Front
- **WHEN** a `Week` record is created without an explicit `Nine` value
- **THEN** the `Nine` property is stored as `"Front"`

#### Scenario: All three NineType values are valid
- **WHEN** a `Week` record has `Nine` set to `Front`, `Back`, or `Full`
- **THEN** the value is stored and returned correctly

### Requirement: Nine is schedule data, not gameplay data
The `Nine` property SHALL be set when a week is created (via seed SQL or course admin tooling). It SHALL NOT be modified by any commissioner-facing API at MVP.

#### Scenario: Commissioner cannot change Nine via API
- **WHEN** a commissioner calls any commissioner endpoint at MVP
- **THEN** no endpoint exists that allows updating `Week.Nine`

### Requirement: Nine accepted limitation — standard hole numbering
The `Front` and `Back` values assume holes 1–9 are the front nine and holes 10–18 are the back nine. Courses that number holes differently are not supported by this model.

#### Scenario: Standard-numbered course
- **WHEN** a course numbers holes 1–18 in standard order
- **THEN** `Front` correctly implies holes 1–9 and `Back` implies holes 10–18

#### Scenario: Non-standard hole numbering is an accepted gap
- **WHEN** a course starts play from a hole other than hole 1
- **THEN** the `NineType` enum does not model this correctly (accepted limitation; see data-model.md)
