## ADDED Requirements

### Requirement: League picker route
The system SHALL expose a `/pick-league` route that displays the golfer's candidate memberships and allows them to select one.

#### Scenario: Picker shows candidate memberships
- **WHEN** a golfer navigates to `/pick-league`
- **THEN** the page displays each candidate membership with league name, season year, and commissioner status

#### Scenario: Unauthenticated access redirected
- **WHEN** a user with no active session navigates to `/pick-league`
- **THEN** they are redirected to `/login`

#### Scenario: Single candidate redirects to dashboard
- **WHEN** a golfer navigates to `/pick-league` but has only one candidate membership
- **THEN** they are redirected to `/dashboard` (context is auto-selected, no picker needed)

### Requirement: Membership selection sets cookie and redirects
When the golfer selects a membership on the picker page, the system SHALL set the `active_membership_id` cookie to the selected membership ID and redirect to `/dashboard`.

#### Scenario: Golfer selects a membership
- **WHEN** a golfer submits the picker form with a chosen membership ID
- **THEN** the active_membership_id cookie is set to that membership ID and the golfer is redirected to /dashboard

### Requirement: active_membership_id cookie properties
The `active_membership_id` cookie SHALL be: `HttpOnly`, `SameSite=Lax`, `Path=/`, and not set with an explicit `Max-Age` (session-scoped for MVP).

#### Scenario: Cookie is HttpOnly
- **WHEN** the active_membership_id cookie is set
- **THEN** it is not accessible to client-side JavaScript
