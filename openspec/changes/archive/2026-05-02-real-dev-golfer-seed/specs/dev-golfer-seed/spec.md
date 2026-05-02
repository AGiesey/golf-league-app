## ADDED Requirements

### Requirement: Dev seed contains 8 golfers with real email addresses
The `docs/seed.sql` seed script SHALL contain exactly 8 golfer rows, all belonging to the seeded course. One golfer SHALL use `adamgiesey@gmail.com` and have a corresponding league membership with `is_commissioner = true`. The remaining 7 golfers SHALL use yopmail addresses and have league memberships with `is_commissioner = false`. All golfer rows SHALL have `external_auth_id = NULL` at seed time.

#### Scenario: Commissioner golfer is seeded
- **WHEN** the seed script is executed against a clean database
- **THEN** a golfer row exists with email `adamgiesey@gmail.com`, `external_auth_id = NULL`, and a league membership with `is_commissioner = true`

#### Scenario: Regular golfers are seeded
- **WHEN** the seed script is executed against a clean database
- **THEN** exactly 7 golfer rows exist with `@yopmail.com` email addresses and league memberships with `is_commissioner = false`

#### Scenario: No placeholder emails remain
- **WHEN** the seed script is executed against a clean database
- **THEN** no golfer rows exist with `@example.com` email addresses

### Requirement: Seeded golfers are linkable via Auth0 first-login flow
The seeded golfer rows SHALL be compatible with the existing email-based Auth0 linking flow in `GolferContextMiddleware`. When an Auth0 user logs in with an email matching a seeded golfer, the system SHALL write the Auth0 `sub` value to `external_auth_id` and allow the request.

#### Scenario: First Auth0 login links commissioner
- **WHEN** the Auth0 user `adamgiesey@gmail.com` logs in for the first time
- **THEN** the golfer row for that email has its `external_auth_id` set to the Auth0 `sub` value and the user can access the app

#### Scenario: First Auth0 login links regular golfer
- **WHEN** an Auth0 user logs in with a yopmail address matching a seeded golfer
- **THEN** that golfer row has its `external_auth_id` set to the Auth0 `sub` value and the user can access the app

### Requirement: Seeded golfers appear in mock auth dev login
The 8 seeded golfers SHALL appear in the `/dev/login` golfer selector when `AUTH_PROVIDER=mock`, replacing the previous placeholder golfers.

#### Scenario: Dev login lists real golfers
- **WHEN** a developer navigates to `/dev/login` in mock auth mode
- **THEN** the golfer selector displays 8 golfers including Adam Giesey and 7 yopmail golfers
