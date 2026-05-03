## ADDED Requirements

### Requirement: Ping API endpoint
The API SHALL expose a `GET /ping` endpoint that inserts a timestamped record into the database and returns the persisted record to the caller.

#### Scenario: Successful ping
- **WHEN** a client sends `GET /ping`
- **THEN** the API responds with HTTP 200 and a JSON body containing `id` (integer) and `createdAt` (ISO 8601 UTC timestamp)

#### Scenario: Each call produces a new record
- **WHEN** `GET /ping` is called multiple times
- **THEN** each response contains a distinct `id` and `createdAt` value

### Requirement: Ping database table
The database SHALL contain a `pings` table with `id` (auto-incrementing integer primary key) and `created_at` (UTC timestamp, database-defaulted to now).

#### Scenario: Table exists after migration
- **WHEN** the API starts against a fresh database
- **THEN** the `pings` table exists and accepts inserts

### Requirement: Ping page
The Next.js app SHALL expose a `/ping` page that calls `GET /ping` on the API and displays the returned `id` and `createdAt` values.

#### Scenario: Page displays ping result
- **WHEN** a user navigates to `/ping`
- **THEN** the page shows the `id` and `createdAt` from the most recent ping call without a browser error

#### Scenario: API unreachable
- **WHEN** the API is not reachable
- **THEN** the page renders an error message rather than crashing silently
