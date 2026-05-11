## 1. API — Unscheduled Teams Endpoint

- [x] 1.1 Add `GET /commissioner/season/matchups/unscheduled-teams?weekId=<id>` to `api/Program.cs` — validates week belongs to active season; returns all active (non-archived) teams in the season whose `Id` does not appear as `TeamAId` or `TeamBId` in any matchup for that week; returns `[{ teamId, name }]`

## 2. API — Pairing History Endpoint

- [x] 2.1 Add `GET /commissioner/season/pairing-history` to `api/Program.cs` — queries `matchups` joined to `weeks` filtered to prior regular weeks of the active season (all weeks with `Type = Regular`); groups by `(LEAST(team_a_id, team_b_id), GREATEST(team_a_id, team_b_id))` using EF raw SQL; returns `[{ teamAId, teamBId, count }]` (canonical order: teamAId < teamBId)

## 3. Web — Fetch Scheduling Aids in MatchupsClient

- [x] 3.1 Add `unscheduledTeams` state (`{ teamId: string; name: string }[] | null`) and `pairingHistory` state (`{ teamAId: string; teamBId: string; count: number }[] | null`) to `MatchupsClient.tsx`
- [x] 3.2 Fetch `GET /commissioner/season/matchups/unscheduled-teams?weekId=<id>` in the same `useEffect` that fetches matchups when `selectedWeekId` changes; store result in `unscheduledTeams`
- [x] 3.3 Fetch `GET /commissioner/season/pairing-history` in the same `useEffect`; store result in `pairingHistory`
- [x] 3.4 Re-fetch all three (matchups, unscheduled teams, pairing history) inside `submitForm` on success so the UI stays current after a create or edit

## 4. Web — Unscheduled Teams UI

- [x] 4.1 Add an unscheduled-teams section above the matchup list (only when `isRegularWeek`); render each entry as a clickable chip showing the team name
- [x] 4.2 Show "All teams scheduled" text in place of chips when `unscheduledTeams` is an empty array
- [x] 4.3 Extend `openCreateForm` to accept an optional `preselectedTeamId?: string` parameter; when provided, set `teamAId` to that value in the form state
- [x] 4.4 Wire chip click to call `openCreateForm(team.teamId)` so the create dialog opens with that team pre-selected as Team A

## 5. Web — Pairing History Matrix UI

- [x] 5.1 Add a `PairingHistoryMatrix` sub-component (inline in `MatchupsClient.tsx` or a separate file in the `matchups/` directory) that accepts `teams: Team[]` and `history: { teamAId: string; teamBId: string; count: number }[]`; renders a grid with team names on both axes
- [x] 5.2 Build a lookup map from the history array keyed by canonical pair `\`${min}-${max}\`` for O(1) cell lookups
- [x] 5.3 Render each cell: diagonal cells blank; cells with count > 0 show the number; cells with count 0 show "—"
- [x] 5.4 Wrap the matrix in a collapsible container (toggle button with chevron icon); default state is collapsed
- [x] 5.5 Render the matrix section below the matchup list; pass `teams` (from props) and `pairingHistory` (from state) to the sub-component; show a loading skeleton or suppress the section while `pairingHistory` is null

## 6. Web — Inline Duplicate-Pair Warning

- [x] 6.1 Add a `priorMatchWeek` derived value inside the create/edit form render: given `form.teamAId` and `form.teamBId`, look up the canonical pair in `pairingHistory`; if count > 0, find the earliest prior week number by also fetching or tracking week metadata — simplest approach: include the earliest week number in the pairing-history response so no additional fetch is needed
- [x] 6.2 Update the pairing-history API response to include `firstWeekNumber: int` (the `WeekNumber` of the earliest week in which this pair played) alongside `count`
- [x] 6.3 When both `form.teamAId` and `form.teamBId` are set and a history entry exists for the pair, render a small inline notice inside the dialog (e.g., "Already played — Week 3") between the Team B selector and the action buttons; use amber/warning styling
- [x] 6.4 Confirm the warning disappears when either team is changed to clear the duplicate condition
