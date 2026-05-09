## Context

The database already has `teams`, `team_memberships`, and `weeks` tables from earlier migrations. The API's model layer, DbContext, and commissioner route infrastructure were removed in a refactor, so they need to be re-established as part of this change. The `Matchup`, `Pairing`, and `PairingSlot` tables do not yet exist and require a new migration.

The web app has no commissioner pages at all — the matchup management UI is the first commissioner feature to land in the current codebase.

## Goals / Non-Goals

**Goals:**
- Re-add `Team`, `TeamMembership`, `Week` models, configurations, and `DbContext` registrations
- Add `Matchup`, `Pairing`, `PairingSlot` models, configurations, and a migration
- Re-establish the commissioner route group with its auth filter
- Deliver the 4 matchup API endpoints
- Deliver the commissioner matchup management UI (week selector → matchup list → create/edit/delete)
- Update `docs/authorization.md`

**Non-Goals:**
- Tee times on pairings
- Subs and score entry
- Auto-generated matchup schedules
- FunWeek / MakeupDay matchup support
- Rebuilding the commissioner season setup page (Roster / Teams / Schedule tabs)

## Decisions

### Commissioner auth filter on the route group

The `/commissioner` route group uses an `AddEndpointFilter` that:
1. Reads the golfer context established by `GolferContextMiddleware`
2. Looks up the `LeagueMembership` matching the `X-Membership-Id` request header, scoped to the authenticated golfer
3. Checks `IsCommissioner == true`
4. Stores the resolved membership in `HttpContext.Items["ActiveMembership"]` for handler use
5. Returns 401 if no golfer context, 403 if not a commissioner

This satisfies the authorization.md requirement ("policy attached to the route group, not inline checks in handlers") while staying within Minimal APIs — there is no ASP.NET Core policy framework in use at MVP, but the filter is the equivalent single enforcement point for commissioner routes.

The new `ManageMatchups` action is implicitly covered by the commissioner filter — any request to a commissioner endpoint that passes the filter is authorized. The named action in authorization.md documents the intent; no additional runtime check is needed beyond "is commissioner."

### Endpoints in a separate file via RouteGroupBuilder extension

To keep `Program.cs` readable as the API grows, commissioner endpoints live in `api/Endpoints/CommissionerEndpoints.cs` as an extension method (`MapCommissionerEndpoints`) called from `Program.cs`. This is a common Minimal APIs pattern for grouping related endpoints without controllers.

### One Pairing per Matchup, always

Every created matchup gets exactly one `Pairing` row. `TeeTime` is null. `PairingSlot` rows are inserted for every `TeamMembership` across both teams at the moment of creation. This keeps the data model fully populated even though the UI hides the Pairing concept entirely.

On edit (team swap), the existing `PairingSlot` rows for the matchup's pairing are hard-deleted and regenerated from the new teams' current memberships. The `Pairing` row itself is updated (not replaced) — this preserves its `CreatedBy` audit field.

### Lock check: Round existence on PairingSlots

A matchup is locked for edit/delete when `db.Rounds.Any(r => r.PairingSlot.PairingId == pairing.Id)` is true. This query is issued at the start of any edit or delete handler. Since the `rounds` table does not exist yet, the lock condition is never true in this change — but the check is wired in now so it works correctly once score entry lands.

### PairingSlot hard-deleted on matchup delete

Matchup delete cascade: hard-delete `PairingSlot` rows → hard-delete `Pairing` row → hard-delete `Matchup` row. `TeamMembership` rows are untouched. This mirrors the behavior described in the proposal and is safe because a locked matchup (has Rounds) cannot be deleted.

### Audit fields on Matchup and Pairing

Per `data-model.md`, `Matchup` and `Pairing` carry `CreatedBy` and `UpdatedBy` as `LeagueMembershipId` FKs. Both are set from the commissioner's active membership on every create and update. `PairingSlot` is not audited.

### Week list endpoint re-used from prior intent

The matchup UI needs to list a season's weeks (to let the commissioner pick a week). `GET /commissioner/season/schedule` returns weeks ordered by `week_number`. This endpoint is added alongside the matchup endpoints in `CommissionerEndpoints.cs` — it is the same query as before, just re-implemented in the new file structure.

Only `Regular` weeks produce matchups. The week list for the matchup picker can return all weeks; the UI filters to `Regular` type only when showing the "add matchup" control.

## Risks / Trade-offs

- **Snapshot PairingSlots**: Slots are taken from team memberships at creation time and do not update when the roster changes later. This is intentional — changing teams after a matchup is created is disruptive — but it means slots can reference members who were later removed from the team. Acceptable at MVP; score entry will validate against current membership when that feature lands.
- **Lock check references a future table**: The `rounds` table does not exist yet. EF Core will fail to build if the `Round` model/DbSet is referenced in a query. The lock check must use raw SQL or be stubbed as `false` until the Round model is introduced. Simplest approach: stub `isLocked = false` with a TODO comment, replaced when score entry lands.
- **No migration rollback strategy**: Matchup/Pairing/PairingSlot are net-new tables with no existing data. Rollback is a straightforward `DROP TABLE`.
