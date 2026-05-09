## Context

The `season-setup-frame` proposal added `teams`, `team_memberships`, and `weeks` tables with all necessary FK constraints (including a unique constraint on `team_memberships.league_membership_id` that prevents double-assignment). No migration is needed here. `SeasonTabs.tsx` already receives `membershipId` and `token` as props (threaded through in the `roster-tab` change), so wiring `TeamsTab` follows the same pattern as `RosterTable`.

The course admin pre-populates the roster via SQL. The commissioner's sole write action on this tab is pairing members into teams of exactly 2, and disbanding existing pairs before the season locks.

## Goals / Non-Goals

**Goals:**
- Expose `GET /commissioner/season/teams` returning formed teams, their members, unassigned members, and a `isLocked` flag
- Expose `POST /commissioner/season/teams` to create a team by assigning exactly 2 members
- Expose `DELETE /commissioner/season/teams/{teamId}` to disband a team and return members to the pool (blocked when locked)
- Render `TeamsTab` with unassigned pool, pair-picker, and formed teams list
- Enforce read-only state when any week's `StartDate` is on or before today
- Wire `TeamsTab` into `SeasonTabs.tsx` replacing the current placeholder

**Non-Goals:**
- Team renaming (deferred — see Decisions)
- Teams with more or fewer than 2 members — strictly pairs at MVP
- Editing a locked season's teams via any admin override (out of scope)
- Drag-and-drop pair assignment

## Decisions

### Team locking computed server-side and returned in GET /teams

`isLocked` is computed in the API: `db.Weeks.Any(w => w.SeasonId == seasonId && w.StartDate <= today)`. It is returned as a top-level field in the `GET /commissioner/season/teams` response. The client does not need to fetch weeks separately or compute this itself.

Alternative considered: compute lock state client-side from a separate weeks fetch. Rejected — adds a second network call and requires the client to know locking rules.

### GET /commissioner/season/teams response shape

```json
{
  "isLocked": false,
  "teams": [
    {
      "teamId": "...",
      "name": "Team 1",
      "members": [
        { "leagueMembershipId": "...", "firstName": "...", "lastName": "..." },
        { "leagueMembershipId": "...", "firstName": "...", "lastName": "..." }
      ]
    }
  ],
  "unassigned": [
    { "leagueMembershipId": "...", "firstName": "...", "lastName": "..." }
  ]
}
```

Returning both teams and unassigned in one call lets the client render the complete state from a single fetch. This is fine given the small set size (low tens of members).

### Auto-naming: sequential by existing count

On `POST`, the new team name is `"Team {count + 1}"` where `count` is the current number of non-archived `Team` records for the season at the time of creation. This means disbanded teams leave gaps ("Team 1", "Team 3" after Team 2 is disbanded). Acceptable at MVP — team names are cosmetic labels until a rename feature is added.

Alternative considered: use MAX(sequence) + 1. Rejected — more complex and doesn't meaningfully improve the UX at this scale.

### POST body: `memberIds` array, server validates length == 2

`POST /commissioner/season/teams` accepts `{ "memberIds": ["uuid1", "uuid2"] }`. The API rejects requests where `memberIds.Length != 2` with HTTP 400. The unique constraint on `team_memberships.league_membership_id` guards against double-assignment at the DB level; the API returns 409 if a constraint violation is caught.

### DELETE cascades via explicit ORM delete

`DELETE /commissioner/season/teams/{teamId}` explicitly deletes the two `TeamMembership` records before deleting the `Team`, rather than relying on DB cascade. This keeps the cascade behavior visible in code and avoids EF Core tracking issues. The operation is rejected with 409 when `isLocked`.

### TeamsTab is a "use client" component, fetches on mount

Mirrors `RosterTable`. The component owns its fetch and state. Props: `membershipId: string`, `token: string`.

Pair-picker state (which two members are selected) is local component state — two checkboxes. The "Create Team" button is enabled only when exactly 2 members are checked.

### Deferred: team renaming

Teams are auto-named and names are display-only at MVP. A future rename proposal can add `PATCH /commissioner/season/teams/{teamId}/name` and an inline edit affordance without breaking this data model.

## Risks / Trade-offs

- **Concurrent writes from two commissioner sessions** — two browsers could simultaneously POST with overlapping members. The unique constraint on `team_memberships.league_membership_id` prevents double-assignment at the DB level; the API catches the constraint violation and returns 409. The client shows a toast and refetches. → Acceptable; single-commissioner assumption holds at MVP.
- **Name gaps after disband** — Team 1, Team 3 after Team 2 is disbanded. → Accepted deferred decision; clearly documented in UI if needed.
- **Lock check is not real-time on the client** — if a week's start date passes while the tab is open, the UI won't update until the next fetch. → Acceptable; the server always enforces the lock on write attempts.
