## 1. LeagueHeader

- [x] 1.1 Create `web/components/dashboard/LeagueHeader.tsx` — accepts `leagueName: string`, `seasonYear: number`, `isCommissioner: boolean`; renders a `Card` with league name title, "Season {year}" description, and conditional Commissioner `Badge`
- [x] 1.2 Replace all four inline Card blocks in `web/app/(app)/dashboard/page.tsx` with `<LeagueHeader />` and verify no visual change

## 2. ScoreStatusBadge

- [x] 2.1 Create `web/components/scorecard/ScoreStatusBadge.tsx` — accepts `slotCount: number`, `roundCount: number`; renders a `Badge` with the correct label and variant; export `nineLabel(nine: string): string` and `formatDate(iso: string): string` utilities from the same file
- [x] 2.2 Update `web/app/(app)/commissioner/scores/page.tsx` — remove local `statusPill`, `nineLabel`, `formatDate`; import and use `ScoreStatusBadge` and the shared utilities
- [x] 2.3 Update `web/app/(app)/commissioner/scores/[weekId]/page.tsx` — same removals and replacements as 2.2

## 3. MatchupFormDialog

- [x] 3.1 Create `web/app/(app)/commissioner/matchups/MatchupFormDialog.tsx` — uses `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `components/ui/dialog`; accepts all form props from `MatchupsClient`'s `FormState` plus team list, pairWarning, callbacks; renders Team A / Team B selects and the prior-pairing warning
- [x] 3.2 Update `web/app/(app)/commissioner/matchups/MatchupsClient.tsx` — remove the inline `fixed inset-0` div modal (lines ~389–472); render `<MatchupFormDialog />` instead; confirm state ownership stays in `MatchupsClient`

## 4. MatchupListItem

- [x] 4.1 Create `web/app/(app)/commissioner/matchups/MatchupListItem.tsx` — accepts `matchup: Matchup`, `deleting: string | null`, `onEdit`, `onDelete`; renders team names, member names, and edit/delete/lock controls
- [x] 4.2 Update `MatchupsClient.tsx` — replace the per-matchup `<li>` block inside the `.map()` with `<MatchupListItem />`

## 5. TeamCard

- [ ] 5.1 Create `web/app/(app)/commissioner/season/TeamCard.tsx` — accepts `team`, `isLocked`, `editing`, `saving`, `disbanding`, and the four edit/disband callbacks; renders the team card in display mode or inline-rename mode as appropriate
- [ ] 5.2 Update `web/app/(app)/commissioner/season/TeamsTab.tsx` — replace the per-team `<li>` block inside the teams `.map()` with `<TeamCard />`

## 6. ScorecardPanel

- [x] 6.1 Create `web/components/scorecard/ScorecardPanel.tsx` — accepts `holes`, `slots`, `scoreOffset`, optional `label`, and optional `entryButton` render prop; renders a `Card` wrapping `Scorecard`, with optional `CardHeader` for the label
- [x] 6.2 Update `web/components/scorecard/ScorecardView.tsx` — remove `renderScorecard` local function; replace both call sites with `<ScorecardPanel />`; move `buildSlotScores` to `ScorecardPanel.tsx` if it makes the import chain cleaner, otherwise keep it in `ScorecardView.tsx`
