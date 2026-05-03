## ADDED Requirements

### Requirement: Post-login redirect to /me
After a successful Auth0 login, the system SHALL redirect the user to `/me` rather than `/`.

#### Scenario: Successful login lands on /me
- **WHEN** a user completes Auth0 authentication
- **THEN** they are redirected to `/me`

### Requirement: Unauthenticated / redirects to /login
When an unauthenticated user visits `/`, the system SHALL redirect them to `/login`.

#### Scenario: Unauthenticated home visit
- **WHEN** a user with no active session navigates to `/`
- **THEN** they are redirected to `/login`

### Requirement: Authenticated user visiting / redirects to /me
When an authenticated user visits `/`, the system SHALL redirect them to `/me`.

#### Scenario: Authenticated home visit
- **WHEN** a user with an active session navigates to `/`
- **THEN** they are redirected to `/me`

### Requirement: Authenticated user visiting /login redirects to /me
When an authenticated user visits `/login`, the system SHALL redirect them to `/me`.

#### Scenario: Authenticated login page visit
- **WHEN** a user with an active session navigates to `/login`
- **THEN** they are redirected to `/me`

### Requirement: Unauthenticated /me redirects to /login
When an unauthenticated user visits `/me`, the system SHALL redirect them to `/login`. (Pre-existing behavior — must not regress.)

#### Scenario: Unauthenticated /me visit
- **WHEN** a user with no active session navigates to `/me`
- **THEN** they are redirected to `/login`
