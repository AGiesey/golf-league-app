## ADDED Requirements

### Requirement: MatchupFormDialog component
A `MatchupFormDialog` component SHALL be created at `web/app/(app)/commissioner/matchups/MatchupFormDialog.tsx`. It SHALL use the `Dialog` primitive from `components/ui/dialog` (not a raw `<div>` overlay) and accept the following props:
- `open: boolean`
- `isEditing: boolean` — true when editing an existing matchup, false when creating
- `teams: Team[]` — the full team list for the select options
- `teamAId: string`
- `teamBId: string`
- `submitting: boolean`
- `pairWarning: number | null` — week number of the prior pairing, or null if none
- `onTeamAChange: (id: string) => void`
- `onTeamBChange: (id: string) => void`
- `onSubmit: () => void`
- `onClose: () => void`

#### Scenario: Dialog title reflects mode
- **WHEN** `isEditing` is true
- **THEN** the dialog title reads "Edit Matchup"

#### Scenario: Dialog title for create mode
- **WHEN** `isEditing` is false
- **THEN** the dialog title reads "Create Matchup"

#### Scenario: Prior-pairing warning shown
- **WHEN** `pairWarning` is a non-null week number
- **THEN** a warning message indicating the teams already played in that week is shown

#### Scenario: Submit button disabled until both teams selected
- **WHEN** either `teamAId` or `teamBId` is an empty string
- **THEN** the submit button is disabled

#### Scenario: Team A options exclude Team B selection
- **WHEN** `teamBId` is set to a specific team
- **THEN** that team does not appear in the Team A select options

#### Scenario: Team B options exclude Team A selection
- **WHEN** `teamAId` is set to a specific team
- **THEN** that team does not appear in the Team B select options

#### Scenario: Dialog uses Dialog primitive
- **WHEN** `MatchupFormDialog` renders
- **THEN** it uses `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `components/ui/dialog` — not a raw fixed-position div overlay

### Requirement: MatchupsClient uses MatchupFormDialog
`MatchupsClient.tsx` SHALL render `<MatchupFormDialog />` in place of the inline div-based modal. The form state managed in `MatchupsClient` is passed as props; `MatchupsClient` retains ownership of that state.

#### Scenario: MatchupsClient no longer contains inline modal markup
- **WHEN** `MatchupsClient.tsx` is read
- **THEN** there is no `fixed inset-0` div overlay or inline team-select form; those render in `MatchupFormDialog`
