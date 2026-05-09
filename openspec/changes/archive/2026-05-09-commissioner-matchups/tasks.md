## 1. Data Model — Restore Existing Models

- [x] 1.1 Re-add `Team` model (`api/Models/Team.cs`) with `Id`, `SeasonId`, `Name`, `ArchivedAt`, `CreatedAt`, `UpdatedAt`, and `Season` + `TeamMemberships` nav properties
- [x] 1.2 Re-add `TeamMembership` model (`api/Models/TeamMembership.cs`) with `Id`, `TeamId`, `LeagueMembershipId`, `CreatedAt`, `UpdatedAt`, and nav properties
- [x] 1.3 Re-add `Week` model (`api/Models/Week.cs`) with `Id`, `SeasonId`, `WeekNumber`, `StartDate`, `WeekType` enum + `Type` property, `CreatedAt`, `UpdatedAt`, and nav properties
- [x] 1.4 Re-add `TeamConfiguration` (`api/Data/Configurations/TeamConfiguration.cs`)
- [x] 1.5 Re-add `TeamMembershipConfiguration` (`api/Data/Configurations/TeamMembershipConfiguration.cs`)
- [x] 1.6 Re-add `WeekConfiguration` (`api/Data/Configurations/WeekConfiguration.cs`) including `HasConversion<string>()` for `WeekType` and `HasDefaultValue(WeekType.Regular)`
- [x] 1.7 Register `DbSet<Team>`, `DbSet<TeamMembership>`, `DbSet<Week>` on `AppDbContext`

## 2. Data Model — New Matchup Entities

- [x] 2.1 Add `Matchup` model (`api/Models/Matchup.cs`) with `Id`, `WeekId`, `TeamAId`, `TeamBId`, `CreatedBy`, `UpdatedBy`, `CreatedAt`, `UpdatedAt`, and nav properties (`Week`, `TeamA`, `TeamB`, `Pairing`)
- [x] 2.2 Add `Pairing` model (`api/Models/Pairing.cs`) with `Id`, `MatchupId`, `TeeTime` (nullable `TimeOnly`), `CreatedBy`, `UpdatedBy`, `CreatedAt`, `UpdatedAt`, and nav properties (`Matchup`, `PairingSlots`)
- [x] 2.3 Add `PairingSlot` model (`api/Models/PairingSlot.cs`) with `Id`, `PairingId`, `LeagueMembershipId`, `CreatedAt`, `UpdatedAt`, and nav properties
- [x] 2.4 Add `MatchupConfiguration` (`api/Data/Configurations/MatchupConfiguration.cs`) — FK to Week (Restrict), FK to TeamA (Restrict), FK to TeamB (Restrict), `CreatedBy`/`UpdatedBy` as nullable FK to LeagueMembership
- [x] 2.5 Add `PairingConfiguration` (`api/Data/Configurations/PairingConfiguration.cs`) — FK to Matchup (Restrict), unique index on `MatchupId` (one pairing per matchup), `CreatedBy`/`UpdatedBy` as nullable FK to LeagueMembership
- [x] 2.6 Add `PairingSlotConfiguration` (`api/Data/Configurations/PairingSlotConfiguration.cs`) — FK to Pairing (Restrict), FK to LeagueMembership (Restrict)
- [x] 2.7 Register `DbSet<Matchup>`, `DbSet<Pairing>`, `DbSet<PairingSlot>` on `AppDbContext`

## 3. Migration — Matchup Tables

- [x] 3.1 Write `api/Migrations/<timestamp>_AddMatchupPairingSlot.cs` — `Up` creates `matchups`, `pairings`, `pairing_slots` tables with correct columns, FKs, and indexes; `Down` drops them in reverse order
- [x] 3.2 Write `api/Migrations/<timestamp>_AddMatchupPairingSlot.Designer.cs` — full `BuildTargetModel` reflecting all entities including restored Team/TeamMembership/Week and new Matchup/Pairing/PairingSlot
- [x] 3.3 Update `api/Migrations/AppDbContextModelSnapshot.cs` — add Matchup, Pairing, PairingSlot entity blocks and re-add Team, TeamMembership, Week entity blocks to reflect current model

