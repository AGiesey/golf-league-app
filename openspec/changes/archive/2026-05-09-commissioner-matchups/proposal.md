## Why

Weeks exist in the schedule but carry no matchups — without them there is no "who am I playing this week" for golfers, no scoring surface, and no standings. This is the next blocker between season setup and actual gameplay.

## What Changes

- New commissioner UI page (or section under `/commissioner`) for managing a week's matchups: view all matchups in a week, create a new matchup between two teams, edit an existing matchup (swap teams), and delete a matchup
- New API endpoints for matchup CRUD under the `/commissioner` route group:
  - `GET /commissioner/season/matchups?weekId=<id>` — list matchups for a week
  - `POST /commissioner/season/matchups` — create a matchup
  - `PUT /commissioner/season/matchups/{matchupId}` — edit (swap teams)
  - `DELETE /commissioner/season/matchups/{matchupId}` — delete a matchup
- `Pairing` and `PairingSlot` rows are created and managed as internal plumbing behind every matchup; commissioners never interact with them directly
- `PairingSlot` rows are auto-filled from each team's current `TeamMembership` at matchup creation time (snapshot — later roster edits do not propagate)
- Edit regenerates `PairingSlot` rows from the new teams' current membership
- Delete is a hard delete of `Matchup` + its `Pairing` + all `PairingSlot` rows
- Lock: once any `Round` exists referencing a `PairingSlot` under a matchup's pairing, edit and delete are disabled for that matchup
- New named action `ManageMatchups` added to `docs/authorization.md` under Commissioner actions

## Capabilities

### New Capabilities

- `commissioner-matchups`: Commissioner UI and API to create, edit, and delete matchups within a regular week of their active season, including auto-managed Pairing and PairingSlot plumbing

### Modified Capabilities

- `commissioner-season-page`: The commissioner season page gains a navigation path to the matchup management view (week selection → matchup list)

## Impact

- **API** (`api/Program.cs`): 4 new endpoints under the commissioner route group
- **Data model**: No schema changes — `Matchup`, `Pairing`, `PairingSlot` all exist; `Pairing.TeeTime` stays nullable
- **Audit fields**: `Matchup` and `Pairing` carry `CreatedBy` / `UpdatedBy` per `data-model.md`; set on every write. `PairingSlot` is not in the audited set.
- **Docs**: `docs/authorization.md` updated to add `ManageMatchups`
- **Web** (`web/app/(app)/commissioner/`): New page/component for matchup management
