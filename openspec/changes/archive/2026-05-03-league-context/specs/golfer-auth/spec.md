## MODIFIED Requirements

### Requirement: GET /me endpoint
The system SHALL expose a `GET /me` endpoint returning the authenticated golfer's profile only (id, firstName, lastName, email, course name). The membership list is no longer returned by this endpoint; memberships are resolved via `GET /api/context`.

#### Scenario: Authenticated golfer gets profile
- **WHEN** a request with a resolved golfer hits `GET /me`
- **THEN** the API returns HTTP 200 with the golfer's id, first name, last name, email, and course name

#### Scenario: Unauthenticated request rejected
- **WHEN** no golfer is resolved and `GET /me` is called
- **THEN** the API returns HTTP 401

### Requirement: My profile page
The Next.js app SHALL provide a `/me` page displaying the logged-in golfer's name and course. It serves as the landing area for authenticated users who have no active league context (no active memberships). The membership list display is removed; the page does not attempt to resolve league context.

#### Scenario: Logged-in golfer with no active leagues sees profile
- **WHEN** a golfer is authenticated but has no active or recent league memberships and navigates to `/me`
- **THEN** the page displays their name and course name

#### Scenario: Unauthenticated user redirected
- **WHEN** a user with no session navigates to `/me`
- **THEN** they are redirected to `/login`
