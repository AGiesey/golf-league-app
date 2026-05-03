## ADDED Requirements

### Requirement: Dashboard route
The system SHALL expose a `/dashboard` route accessible only to authenticated users. Unauthenticated requests SHALL be redirected to `/login`.

#### Scenario: Unauthenticated access redirected
- **WHEN** a user with no active session navigates to `/dashboard`
- **THEN** they are redirected to `/login`

### Requirement: Context resolution on dashboard render
On each render, the `/dashboard` page SHALL call `GET /api/context` with the `active_membership_id` cookie value as the hint. The page SHALL branch on the response status.

#### Scenario: Resolved context — dashboard renders
- **WHEN** GET /api/context returns `{ status: "resolved", context: {...} }`
- **THEN** the dashboard page renders showing the league name, season year, and a commissioner indicator if isCommissioner is true

#### Scenario: Pick required — redirect to picker
- **WHEN** GET /api/context returns `{ status: "pick_required" }`
- **THEN** the dashboard page performs a server-side redirect to `/pick-league`

#### Scenario: No leagues — redirect to /me
- **WHEN** GET /api/context returns `{ status: "no_leagues" }`
- **THEN** the dashboard page performs a server-side redirect to `/me`

### Requirement: Commissioner indicator on dashboard
When the resolved context has `isCommissioner: true`, the dashboard SHALL display a visual indicator distinguishing the user as commissioner.

#### Scenario: Commissioner badge shown
- **WHEN** the resolved LeagueContext has isCommissioner true
- **THEN** the dashboard displays a commissioner badge or label alongside the league info

#### Scenario: No badge for regular members
- **WHEN** the resolved LeagueContext has isCommissioner false
- **THEN** no commissioner badge is shown

### Requirement: Stale cookie cleared on invalid context
If the `active_membership_id` cookie hint is present but rejected by the API (invalid, archived, or belongs to another golfer), the dashboard SHALL clear the cookie before redirecting.

#### Scenario: Invalid cookie cleared
- **WHEN** the dashboard calls /api/context with a hint and receives pick_required or no_leagues
- **THEN** the active_membership_id cookie is deleted before the redirect
