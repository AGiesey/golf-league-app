## Context

The `season-setup-frame` added the `weeks` table and the `Week` model. The existing `Week` model has `Id`, `SeasonId`, `WeekNumber`, `StartDate`, `CreatedAt`, `UpdatedAt` — no `Type` column. This change adds `Type` as a `WeekType` enum column (stored as a string in Postgres via EF Core value conversion) with a default of `Regular`. The weeks table already supports the Schedule setup requirement (`ComputeSetupStatus` checks `db.Weeks.CountAsync(w => w.SeasonId == seasonId)`); that computation is unchanged.

The tab is fully read-only. The commissioner cannot add, edit, or remove weeks — that is the course admin's domain.

`SeasonTabs.tsx` already receives `membershipId` and `token` as props (threaded through in `roster-tab`), so wiring `ScheduleTab` follows the same pattern as `RosterTable` and `TeamsTab`.

## Goals / Non-Goals

**Goals:**
- Add `WeekType` enum (`Regular`, `FunWeek`, `MakeupDay`) to the `Week` model and database
- Expose `GET /commissioner/season/schedule` returning weeks ordered by `week_number`
- Render a read-only `ScheduleTab` component: empty state when no weeks, table when weeks exist
- Wire `ScheduleTab` into `SeasonTabs.tsx`

**Non-Goals:**
- Tee time blocks (course-defined window and spacing) — deferred (see Decisions)
- Commissioner-facing schedule generation — deferred (see Decisions)
- Any write actions on weeks (create, edit, delete) — course admin only
- Changing the Schedule setup requirement computation

## Decisions

### WeekType stored as string, not integer

EF Core stores `WeekType` as a `varchar` column using a value converter (`HasConversion<string>()`). This keeps the database human-readable and avoids silent breakage if enum integer values shift.

Alternative considered: store as `int`. Rejected — opaque in SQL queries and fragile under reordering.

### GET /commissioner/season/schedule in the commissioner route group

Follows the same authorization pattern as the other two schedule endpoints. The commissioner route group filter validates `X-Membership-Id` and `IsCommissioner` before the handler runs. No new auth infrastructure needed.

### ScheduleTab is a "use client" component, fetches on mount

Mirrors `RosterTable` and `TeamsTab`. Props: `membershipId: string`, `token: string`. No server-side prefetch — keeps the server component clean and consistent with the established pattern.

### Empty state over a zero-row table

When no weeks exist, the component renders a guidance message rather than an empty table. This is more informative — the commissioner knows what action to take (contact the course admin) rather than seeing a blank grid.

### Deferred: tee time blocks

Each week will eventually need a start time, end time, and tee time interval. This requires a separate `tee_time_blocks` table or additional columns on `weeks`. Deferred until the scoring/matchup phase, which is when tee times are actually needed.

### Deferred: commissioner schedule generation

Auto-generating a season's weeks from a start date and week count is a course-admin or commissioner workflow. Deferred — the current model assumes the course admin inserts weeks via SQL or a future admin panel.

## Risks / Trade-offs

- **Migration written by hand** — `dotnet ef` is not available; the migration `.cs`, `.Designer.cs`, and snapshot update must all be written manually. Risk: a missed field causes EF Core to silently skip the migration. → Mitigation: follow the same pattern as `AddTeamsAndWeeks` migration exactly.
- **Type column is nullable-compatible at DB level** — existing rows (if any) will receive `NULL` after migration until a `DEFAULT` or `UPDATE` is applied. → Mitigation: set a default value of `'Regular'` in the migration's `AddColumn` call so existing rows are covered.
