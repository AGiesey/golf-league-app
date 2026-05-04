## ADDED Requirements

### Requirement: /commissioner/season route
The system SHALL expose a `/commissioner/season` page accessible only to authenticated users whose active league context has `isCommissioner: true`. Non-commissioners SHALL be redirected to `/dashboard`. Unauthenticated users SHALL be redirected to `/login`.

#### Scenario: Commissioner can access the page
- **WHEN** an authenticated commissioner navigates to `/commissioner/season`
- **THEN** the page renders

#### Scenario: Non-commissioner redirected
- **WHEN** a regular golfer navigates to `/commissioner/season`
- **THEN** they are redirected to `/dashboard`

#### Scenario: Unauthenticated redirected
- **WHEN** an unauthenticated user navigates to `/commissioner/season`
- **THEN** they are redirected to `/login`

### Requirement: Setup status banner
The page SHALL display a status banner above the tabs. When `SeasonSetupStatus.isComplete` is `true`, the banner SHALL show a success state. When `isComplete` is `false`, the banner SHALL show a checklist of unmet requirements, each displaying its `detail` string.

#### Scenario: Banner shows success when complete
- **WHEN** `SeasonSetupStatus.isComplete` is `true`
- **THEN** the banner displays a success indicator

#### Scenario: Banner shows checklist when incomplete
- **WHEN** `SeasonSetupStatus.isComplete` is `false`
- **THEN** the banner lists each unmet requirement with its `detail` string

### Requirement: Tabbed layout with completion indicators
The page SHALL render three tabs — Roster, Teams, Schedule — in that order. Each tab label SHALL display a checkmark indicator when the corresponding requirement `isMet` is `true`, and a warning indicator when `isMet` is `false`. The Roster tab body SHALL render the live roster table (see `roster-tab` capability). The Teams tab body SHALL render the live teams management UI (see `teams-tab` capability). The Schedule tab body SHALL render the live schedule view (see `schedule-tab` capability).

#### Scenario: Met tab shows checkmark
- **WHEN** a requirement's `isMet` is `true`
- **THEN** the corresponding tab label displays a checkmark indicator

#### Scenario: Unmet tab shows warning
- **WHEN** a requirement's `isMet` is `false`
- **THEN** the corresponding tab label displays a warning indicator

#### Scenario: Roster tab body shows roster table
- **WHEN** a commissioner selects the Roster tab
- **THEN** the tab body renders the live roster table with member data fetched from `GET /commissioner/season/roster`

#### Scenario: Teams tab body shows teams management UI
- **WHEN** a commissioner selects the Teams tab
- **THEN** the tab body renders the live teams management UI with data fetched from `GET /commissioner/season/teams`

#### Scenario: Schedule tab body shows schedule view
- **WHEN** a commissioner selects the Schedule tab
- **THEN** the tab body renders the live schedule view with data fetched from `GET /commissioner/season/schedule`

### Requirement: Tab deep-linking via URL parameter
The active tab SHALL be controlled by a `tab` URL search parameter (`?tab=roster`, `?tab=teams`, `?tab=schedule`). Navigating to `/commissioner/season` without a `tab` parameter SHALL default to the Roster tab.

#### Scenario: URL parameter selects tab
- **WHEN** the URL is `/commissioner/season?tab=teams`
- **THEN** the Teams tab is active

#### Scenario: Default tab is Roster
- **WHEN** the URL is `/commissioner/season` with no tab parameter
- **THEN** the Roster tab is active
