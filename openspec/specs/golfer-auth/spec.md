## ADDED Requirements

### Requirement: Golfer entity
The system SHALL persist golfers belonging to a course with first name, last name, email, an optional external auth ID, and a nullable ArchivedAt for soft delete. Email SHALL be unique per course. ExternalAuthId SHALL be unique per course when non-null.

#### Scenario: Email is unique per course
- **WHEN** a second golfer record is inserted with the same email and course as an existing record
- **THEN** the insert is rejected with a constraint violation

#### Scenario: ExternalAuthId is unique per course when set
- **WHEN** a second golfer at the same course is given a non-null ExternalAuthId that already exists at that course
- **THEN** the insert or update is rejected with a constraint violation

#### Scenario: Golfer soft delete
- **WHEN** a golfer's ArchivedAt is set
- **THEN** the golfer is excluded from active golfer queries

### Requirement: Auth provider abstraction
The system SHALL resolve authentication through an `IAuthProvider` interface. The active implementation SHALL be selected by the `AUTH_PROVIDER` environment variable (`mock` | `auth0`), defaulting to `mock`.

#### Scenario: Mock provider selected by default
- **WHEN** `AUTH_PROVIDER` is not set or is set to `mock`
- **THEN** the MockAuthProvider is registered

#### Scenario: Auth0 provider blocked
- **WHEN** `AUTH_PROVIDER=auth0`
- **THEN** the application fails to start with a clear error indicating Auth0 is not yet implemented

### Requirement: MockAuthProvider
The system SHALL provide a MockAuthProvider that reads the active golfer's id from a `mock-golfer-id` cookie and returns it as the authenticated identity. The mock provider SHALL only be active when `AUTH_PROVIDER=mock`.

#### Scenario: Valid mock cookie resolves golfer identity
- **WHEN** a request carries a `mock-golfer-id` cookie containing a valid golfer UUID
- **THEN** the provider returns an AuthResult with that golfer's id as ExternalAuthId

#### Scenario: Missing mock cookie returns no result
- **WHEN** a request has no `mock-golfer-id` cookie
- **THEN** the provider returns no result and the request is treated as unauthenticated

### Requirement: Auth0AuthProvider stub
The system SHALL include an `Auth0AuthProvider` class that throws `NotImplementedException`. It SHALL NOT be activatable via configuration in this proposal.

#### Scenario: Auth0 provider throws
- **WHEN** Auth0AuthProvider.ValidateTokenAsync is called
- **THEN** it throws NotImplementedException

### Requirement: "Log in as" developer UI
The system SHALL provide a dev-only page at `/dev/login` listing all seeded golfers. Selecting a golfer SHALL set the `mock-golfer-id` cookie and redirect to `/me`. This page and its supporting API endpoints SHALL only be available when `AUTH_PROVIDER=mock`.

#### Scenario: Developer selects a golfer
- **WHEN** a developer selects a golfer from the `/dev/login` page
- **THEN** the `mock-golfer-id` cookie is set and the developer is redirected to `/me` as that golfer

#### Scenario: Dev UI unavailable outside mock mode
- **WHEN** `AUTH_PROVIDER` is not `mock`
- **THEN** the `/dev/login` page and its supporting endpoints return 404

### Requirement: Golfer resolution middleware
The system SHALL resolve the authenticated golfer on every request and attach it to the request context.

#### Scenario: Known golfer resolved from mock cookie
- **WHEN** a valid `mock-golfer-id` cookie is present and a matching golfer exists
- **THEN** the golfer is attached to the request context

#### Scenario: Unauthenticated request passes through
- **WHEN** no mock cookie is present
- **THEN** the request proceeds with no golfer attached; individual routes may return 401

#### Scenario: Cookie present but golfer not found
- **WHEN** the cookie contains an id that does not match any golfer
- **THEN** the request proceeds with no golfer attached

### Requirement: GET /me endpoint
The system SHALL expose a `GET /me` endpoint returning the authenticated golfer's profile and their active league memberships.

#### Scenario: Authenticated golfer gets profile with memberships
- **WHEN** a request with a resolved golfer hits `GET /me`
- **THEN** the API returns HTTP 200 with the golfer's id, first name, last name, email, course name, and a list of active league memberships each including league name and season year

#### Scenario: Unauthenticated request rejected
- **WHEN** no golfer is resolved and `GET /me` is called
- **THEN** the API returns HTTP 401

### Requirement: My profile page
The Next.js app SHALL provide a `/me` page displaying the logged-in golfer's name, course, and active league memberships.

#### Scenario: Logged-in golfer sees profile
- **WHEN** a golfer is logged in via the mock provider and navigates to `/me`
- **THEN** the page displays their name, course name, and a list of active league memberships with league name and season year

#### Scenario: Unauthenticated user redirected
- **WHEN** a user with no mock session navigates to `/me`
- **THEN** they are redirected to `/dev/login`
