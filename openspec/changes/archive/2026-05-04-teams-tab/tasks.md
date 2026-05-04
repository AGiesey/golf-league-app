## 1. API — Teams endpoints

- [x] 1.1 Add `GET /commissioner/season/teams` to the commissioner route group in `api/Program.cs`: query active `Team` records for the season joined with their two `TeamMembership`/`Golfer` records; query unassigned members (active `LeagueMembership` with no `TeamMembership`); compute `isLocked` (`db.Weeks.Any(w => w.SeasonId == seasonId && w.StartDate <= today)`); return `{ isLocked, teams: [{ teamId, name, members: [{leagueMembershipId, firstName, lastName}] }], unassigned: [{leagueMembershipId, firstName, lastName}] }`
- [x] 1.2 Add `POST /commissioner/season/teams` to the commissioner route group: accept `{ memberIds: Guid[] }`, validate length == 2, validate both IDs belong to the active season and have no existing `TeamMembership`, check not locked, compute next team name (`"Team {count + 1}"`), create `Team` and two `TeamMembership` records, return HTTP 201 with the created team object; return 400 for validation failures, 409 for lock or double-assignment
- [x] 1.3 Add `DELETE /commissioner/season/teams/{teamId}` to the commissioner route group: verify team belongs to the active season, check not locked, explicitly delete the two `TeamMembership` records then the `Team`, return HTTP 204; return 404 if not found, 409 if locked
- [x] 1.4 Add supporting records `CreateTeamRequest(Guid[] MemberIds)` to the records section of `api/Program.cs`

## 2. Web — TeamsTab component

- [x] 2.1 Create `web/app/(app)/commissioner/season/TeamsTab.tsx` as a `"use client"` component: accepts `membershipId: string` and `token: string` as props, fetches `GET /commissioner/season/teams` on mount with `X-Membership-Id` and `Authorization` headers, holds `teams`, `unassigned`, `isLocked` in state
- [x] 2.2 Implement the unassigned pool zone: renders each unassigned member as a checkable row (checkbox + "Last, First" label); when `isLocked` is `true`, render the list without checkboxes (read-only)
- [x] 2.3 Implement the pair-picker: a "Create Team" button enabled only when exactly 2 members are checked; on click fires `POST /commissioner/season/teams` with the two selected `leagueMembershipId` values; show a loading state (disabled button) during the request; on success update state to move both members from `unassigned` into a new team entry; on error revert selection and show a toast
- [x] 2.4 Implement the formed teams list: renders each team with its name and both member names; when `isLocked` is `false`, each team shows a Disband button that fires `DELETE /commissioner/season/teams/{teamId}` on click; on success remove team from list and add both members back to `unassigned`; on error show a toast; show a loading state on the Disband button during the request
- [x] 2.5 Implement the locked-state banner: when `isLocked` is `true`, render a notice (e.g., using a Card with amber/info styling) explaining that teams are locked because the season has started; omit pair-picker and Disband buttons in this state

## 3. Web — Wire TeamsTab into SeasonTabs

- [x] 3.1 Update `web/app/(app)/commissioner/season/SeasonTabs.tsx`: import `TeamsTab`, replace the Teams tab placeholder content with `<TeamsTab membershipId={membershipId} token={token} />`

## 4. Verify

- [x] 4.1 Navigate to `/commissioner/season?tab=teams` as commissioner — confirm unassigned pool shows all members and teams list is empty (or shows existing teams)
- [x] 4.2 Select exactly 2 members and click "Create Team" — confirm team appears in the list with auto-name "Team N" and both members leave the unassigned pool
- [x] 4.3 Click Disband on a team — confirm both members return to the unassigned pool and the team disappears
- [x] 4.4 Confirm "Create Team" button is disabled when 0, 1, or 3+ members are checked
- [x] 4.5 With all members assigned, confirm the unassigned pool shows an "all assigned" message and the Teams setup requirement shows as met in the status banner
- [x] 4.6 Simulate locked state (add a week with a past start date via SQL) — confirm the tab renders read-only with the locked notice and no pair-picker or Disband buttons
- [x] 4.7 Confirm `POST /commissioner/season/teams` returns 400 when supplying 1 or 3 memberIds
- [x] 4.8 Confirm `DELETE /commissioner/season/teams/{id}` returns 403 when called with a non-commissioner token
- [x] 4.9 Confirm the Roster and Schedule tabs show their content without regression
