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
The sidebar SHALL render a "Commissioner" section header and its nav items only when the resolved league context has `isCommissioner: true`. The section SHALL NOT be visible to regular golfers.

#### Scenario: Commissioner sees Commissioner section
- **WHEN** the resolved league context has `isCommissioner: true`
- **THEN** the sidebar contains a "Commissioner" section header followed by "Manage Season" and "Manage Matchups" nav items

#### Scenario: Regular golfer does not see Commissioner section
- **WHEN** the resolved league context has `isCommissioner: false`
- **THEN** the sidebar does not contain the Commissioner section header or its nav items

#### Scenario: Context unavailable defaults to no Commissioner section
- **WHEN** league context cannot be resolved (unauthenticated or error)
- **THEN** the Commissioner section is not rendered

### Requirement: Manage Season nav item for commissioners
The sidebar SHALL render a "Manage Season" nav item linking to `/commissioner/season` within the Commissioner section.

#### Scenario: Commissioner sees Manage Season link
- **WHEN** the resolved league context has `isCommissioner: true`
- **THEN** the sidebar contains a link to `/commissioner/season` labelled "Manage Season"

#### Scenario: Manage Season link is active when on that page
- **WHEN** the current path starts with `/commissioner/season`
- **THEN** the Manage Season nav item is rendered in its active/selected visual state

### Requirement: Manage Matchups nav item for commissioners
The sidebar SHALL render a "Manage Matchups" nav item linking to `/commissioner/matchups` within the Commissioner section.

#### Scenario: Commissioner sees Manage Matchups link
- **WHEN** the resolved league context has `isCommissioner: true`
- **THEN** the sidebar contains a link to `/commissioner/matchups` labelled "Manage Matchups"

#### Scenario: Manage Matchups link is active when on that page
- **WHEN** the current path starts with `/commissioner/matchups`
- **THEN** the Manage Matchups nav item is rendered in its active/selected visual state

### Requirement: Active route highlighting
The sidebar SHALL visually distinguish the nav item whose route matches the current page.

#### Scenario: Active item highlighted
- **WHEN** the current page path starts with a nav item's route (e.g. `/dashboard`)
- **THEN** that nav item is rendered in an active/selected visual state

#### Scenario: Inactive items not highlighted
- **WHEN** the current page path does not match a nav item's route
- **THEN** that nav item is rendered in its default unselected state
