## Why

The `/commissioner/season?tab=roster` tab was scaffolded as a placeholder by the season-setup-frame change. This proposal fills in that tab with real content: a read-only member list where the commissioner can optionally record a handicap per member. Without this, commissioners have no in-app view of their roster and no way to enter handicaps before the season starts.

## What Changes

- **New API endpoint**: `GET /commissioner/season/roster` — returns all active `LeagueMembership` records for the active season with golfer details and handicap
- **New API endpoint**: `PATCH /commissioner/season/roster/{leagueMembershipId}/handicap` — updates a single member's handicap; commissioner-only
- **Replace tab=roster placeholder** in `web/app/(app)/commissioner/season/SeasonTabs.tsx` with a real roster table component
- The roster table shows: first name, last name, email, handicap (inline input if null, plain text if set), commissioner badge per member
- No add/remove member actions — that is a course admin concern and is explicitly out of scope

## Capabilities

### New Capabilities

- `roster-tab`: The tab=roster content on `/commissioner/season` — roster table with member list and inline handicap entry, backed by two commissioner API endpoints

### Modified Capabilities

- `commissioner-season-page`: The tab body for Roster changes from a placeholder to live content; the API surface and routing structure are unchanged

## Impact

- `api/Program.cs` — two new routes added to the existing `/commissioner` route group
- `api/Models/LeagueMembership.cs` — no schema changes; `Handicap` column already exists
- `web/app/(app)/commissioner/season/SeasonTabs.tsx` — Roster tab body replaced with real component
- New web components: `RosterTable.tsx` (client, handles inline handicap input and PATCH calls)
- No migration required — `league_memberships.handicap` already exists
- No changes to `SeasonSetupStatus` computation — handicap is not a setup gate
