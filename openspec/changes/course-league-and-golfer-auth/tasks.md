## 1. Ping Spike Cleanup

- [x] 1.1 Remove `api/Models/Ping.cs`
- [x] 1.2 Remove `DbSet<Ping>` and `OnModelCreating` Ping mapping from `AppDbContext`
- [x] 1.3 Delete all files in `api/Migrations/` (migration history will be rebuilt from scratch)
- [x] 1.4 Remove the `/ping` endpoint from `api/Program.cs` and the `using GolfLeagueApi.Models` import
- [x] 1.5 Delete `web/app/ping/page.tsx`
- [x] 1.6 Delete `openspec/specs/ping/` directory

## 2. API — Packages and Project Setup

- [x] 2.1 Add `EFCore.NamingConventions` NuGet package to `api/GolfLeagueApi.csproj`
- [x] 2.2 Apply `UseSnakeCaseNamingConvention()` in `AppDbContext.OnModelCreating`

## 3. API — Domain Entities

- [x] 3.1 Create `api/Models/Course.cs` (`Id`, `Name`, `Timezone`, `CreatedAt`, `UpdatedAt`)
- [x] 3.2 Create `api/Models/TeeBox.cs` (`Id`, `CourseId`, `Name`, `CreatedAt`, `UpdatedAt`)
- [x] 3.3 Create `api/Models/Hole.cs` (`Id`, `CourseId`, `Number`, `Par`, `HandicapIndex`, `CreatedAt`, `UpdatedAt`)
- [x] 3.4 Create `api/Models/League.cs` (`Id`, `CourseId`, `Name`, `DayOfWeek`, `DefaultRoundLength`, `CreatedAt`, `UpdatedAt`)
- [x] 3.5 Create `api/Models/LeagueConfiguration.cs` (`Id`, `LeagueId`, `HandicapSystem`, `SubsAllowed`, `CreatedAt`, `UpdatedAt`)
- [x] 3.6 Create `api/Models/Season.cs` (`Id`, `LeagueId`, `Year`, `StartDate`, `EndDate`, `ArchivedAt`, `CreatedAt`, `UpdatedAt`)
- [x] 3.7 Create `api/Models/Golfer.cs` (`Id`, `CourseId`, `FirstName`, `LastName`, `Email`, `ExternalAuthId`, `ArchivedAt`, `CreatedAt`, `UpdatedAt`)
- [x] 3.8 Create `api/Models/LeagueMembership.cs` (`Id`, `GolferId`, `SeasonId`, `Handicap`, `IsCommissioner`, `ArchivedAt`, `CreatedAt`, `UpdatedAt`)

## 4. API — Entity Configuration

- [x] 4.1 Create `api/Data/Configurations/CourseConfiguration.cs` — configure PK UUID default (`gen_random_uuid()`), required fields
- [x] 4.2 Create `api/Data/Configurations/TeeBoxConfiguration.cs` — FK to Course
- [x] 4.3 Create `api/Data/Configurations/HoleConfiguration.cs` — FK to Course
- [x] 4.4 Create `api/Data/Configurations/LeagueEntityConfiguration.cs` — FK to Course
- [x] 4.5 Create `api/Data/Configurations/LeagueConfigurationConfig.cs` — FK to League, one-to-one
- [x] 4.6 Create `api/Data/Configurations/SeasonConfiguration.cs` — FK to League
- [x] 4.7 Create `api/Data/Configurations/GolferConfiguration.cs` — FK to Course; unique index on `(CourseId, Email)`; filtered unique index on `(CourseId, ExternalAuthId)` where ExternalAuthId is not null
- [x] 4.8 Create `api/Data/Configurations/LeagueMembershipConfiguration.cs` — FK to Golfer, FK to Season
- [x] 4.9 Register all configurations in `AppDbContext.OnModelCreating` via `modelBuilder.ApplyConfigurationsFromAssembly`
- [x] 4.10 Add `DbSet<>` properties for all eight entities to `AppDbContext`

## 5. API — Migration

- [x] 5.1 Drop the postgres data volume: `docker compose down -v`
- [x] 5.2 Generate the `InitialSchema` migration using `dotnet ef migrations add InitialSchema` from within the SDK container
- [x] 5.3 Verify the generated migration SQL creates all eight tables with correct columns, FKs, and indexes

