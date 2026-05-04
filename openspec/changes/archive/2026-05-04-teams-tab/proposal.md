## Why

The `season-setup-frame` established the `/commissioner/season` tabbed shell, and `roster-tab` filled the Roster tab. The Teams tab is still a static placeholder — commissioners cannot form teams in-app and the Teams setup requirement remains perpetually unmet until a SQL workaround is applied. This change gives commissioners the ability to pair members into teams directly from the browser.

## What Changes

- Add `GET /commissioner/season/teams` — returns all formed teams for the season (each with its two members) plus the pool of unassigned members
- Add `POST /commissioner/season/teams` — creates a new auto-named team and assigns exactly 2 members; rejects any request that does not supply exactly 2 `leagueMembershipId` values
- Add `DELETE /commissioner/season/teams/{teamId}` — disbands a team and returns both members to the unassigned pool; blocked when teams are locked
- Replace the tab=teams placeholder in `SeasonTabs.tsx` with a live `TeamsTab` client component
- `TeamsTab` renders two zones: an unassigned member pool and a list of formed teams
- A pair-picker lets the commissioner select two unassigned members and click "Create Team"; the new team appears immediately with its auto-generated name
- Each formed team shows a Disband button that fires `DELETE` and returns both members to the pool
- When teams are locked (any week in the season has a `StartDate` on or before today) the entire tab is read-only with a clear explanation
- Thread `membershipId` and `token` props through `SeasonTabs` to `TeamsTab` (mirroring the pattern from `RosterTable`)

## Capabilities

### New Capabilities
- `teams-tab`: Teams management API endpoints and the tab=teams UI — pair-picker, formed teams list, locked-season read-only state

### Modified Capabilities
- `commissioner-season-page`: Teams tab placeholder replaced with live `TeamsTab` component (same pattern as roster-tab applied to the Roster tab)

## Impact

- `api/Program.cs` — three new endpoints in the `/commissioner` route group
- `api/Models/` — no new models needed; `Team`, `TeamMembership`, and `Week` already exist
- `web/app/(app)/commissioner/season/TeamsTab.tsx` — new client component
- `web/app/(app)/commissioner/season/SeasonTabs.tsx` — swap Teams tab placeholder for `<TeamsTab>`; add `membershipId` and `token` props (already present from roster-tab)
- No database migrations required — all required tables (`teams`, `team_memberships`, `weeks`) were added in the `season-setup-frame` change
