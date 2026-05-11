## ADDED Requirements

### Requirement: MatchupListItem component
A `MatchupListItem` component SHALL be created at `web/app/(app)/commissioner/matchups/MatchupListItem.tsx`. It renders a single matchup row — team names, member names, and edit/delete/lock controls.

Props:
- `matchup: Matchup` — the matchup to render (`matchupId`, `teamA`, `teamB`, `isLocked`)
- `deleting: string | null` — the matchupId currently being deleted, or null
- `onEdit: (matchup: Matchup) => void`
- `onDelete: (matchupId: string) => void`

#### Scenario: Locked matchup shows lock icon only
- **WHEN** `matchup.isLocked` is true
- **THEN** only a lock icon is shown in the controls area; no edit or delete buttons are rendered

#### Scenario: Unlocked matchup shows edit and delete controls
- **WHEN** `matchup.isLocked` is false
- **THEN** edit and delete buttons are rendered

#### Scenario: Delete spinner shown while deleting
- **WHEN** `deleting` equals `matchup.matchupId`
- **THEN** the delete button shows a spinner and is disabled

#### Scenario: Team names and members displayed
- **WHEN** `MatchupListItem` renders
- **THEN** it shows "Team A vs Team B" and the member names for both teams

### Requirement: MatchupsClient uses MatchupListItem
`MatchupsClient.tsx` SHALL render `<MatchupListItem />` for each matchup in the list rather than rendering the full per-matchup block inline. State and callbacks remain in `MatchupsClient`.

#### Scenario: MatchupsClient no longer contains inline per-matchup JSX
- **WHEN** `MatchupsClient.tsx` is read
- **THEN** the matchup list `.map()` delegates to `MatchupListItem`, not an inline `<li>` block