## 6. API — Auth Abstraction

- [x] 6.1 Create `api/Auth/AuthResult.cs` record (`ExternalAuthId`)
- [x] 6.2 Create `api/Auth/IAuthProvider.cs` interface with `ResolveAsync(HttpContext context) → Task<AuthResult?>`
- [x] 6.3 Create `api/Auth/MockAuthProvider.cs` — reads `mock-golfer-id` cookie from `HttpContext`, returns `AuthResult` with that value as `ExternalAuthId`; no token, no JWT
- [x] 6.4 Create `api/Auth/Auth0AuthProvider.cs` — throws `NotImplementedException` from `ResolveAsync`
- [x] 6.5 Register `IAuthProvider` in `Program.cs`: read `AUTH_PROVIDER` env var (default `mock`); register `MockAuthProvider` when `mock`; throw a startup error with a clear message when `auth0`
- [x] 6.6 Add `AUTH_PROVIDER` to `.env.example` with value `mock` and a comment explaining valid values

## 7. API — Golfer Resolution Middleware

- [x] 7.1 Create `api/Middleware/GolferContextMiddleware.cs` — calls `IAuthProvider.ResolveAsync`, looks up `Golfer` by `ExternalAuthId` (active only, `ArchivedAt` is null), stores result on `HttpContext.Items["Golfer"]`
- [x] 7.2 Create `api/Extensions/HttpContextExtensions.cs` with `RequireGolfer()` helper — returns resolved `Golfer` or writes 401 and short-circuits
- [x] 7.3 Register `GolferContextMiddleware` in `Program.cs` after `UseCors`, before route handlers

## 8. API — Dev Endpoints (mock mode only)

- [x] 8.1 Add `GET /dev/golfers` endpoint — returns a list of all active golfers (`Id`, `FirstName`, `LastName`, `Email`); only registered when `AUTH_PROVIDER=mock`
- [x] 8.2 Add `POST /dev/login` endpoint — accepts `{ golferId }` in the request body, sets `mock-golfer-id` cookie, returns 200; only registered when `AUTH_PROVIDER=mock`

## 9. API — /me Endpoint

- [x] 9.1 Add `GET /me` endpoint — calls `RequireGolfer()`, queries the golfer's active `LeagueMembership` records (joining `Season` and `League`), returns `{ id, firstName, lastName, email, course: { name }, memberships: [{ leagueName, seasonYear }] }`

## 10. SQL Seed Template

- [x] 10.1 Create `docs/seed.sql` with `INSERT` statements for: one course, two tee boxes, 9 holes, one league, one league configuration, one season, and at least two golfer accounts
- [x] 10.2 Include a `LeagueMembership` row linking each seeded golfer to the seeded season
- [x] 10.3 Add commented instructions at the top of the file explaining how to run it against the running container

## 11. Web — "Log in as" Dev UI

- [x] 11.1 Create `web/app/dev/login/page.tsx` — server component that fetches `GET /dev/golfers` and renders a list of golfers; hidden via 404 when `AUTH_PROVIDER` is not `mock`
- [x] 11.2 Create a client component (e.g., `web/app/dev/login/GolferSelector.tsx`) that POSTs to `POST /dev/login` when a golfer is selected and redirects to `/me`

## 12. Web — My Profile Page

- [x] 12.1 Create `web/app/me/page.tsx` — server component that calls `GET /me` (forwarding the `mock-golfer-id` cookie); if 401, redirect to `/dev/login`; otherwise render the golfer's name, course name, and list of active league memberships with league name and season year

## 13. Verification

- [x] 13.1 `docker compose up -d --build` — confirm all services start and migrations apply cleanly
- [x] 13.2 Run seed SQL and confirm records exist in the database
- [x] 13.3 Navigate to `/dev/login`, select a golfer, confirm redirect to `/me` and profile displays correctly
- [x] 13.4 Call `GET /me` without a cookie, confirm 401
- [x] 13.5 Call `GET /me` with a valid `mock-golfer-id` cookie, confirm 200 with golfer profile and memberships
- [ ] 13.6 Confirm `/dev/login` and `/dev/golfers` return 404 when `AUTH_PROVIDER` is unset or not `mock` (requires restarting with a different env)