## 4. API — Commissioner Route Group

- [x] 4.1 Create `api/Endpoints/CommissionerEndpoints.cs` with a `MapCommissionerEndpoints(this WebApplication app)` extension method that creates the `/commissioner` route group with the commissioner auth filter (reads `X-Membership-Id`, looks up `LeagueMembership`, checks `IsCommissioner`, stores in `HttpContext.Items["ActiveMembership"]`, returns 401/403 on failure)
- [x] 4.2 Call `app.MapCommissionerEndpoints()` from `Program.cs`

## 5. API — Commissioner Endpoints

- [x] 5.1 Add `GET /commissioner/season/schedule` — returns weeks for the active season ordered by `WeekNumber`, each with `id`, `weekNumber`, `startDate`, `type`
- [x] 5.2 Add `GET /commissioner/season/matchups?weekId=<id>` — validates week belongs to active season, returns matchups with team names, member names, and `isLocked` (stub `isLocked = false` until Round model exists)
- [x] 5.3 Add `POST /commissioner/season/matchups` — validates week is Regular, teams are different, both in active season, both have members, neither already scheduled that week; creates Matchup + Pairing + PairingSlots; returns 201
- [x] 5.4 Add `PUT /commissioner/season/matchups/{matchupId}` — validates matchup in active season, not locked, new teams pass same validations (allowing the matchup being edited to be excluded from the "already scheduled" check); hard-deletes existing PairingSlots; updates Pairing in place; creates new PairingSlots; returns 200
- [x] 5.5 Add `DELETE /commissioner/season/matchups/{matchupId}` — validates matchup in active season, not locked; hard-deletes PairingSlots, Pairing, Matchup; returns 204
- [x] 5.6 Add request records (`CreateMatchupRequest`, `UpdateMatchupRequest`) to `CommissionerEndpoints.cs`

## 6. Web — Commissioner Matchup Page

- [x] 6.1 Create `web/app/(app)/commissioner/matchups/page.tsx` — server component; reads active league context; redirects non-commissioners to `/dashboard`; fetches weeks via `GET /commissioner/season/schedule`; passes data to client component
- [x] 6.2 Create `web/app/(app)/commissioner/matchups/MatchupsTab.tsx` — `"use client"` component; receives `weeks`, `membershipId`, `token`; manages selected week state (defaulting to `weekId` query param if present); fetches matchups on week change
- [x] 6.3 Add week selector UI — dropdown or tab strip showing Regular weeks by week number and date; non-Regular weeks shown but disabled or omitted
- [x] 6.4 Add matchup list — renders each matchup as a card or row showing "Team A vs Team B" with member names; shows Edit and Delete buttons on unlocked matchups; locked matchups show a lock indicator instead
- [x] 6.5 Add empty state — shown when no matchups exist for the selected week; includes a "Create Matchup" button
- [x] 6.6 Add create/edit form — select Team A and Team B from dropdowns filtered to teams in the season; on create, POST to API and optimistically add to list; on edit, PUT to API and update list in place; uses `sonner` toast on error
- [x] 6.7 Add delete — clicking Delete fires `DELETE /commissioner/season/matchups/{id}`; removes from list on success; uses `sonner` toast on error
- [x] 6.8 Wire `weekId` URL deep-linking — on week change, update URL with `?weekId=<id>` via `router.replace` so the selection survives navigation

## 7. Web — Commissioner Season Page Entry Point

- [x] 7.1 Create `web/app/(app)/commissioner/season/page.tsx` — minimal server component that checks `isCommissioner`, redirects non-commissioners to `/dashboard`, and renders a link/button to `/commissioner/matchups`

## 8. Docs

- [x] 8.1 Add `ManageMatchups` to the Commissioner actions list in `docs/authorization.md`
- [x] 8.2 Rebuild the API to confirm it compiles and the migration applies cleanly
