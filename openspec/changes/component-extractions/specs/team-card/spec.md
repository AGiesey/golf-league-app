## ADDED Requirements

### Requirement: TeamCard component
A `TeamCard` component SHALL be created at `web/app/(app)/commissioner/season/TeamCard.tsx`. It renders a single team's card — including the team name in either display or inline-edit mode — and a Disband button when the season is not locked.

Props:
- `team: Team` — the team to render (`teamId`, `name`, `members`)
- `isLocked: boolean`
- `editing: { teamId: string; name: string } | null` — the current edit state from the parent
- `saving: string | null` — the teamId currently being saved, or null
- `disbanding: string | null` — the teamId currently being disbanded, or null
- `onStartEdit: (team: Team) => void`
- `onNameChange: (name: string) => void`
- `onSaveEdit: () => void`
- `onCancelEdit: () => void`
- `onDisband: (team: Team) => void`

#### Scenario: Display mode shows team name and members
- **WHEN** `editing` is null or refers to a different team
- **THEN** the card shows the team name, a rename button, and the member list

#### Scenario: Edit mode shows inline input
- **WHEN** `editing.teamId` matches this team's id
- **THEN** an input field with the current name value is shown along with save and cancel buttons

#### Scenario: Save button disabled while saving
- **WHEN** `saving` equals this team's id
- **THEN** the save button shows a spinner and is disabled

#### Scenario: Disband button hidden when locked
- **WHEN** `isLocked` is true
- **THEN** no Disband button is rendered

#### Scenario: Disband shows spinner while in progress
- **WHEN** `disbanding` equals this team's id
- **THEN** the disband button shows a spinner

### Requirement: TeamsTab uses TeamCard
`TeamsTab.tsx` SHALL render `<TeamCard />` for each team in the formed teams list, passing its local state and handlers as props. The editing and saving state remains owned by `TeamsTab`.

#### Scenario: TeamsTab no longer contains per-team inline JSX block
- **WHEN** `TeamsTab.tsx` is read
- **THEN** the per-team `<li>` block is delegated to `TeamCard`, not rendered inline in the `.map()` call
