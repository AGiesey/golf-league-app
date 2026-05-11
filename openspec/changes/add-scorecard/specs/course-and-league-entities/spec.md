## ADDED Requirements

### Requirement: LeagueConfiguration.DefaultTeeBoxId
The `LeagueConfiguration` entity SHALL include a nullable `DefaultTeeBoxId` FK referencing `TeeBox`. When set, new `Round` rows for this league SHALL pre-fill the tee box picker with this value. `ON DELETE SET NULL` — deleting a tee box sets `DefaultTeeBoxId` to null rather than cascading.

#### Scenario: DefaultTeeBoxId is nullable
- **WHEN** a `LeagueConfiguration` record is created without setting `DefaultTeeBoxId`
- **THEN** the field is null and the tee box picker falls back to the first available tee box

#### Scenario: DefaultTeeBoxId pre-fills score entry
- **WHEN** `LeagueConfiguration.DefaultTeeBoxId` is set to a valid tee box ID
- **THEN** the `ScoreEntryDialog` tee box picker defaults to that tee box for new rounds

#### Scenario: Deleting the default tee box sets field to null
- **WHEN** the tee box referenced by `DefaultTeeBoxId` is deleted
- **THEN** `DefaultTeeBoxId` is set to null (ON DELETE SET NULL) and no cascade error occurs
