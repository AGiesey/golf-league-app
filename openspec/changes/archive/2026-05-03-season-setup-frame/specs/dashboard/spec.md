## MODIFIED Requirements

### Requirement: Context resolution on dashboard render
On each render, the `/dashboard` page SHALL call `GET /api/context` with the `active_membership_id` cookie value as the hint. The page SHALL branch on the response status.

#### Scenario: Resolved context — dashboard renders
- **WHEN** GET /api/context returns `{ status: "resolved", context: {...} }`
- **THEN** the dashboard page renders its content based on setup status and the viewer's role (see requirements below)

#### Scenario: Pick required — redirect to picker
- **WHEN** GET /api/context returns `{ status: "pick_required" }`
- **THEN** the dashboard page performs a server-side redirect to `/pick-league`

#### Scenario: No leagues — redirect to /me
- **WHEN** GET /api/context returns `{ status: "no_leagues" }`
- **THEN** the dashboard page performs a server-side redirect to `/me`

## ADDED Requirements

### Requirement: Dashboard renders differently based on setup status and role
The `/dashboard` page SHALL fetch `SeasonSetupStatus` when the resolved context has `isCommissioner: true`. It SHALL render one of three states based on setup completeness and the viewer's role.

#### Scenario: Setup complete — normal dashboard for all viewers
- **WHEN** `SeasonSetupStatus.isComplete` is `true`
- **THEN** the dashboard renders normal league content (league name, season year, commissioner badge if applicable) for all viewers

#### Scenario: Setup incomplete — commissioner sees setup widget
- **WHEN** `SeasonSetupStatus.isComplete` is `false` and the viewer has `isCommissioner: true`
- **THEN** the dashboard renders a setup-incomplete widget showing a checklist of all requirements with their `isMet` state and `detail` strings; each unmet item links to the corresponding tab on `/commissioner/season`

#### Scenario: Setup incomplete — regular golfer sees placeholder
- **WHEN** `SeasonSetupStatus.isComplete` is `false` and the viewer has `isCommissioner: false`
- **THEN** the dashboard renders a "league isn't ready yet" placeholder with the league name and season year; no setup checklist is shown

### Requirement: Commissioner indicator on dashboard
When setup is complete and the resolved context has `isCommissioner: true`, the dashboard SHALL display a visual indicator distinguishing the user as commissioner.

#### Scenario: Commissioner badge shown
- **WHEN** the resolved LeagueContext has `isCommissioner: true` and setup is complete
- **THEN** the dashboard displays a commissioner badge or label alongside the league info

#### Scenario: No badge for regular members
- **WHEN** the resolved LeagueContext has `isCommissioner: false`
- **THEN** no commissioner badge is shown

### Requirement: Stale cookie cleared on invalid context
If the `active_membership_id` cookie hint is present but rejected by the API (invalid, archived, or belongs to another golfer), the dashboard SHALL clear the cookie before redirecting.

#### Scenario: Invalid cookie cleared
- **WHEN** the dashboard calls /api/context with a hint and receives pick_required or no_leagues
- **THEN** the active_membership_id cookie is deleted before the redirect
