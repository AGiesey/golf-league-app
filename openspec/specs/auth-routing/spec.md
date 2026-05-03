## ADDED Requirements

### Requirement: Post-login redirect to /dashboard
After a successful Auth0 login, the system SHALL redirect the user to `/dashboard` rather than `/me`.

#### Scenario: Successful login lands on /dashboard
- **WHEN** a user completes Auth0 authentication
- **THEN** they are redirected to `/dashboard`

### Requirement: Unauthenticated / redirects to /login
When an unauthenticated user visits `/`, the system SHALL redirect them to `/login`.

#### Scenario: Unauthenticated home visit
- **WHEN** a user with no active session navigates to `/`
- **THEN** they are redirected to `/login`

### Requirement: Authenticated user visiting / redirects to /dashboard
When an authenticated user visits `/`, the system SHALL redirect them to `/dashboard`.

#### Scenario: Authenticated home visit
- **WHEN** a user with an active session navigates to `/`
- **THEN** they are redirected to `/dashboard`

### Requirement: Authenticated user visiting /login redirects to /dashboard
When an authenticated user visits `/login`, the system SHALL redirect them to `/dashboard`.

#### Scenario: Authenticated login page visit
- **WHEN** a user with an active session navigates to `/login`
- **THEN** they are redirected to `/dashboard`

### Requirement: Unauthenticated /me redirects to /login
When an unauthenticated user visits `/me`, the system SHALL redirect them to `/login`. (Pre-existing behavior — must not regress.)

#### Scenario: Unauthenticated /me visit
- **WHEN** a user with no active session navigates to `/me`
- **THEN** they are redirected to `/login`

### Requirement: Unauthenticated /dashboard redirects to /login
When an unauthenticated user visits `/dashboard`, the system SHALL redirect them to `/login`.

#### Scenario: Unauthenticated dashboard visit
- **WHEN** a user with no active session navigates to `/dashboard`
- **THEN** they are redirected to `/login`
