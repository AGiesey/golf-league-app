## Why

The `season-setup-frame` established the `/commissioner/season` tabbed shell, and `roster-tab` and `teams-tab` filled the Roster and Teams tabs. The Schedule tab remains a static placeholder. Commissioners have no in-app visibility into the weeks that make up their season — they cannot confirm the schedule has been set up or see upcoming dates. This change gives commissioners a read-only view of their season schedule.

## What Changes

- Add a `WeekType` enum to the `Week` model: `Regular`, `FunWeek`, `MakeupDay`
- Add a `Type` column to the `weeks` table (EF Core migration required, default `Regular`)
- Add `GET /commissioner/season/schedule` — returns all `Week` records for the active season ordered by `week_number`, each with `id`, `weekNumber`, `startDate`, and `type`
- Replace the tab=schedule placeholder in `SeasonTabs.tsx` with a `ScheduleTab` client component
- `ScheduleTab` shows an empty state when no weeks exist ("Your schedule hasn't been set up yet. Contact your course admin to get your weeks added.")
- `ScheduleTab` shows a read-only table (week number, date, type) when weeks exist
- No create, edit, or delete actions — the tab is entirely read-only

## Capabilities

### New Capabilities
- `schedule-tab`: Schedule API endpoint and the tab=schedule read-only UI

### Modified Capabilities
- `commissioner-season-page`: Schedule tab placeholder replaced with live `ScheduleTab` component (same pattern as roster-tab and teams-tab)

## Impact

- `api/Models/Week.cs` — add `WeekType` enum and `Type` property
- `api/Migrations/` — new migration adding `type` column to `weeks` table
- `api/Migrations/AppDbContextModelSnapshot.cs` — updated to include `Type`
- `api/Data/Configurations/WeekConfiguration.cs` — add column configuration for `Type`
- `api/Program.cs` — new `GET /commissioner/season/schedule` endpoint in commissioner route group
- `web/app/(app)/commissioner/season/ScheduleTab.tsx` — new client component
- `web/app/(app)/commissioner/season/SeasonTabs.tsx` — swap Schedule tab placeholder for `<ScheduleTab>`
