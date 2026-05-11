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

### Requirement: Navigation to matchup management
The commissioner season page SHALL include a link or entry point that navigates the commissioner to `/commissioner/matchups` for managing weekly matchups.

#### Scenario: Matchup management link visible to commissioner
- **WHEN** a commissioner views the `/commissioner/season` page
- **THEN** there is a visible link or button that navigates to `/commissioner/matchups`
