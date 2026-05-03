## ADDED Requirements

### Requirement: Golfer profile card
The `/me` page SHALL display the authenticated golfer's full name and home course in a Card component using design system Typography.

#### Scenario: Profile card shows golfer name and course
- **WHEN** an authenticated golfer visits `/me`
- **THEN** a Card displays their full name as a prominent heading and their home course name below it

### Requirement: League memberships card
The `/me` page SHALL display the golfer's league memberships in a separate Card. Each membership SHALL show the league name and season year. If there are no memberships, a message SHALL indicate this.

#### Scenario: Memberships are listed
- **WHEN** an authenticated golfer has one or more league memberships
- **THEN** a Card lists each membership with its league name and season year

#### Scenario: No memberships message
- **WHEN** an authenticated golfer has no league memberships
- **THEN** the memberships Card displays a message indicating no active memberships

### Requirement: Styled logout action
The `/me` page SHALL provide a logout control using the Button component from the design system, replacing the unstyled anchor tag. Clicking it SHALL navigate to `/api/auth/logout`.

#### Scenario: Logout button is visible and styled
- **WHEN** an authenticated golfer views the `/me` page
- **THEN** a Button component is rendered for logout, visually distinct from plain text links

#### Scenario: Logout button navigates to logout endpoint
- **WHEN** an authenticated golfer clicks the logout button
- **THEN** they are navigated to `/api/auth/logout` to begin the logout flow
