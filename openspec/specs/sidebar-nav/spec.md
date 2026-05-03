## ADDED Requirements

### Requirement: Sidebar navigation items
The sidebar SHALL render navigation links for Dashboard and My Profile, and a disabled placeholder for Scores/Rounds. All authenticated users see these items regardless of role.

#### Scenario: Dashboard link present
- **WHEN** an authenticated user views any page in the app shell
- **THEN** the sidebar contains a link to `/dashboard` labelled "Dashboard"

#### Scenario: My Profile link present
- **WHEN** an authenticated user views any page in the app shell
- **THEN** the sidebar contains a link to `/me` labelled "My Profile"

#### Scenario: Scores/Rounds placeholder present
- **WHEN** an authenticated user views any page in the app shell
- **THEN** the sidebar contains a non-interactive "Scores / Rounds" item in a muted style indicating it is not yet available

### Requirement: Commissioner section
The sidebar SHALL render a Commissioner nav item only when the resolved league context has `isCommissioner: true`. The item SHALL NOT be visible to regular golfers.

#### Scenario: Commissioner sees commissioner link
- **WHEN** the resolved league context has `isCommissioner: true`
- **THEN** the sidebar contains a Commissioner nav item

#### Scenario: Regular golfer does not see commissioner link
- **WHEN** the resolved league context has `isCommissioner: false`
- **THEN** the sidebar does not contain a Commissioner nav item

#### Scenario: Context unavailable defaults to no commissioner link
- **WHEN** league context cannot be resolved (unauthenticated or error)
- **THEN** the Commissioner nav item is not rendered

### Requirement: Active route highlighting
The sidebar SHALL visually distinguish the nav item whose route matches the current page.

#### Scenario: Active item highlighted
- **WHEN** the current page path starts with a nav item's route (e.g. `/dashboard`)
- **THEN** that nav item is rendered in an active/selected visual state

#### Scenario: Inactive items not highlighted
- **WHEN** the current page path does not match a nav item's route
- **THEN** that nav item is rendered in its default unselected state
