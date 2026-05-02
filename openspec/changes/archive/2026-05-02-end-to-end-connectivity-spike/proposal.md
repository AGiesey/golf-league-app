## Why

The project scaffold is running but no code path exercises the full web → API → database loop. Before building real features we need confidence that Next.js can call the ASP.NET Core API and the API can round-trip through EF Core to PostgreSQL — catching any wiring issues now rather than mid-feature.

## What Changes

- Add a `GET /ping` API endpoint that writes a timestamped record to the database and reads it back, returning the value to the caller
- Add a `/ping` page in the Next.js app that calls the endpoint using `apiFetch` and displays the response
- The ping record is a minimal single-table schema (`pings`) — enough to validate EF Core entity mapping and migration generation end-to-end

## Capabilities

### New Capabilities

- `ping`: A round-trip connectivity probe — web page calls API, API writes to and reads from the database, result is displayed in the browser

### Modified Capabilities

<!-- none -->

## Impact

- Adds one new EF Core entity and migration
- Adds one API endpoint (`GET /ping`)
- Adds one Next.js page (`/ping`)
- No changes to existing scaffold code
- Disposable once real features exist — ping endpoint and page can be removed in a future change
