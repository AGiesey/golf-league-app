## Why

The scaffold is running but the app has no domain model and no way for a golfer to log in. This change lays the foundational layer everything else builds on: the core entities in the database, a working mock auth system, and a "my profile" page that gives golfers a real first view of their league membership.

## What Changes

- Add EF Core entities and a migration for: `Course`, `TeeBox`, `Hole`, `League`, `LeagueConfiguration`, `Season`, `LeagueMembership`, and `Golfer`
- All entities include `CreatedAt` and `UpdatedAt` audit timestamps; entities marked for soft delete in the data model (`Golfer`, `Season`, `LeagueMembership`, `Team`) include `ArchivedAt`; commissioner-editable entities include `CreatedBy` and `UpdatedBy` per `docs/data-model.md`
- Add a SQL seed template so a super admin can bootstrap a course, league, season, and golfer accounts without a UI
- Introduce an `IAuthProvider` abstraction with two implementations:
  - `MockAuthProvider` — the only working implementation in this proposal; lets a developer "log in as" any seeded golfer via a simple UI control; selected via `AUTH_PROVIDER=mock`
  - `Auth0AuthProvider` — stubbed, throws `NotImplementedException`; real Auth0 wiring (JWT validation, `@auth0/nextjs-auth0`) belongs in a later proposal
- Add golfer resolution middleware that resolves the authenticated golfer from the mock token on every request
- Add `GET /me` endpoint returning the authenticated golfer's profile and active league memberships
- Add a "my profile" page in the Next.js frontend displaying the logged-in golfer's name, course, and active league memberships
- Remove the `Ping` entity, migration, and `/ping` endpoint/page (connectivity spike cleanup)

## Capabilities

### New Capabilities

- `course-and-league-entities`: EF Core entities and migration for `Course`, `TeeBox`, `Hole`, `League`, `LeagueConfiguration`, `Season`, and `LeagueMembership`; audit and soft-delete fields throughout; SQL seed template for super admin setup
- `golfer-auth`: `Golfer` entity, `IAuthProvider` abstraction, working `MockAuthProvider` with "log in as" UI, stubbed `Auth0AuthProvider`, golfer resolution middleware, `GET /me` endpoint, and "my profile" Next.js page

### Modified Capabilities

<!-- none — no existing specs -->

## Impact

- Adds EF Core entities and a migration for the entire foundational schema
- No real Auth0 dependency in this proposal — `Auth0AuthProvider` is a stub; auth provider is selected by `AUTH_PROVIDER` env var (default: `mock`)
- Removes the `Ping` entity and its migration; database volume must be recreated
- Updates `docs/data-model.md` if any entity details change during implementation
